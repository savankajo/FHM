'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { getUgcAccess, moderateAndRecordText } from '@/lib/safety-service';

export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };
    const access = await getUgcAccess(session.userId);
    if (!access.allowed) return { error: access.error };

    const name = String(formData.get('name') || '').trim();
    const email = (formData.get('email') as string)?.toLowerCase();
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!email) return { error: 'Email is required' };
    if (!name || name.length > 100) return { error: 'Name must be between 1 and 100 characters' };
    const nameModeration = await moderateAndRecordText({ text: name, surface: 'profile_name', userId: session.userId });
    if (!nameModeration.allowed) return { error: 'That profile name does not meet our Community Guidelines.' };

    const data: any = { name, email, phone };

    if (password) {
        if (password.length < 6) return { error: 'Password must be at least 6 characters' };
        if (password !== confirmPassword) return { error: 'Passwords do not match' };
        data.password = await hash(password, 10);
    }

    try {
        await prisma.user.update({
            where: { id: session.userId },
            data
        });
        revalidatePath('/profile');
        return { success: true };
    } catch (e: any) {
        if (e.code === 'P2002') return { error: 'Email already exists' };
        return { error: 'Failed to update profile' };
    }
}

export async function updatePassword(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');
    if (password.length < 6) return { error: 'Password must be at least 6 characters' };
    if (password !== confirmPassword) return { error: 'Passwords do not match' };

    await prisma.user.update({
        where: { id: session.userId },
        data: { password: await hash(password, 10) },
    });
    return { success: true };
}

export async function updatePrivacyName(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };
    const access = await getUgcAccess(session.userId);
    if (!access.allowed) return { error: access.error };
    const name = String(formData.get('name') || '').trim();
    if (!name || name.length > 100) return { error: 'Name must be between 1 and 100 characters' };
    const nameModeration = await moderateAndRecordText({ text: name, surface: 'profile_name', userId: session.userId });
    if (!nameModeration.allowed) return { error: 'That profile name does not meet our Community Guidelines.' };
    await prisma.user.update({ where: { id: session.userId }, data: { name } });
    revalidatePath('/profile');
    revalidatePath('/profile/privacy');
    return { success: true };
}
