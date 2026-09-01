import type { Config } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const VERIFIED_SUPPORT_CONTACT = 'Media@fathersheartministry.ca';

export default async () => {
  const databaseUrl = Netlify.env.get('DATABASE_URL');
  const resendKey = Netlify.env.get('RESEND_API_KEY');
  const alertTo = Netlify.env.get('MODERATION_ALERT_TO') || VERIFIED_SUPPORT_CONTACT;
  const alertFrom = Netlify.env.get('MODERATION_ALERT_FROM') || Netlify.env.get('PASSWORD_RESET_FROM');
  const appUrl = (Netlify.env.get('NEXT_PUBLIC_APP_URL') || 'https://fhmapp.netlify.app').replace(/\/$/, '');
  if (!databaseUrl || !resendKey || !alertFrom || !alertTo) throw new Error('Moderation escalation environment is incomplete.');

  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  const resend = new Resend(resendKey);
  const now = new Date();
  const escalationWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  try {
    const reports = await prisma.chatReport.findMany({
      where: {
        status: { in: ['OPEN', 'UNDER_REVIEW'] },
        OR: [
          { deadlineAt: { lte: escalationWindow }, escalatedAt: null },
          { notificationStatus: 'FAILED', notificationAttempts: { lt: 5 } },
        ],
      },
      orderBy: { deadlineAt: 'asc' },
      take: 20,
      select: { id: true, reason: true, deadlineAt: true },
    });

    for (const report of reports) {
      try {
        const result = await resend.emails.send({
          from: alertFrom,
          to: alertTo,
          subject: 'Urgent: FHM safety report requires review',
          text: `A protected FHM safety report requires attention.\n\nReport ID: ${report.id}\nReason: ${report.reason}\nDeadline: ${report.deadlineAt.toISOString()}\nQueue: ${appUrl}/admin/reports\n\nFor privacy, message content and reporter identity are not included.`,
        });
        if (result.error) throw new Error(result.error.message);
        await prisma.chatReport.update({ where: { id: report.id }, data: { notificationStatus: 'SENT', notificationAttempts: { increment: 1 }, notificationLastAt: now, notificationError: null, escalatedAt: now } });
        console.log(`moderation escalation delivered report=${report.id}`);
      } catch (error) {
        await prisma.chatReport.update({ where: { id: report.id }, data: { notificationStatus: 'FAILED', notificationAttempts: { increment: 1 }, notificationLastAt: now, notificationError: error instanceof Error ? error.message.slice(0, 500) : 'Escalation delivery failed' } });
        console.error(`moderation escalation failed report=${report.id}`);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
};

export const config: Config = {
  schedule: '*/15 * * * *',
};
