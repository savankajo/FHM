import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { CURRENT_TERMS_VERSION } from '@/lib/terms';
import { moderateAndRecordText } from '@/lib/safety-service';


// Manual validation for now to avoid dependency hell if user hasn't installed zod
export async function POST(request: Request) {
    try {
        const body = await request.json();
        let { email, password, name, phone, termsAccepted, termsVersion } = body;
        if (email) email = email.toLowerCase();

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        if (termsAccepted !== true || termsVersion !== CURRENT_TERMS_VERSION) {
            return NextResponse.json({ error: 'You must explicitly accept the current Terms of Use before creating an account.' }, { status: 428 });
        }
        name = String(name).trim();
        if (name.length > 100) return NextResponse.json({ error: 'Name must be 100 characters or fewer.' }, { status: 400 });
        const nameModeration = await moderateAndRecordText({ text: name, surface: 'registration_profile_name' });
        if (!nameModeration.allowed) {
            return NextResponse.json({ error: 'That profile name does not meet our Community Guidelines. Please choose another name.' }, { status: 422 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await hashPassword(password);

        // Create user
        // First user is ADMIN, others are MEMBER by default
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? 'ADMIN' : 'MEMBER';

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role,
                termsAcceptedVersion: CURRENT_TERMS_VERSION,
                termsAcceptedAt: new Date(),
                termsAcceptances: { create: { version: CURRENT_TERMS_VERSION, method: 'pre_auth_registration' } },
            },
        });

        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                termsAccepted: true,
                termsVersion: CURRENT_TERMS_VERSION,
            },
        });

        // Log them in immediately
        setSessionCookie(response, createSessionToken(user.id, user.role), request);
        return response;
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
