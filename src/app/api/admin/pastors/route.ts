import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { DEFAULT_PASTORS, PASTOR_PROFILE_IDS, pastorInitials } from '@/data/pastors';

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function cleanImageUrl(value: unknown) {
  const imageUrl = cleanText(value, 2048);
  if (!imageUrl) return null;
  try {
    const parsed = new URL(imageUrl);
    return parsed.protocol === 'https:' ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!await canManage(session?.userId, session?.role, 'media', 'edit')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const id = cleanText(body?.id, 80);
  if (!PASTOR_PROFILE_IDS.includes(id as typeof PASTOR_PROFILE_IDS[number])) {
    return NextResponse.json({ error: 'Unknown pastor profile.' }, { status: 400 });
  }

  const name = cleanText(body?.name, 100);
  const role = cleanText(body?.role, 100);
  const imageUrl = cleanImageUrl(body?.imageUrl);
  if (!name || !role) return NextResponse.json({ error: 'Name and role are required.' }, { status: 400 });
  if (imageUrl === undefined) return NextResponse.json({ error: 'Photo URL must be a valid HTTPS address.' }, { status: 400 });

  const defaults = DEFAULT_PASTORS.find(pastor => pastor.id === id)!;
  try {
    const pastor = await prisma.pastorProfile.upsert({
      where: { id },
      create: { id, name, role, imageUrl, initials: pastorInitials(name), sortOrder: defaults.sortOrder },
      update: { name, role, imageUrl, initials: pastorInitials(name), sortOrder: defaults.sortOrder },
      select: { id: true, name: true, role: true, imageUrl: true, initials: true, sortOrder: true },
    });
    revalidatePath('/');
    revalidatePath('/admin/pastors');
    return NextResponse.json({ pastor });
  } catch (error) {
    console.error('Pastor profile update failed:', error);
    return NextResponse.json({ error: 'Could not save the pastor profile.' }, { status: 500 });
  }
}
