import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
const defaults = { reminders: true, invitations: true, messages: true };
export async function GET() { const session = await getSession(); if (!session) return NextResponse.json({error:'Unauthorized'},{status:401}); const user = await prisma.user.findUnique({where:{id:session.userId},select:{notificationPreferences:true}}); return NextResponse.json({preferences:{...defaults,...(user?.notificationPreferences as object || {})}}); }
export async function PUT(request: Request) { const session = await getSession(); if (!session) return NextResponse.json({error:'Unauthorized'},{status:401}); const body=await request.json(); const preferences={reminders:body.reminders!==false,invitations:body.invitations!==false,messages:body.messages!==false}; await prisma.user.update({where:{id:session.userId},data:{notificationPreferences:preferences}}); return NextResponse.json({preferences}); }
