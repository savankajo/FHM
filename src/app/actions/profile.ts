'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { hash } from 'bcrypt';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
    const session = await getSession();
    if (!session) return { error: 'Unauthorized' };

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!email) return { error: 'Email is required' };

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
