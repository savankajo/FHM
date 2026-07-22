'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { canManage } from '@/lib/permissions';

export async function createLiveLink(formData: FormData) {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'live', 'add')) return { error: 'Unauthorized' };

    const url = formData.get('url') as string;
    const expiryHours = parseInt(formData.get('expiryHours') as string);

    if (!url) return { error: 'URL is required' };
    if (!expiryHours || expiryHours <= 0) return { error: 'Valid expiry hours required' };

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    try {
        // Optional: clear old active links
        await prisma.liveLink.deleteMany({});

        await prisma.liveLink.create({
            data: {
                url,
                expiresAt,
            },
        });
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to create live link' };
    }
}

export async function deleteLiveLink() {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'live', 'remove')) return { error: 'Unauthorized' };

    try {
        await prisma.liveLink.deleteMany({});
        revalidatePath('/');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to delete live link' };
    }
}
