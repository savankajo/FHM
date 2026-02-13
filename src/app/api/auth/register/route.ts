import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';


// Manual validation for now to avoid dependency hell if user hasn't installed zod
export async function POST(request: Request) {
    try {
        const body = await request.json();
        let { email, password, name, phone } = body;
        if (email) email = email.toLowerCase();

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
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
            },
        });

        // Log them in immediately
        await createSession(user.id, user.role);

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
