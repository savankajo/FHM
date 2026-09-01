import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { blockUserFromMessage, createMessageReport, getUgcAccess } from '@/lib/safety-service';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const access = await getUgcAccess(session.userId);
  if (!access.allowed) return NextResponse.json({ error: access.error }, { status: access.status });

  try {
    const { action, messageId, userId, reason, details } = await request.json();
    if (typeof messageId !== 'string') return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    if (action === 'report') {
      const report = await createMessageReport({ reporterId: session.userId, messageId, reason, details, reportedUserId: userId });
      return NextResponse.json({ success: true, reportId: report.id, message: 'Your report was received and added to the protected moderation queue.' });
    }
    if (action === 'block' && typeof userId === 'string' && userId !== session.userId) {
      const { report } = await blockUserFromMessage({ blockerId: session.userId, messageId, blockedId: userId, reason, details });
      return NextResponse.json({ success: true, reportId: report.id, message: 'The user was blocked, their content was hidden, and a safety report was sent to the moderation team.' });
    }
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'UNKNOWN';
    const status = code === 'FORBIDDEN' ? 403 : code === 'CONTENT_NOT_FOUND' ? 404 : code.includes('SELF') ? 400 : 500;
    return NextResponse.json({ error: status === 500 ? 'The safety action could not be completed. Please try again.' : 'This content cannot be reported or blocked.' }, { status });
  }
}
