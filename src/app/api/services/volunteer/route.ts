import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { serviceId } = await request.json();

    try {
        const service = await prisma.service.findUnique({
            where: { id: serviceId },
            include: { volunteers: true }
        });

        if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

        if (service.maxVolunteers && service.volunteers.length >= service.maxVolunteers) {
            return NextResponse.json({ error: 'Volunteer slots full' }, { status: 400 });
        }

        await prisma.service.update({
            where: { id: serviceId },
            data: {
                volunteers: {
                    connect: { id: session.userId }
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to volunteer' }, { status: 500 });
    }
}
