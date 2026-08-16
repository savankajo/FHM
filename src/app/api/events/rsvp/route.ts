import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Please sign in to register.' }, { status: 401 });
  const { eventId, status } = await request.json();
  if (!['REGISTERED', 'CANCELLED'].includes(status)) return NextResponse.json({ error: 'Invalid RSVP status.' }, { status: 400 });
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { teams: { select: { id: true } } } });
  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  const isTeamEvent = event.visibility === 'TEAM' || Boolean(event.teamScope);
  if (!isTeamEvent) return NextResponse.json({ error: 'Public meetings do not require registration.' }, { status: 400 });
  if (session.role !== 'ADMIN') {
    const eligible = await prisma.team.findFirst({ where: { id: { in: event.teams.map(team => team.id) }, members: { some: { id: session.userId } } }, select: { id: true } });
    if (!eligible) return NextResponse.json({ error: 'This registration is only available to invited team members.' }, { status: 403 });
  }
  const rsvp = await prisma.rsvp.upsert({ where: { eventId_userId: { eventId, userId: session.userId } }, create: { eventId, userId: session.userId, status }, update: { status } });
  if (status === 'REGISTERED') await prisma.invitation.updateMany({ where: { eventId, userId: session.userId }, data: { respondedAt: new Date() } });
  return NextResponse.json({ rsvp });
}
