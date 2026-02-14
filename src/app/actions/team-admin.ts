'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function addTeamMember(teamId: string, email: string) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { error: 'User not found' };
    }

    // Check if already in team
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { members: true }
    });

    if (team?.members.some(m => m.id === user.id)) {
        return { error: 'User already in team' };
    }

    await prisma.team.update({
        where: { id: teamId },
        data: {
            members: { connect: { id: user.id } }
        }
    });

    revalidatePath(`/admin/teams/${teamId}`);
    return { success: true };
}

export async function removeTeamMember(teamId: string, userId: string) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    await prisma.team.update({
        where: { id: teamId },
        data: {
            members: { disconnect: { id: userId } }
        }
    });

    revalidatePath(`/admin/teams/${teamId}`);
    return { success: true };
}

export async function deleteService(serviceId: string, teamId: string) {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.service.delete({
            where: { id: serviceId }
        });
        revalidatePath(`/teams/${teamId}`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete service' };
    }
}
