import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dispatchModerationNotification, performModeratorAction, reviewPendingVoice, type ModeratorAction } from '@/lib/safety-service';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
const ACTIONS: Array<{ value: ModeratorAction; label: string }> = [
  { value: 'DISMISS', label: 'Dismiss report' },
  { value: 'REMOVE_CONTENT', label: 'Remove content' },
  { value: 'WARN_USER', label: 'Warn user' },
  { value: 'SUSPEND_USER', label: 'Suspend user for 7 days and remove content' },
  { value: 'BAN_USER', label: 'Permanently ban user and remove content' },
  { value: 'RESTORE_CONTENT', label: 'Restore content' },
];

async function moderateReport(formData: FormData) {
  'use server';
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return;
  const action = String(formData.get('action')) as ModeratorAction;
  if (!ACTIONS.some(item => item.value === action)) return;
  await performModeratorAction({ reportId: String(formData.get('reportId')), moderatorId: session.userId, action, note: String(formData.get('note') || '') });
  revalidatePath('/admin/reports');
}
async function reviewVoice(formData: FormData) {
  'use server';
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return;
  await reviewPendingVoice({ messageId: String(formData.get('messageId')), moderatorId: session.userId, approve: formData.get('decision') === 'approve', note: String(formData.get('note') || '') });
  revalidatePath('/admin/reports');
}

async function retryNotification(formData: FormData) {
  'use server';
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return;
  await dispatchModerationNotification(String(formData.get('reportId')));
  revalidatePath('/admin/reports');
}

function timeRemaining(deadline: Date) {
  const milliseconds = deadline.getTime() - Date.now();
  if (milliseconds <= 0) return `OVERDUE by ${Math.ceil(Math.abs(milliseconds) / 3_600_000)}h`;
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m remaining`;
}

function messageContent(text: string, contentType: string) {
  if (contentType === 'VOICE') {
    try {
      const payload = JSON.parse(text.replace(/^__FHM_CHAT__/, ''));
      return <audio controls preload="metadata" src={payload.audio} style={{ width: '100%', maxWidth: 420 }} />;
    } catch { return <p>Voice evidence could not be decoded.</p>; }
  }
  if (contentType === 'POLL') {
    try {
      const payload = JSON.parse(text.replace(/^__FHM_CHAT__/, ''));
      return <p>{payload.question} — {payload.options?.map((option: { label: string }) => option.label).join(' / ')}</p>;
    } catch { return <p>Poll evidence could not be decoded.</p>; }
  }
  return <p className="moderation-evidence">“{text}”</p>;
}

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/');
  const [reports, pendingVoice, counts] = await Promise.all([
    prisma.chatReport.findMany({ orderBy: [{ status: 'asc' }, { deadlineAt: 'asc' }], take: 100, include: { reporter: { select: { name: true, email: true } }, message: { include: { user: { select: { name: true, email: true, accountStatus: true } }, team: { select: { name: true } } } } } }),
    prisma.chatMessage.findMany({ where: { contentType: 'VOICE', moderationStatus: 'PENDING', expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'asc' }, include: { user: { select: { name: true, email: true } }, team: { select: { name: true } } } }),
    prisma.chatReport.groupBy({ by: ['reportedUserId'], _count: { _all: true } }),
  ]);
  const reportCounts = new Map(counts.map(item => [item.reportedUserId, item._count._all]));
  const openReports = reports.filter(report => report.status === 'OPEN' || report.status === 'UNDER_REVIEW');
  const resolvedReports = reports.filter(report => report.status === 'DISMISSED' || report.status === 'ACTIONED').slice(0, 30);

  return <main className="legal-page moderation-queue"><Link href="/admin">← Admin</Link><p className="page-kicker">Protected · administrators only</p><h1>Safety &amp; Moderation Queue</h1><p>Valid objectionable-content reports require human review and action within 24 hours. Email delivery status is shown here; failed alerts must be retried and escalated operationally.</p><section><h2>Open reports ({openReports.length})</h2>{openReports.length === 0 ? <div className="settings-card moderation-card"><strong>No open reports</strong></div> : openReports.map(report => { const urgent = report.deadlineAt.getTime() - Date.now() <= 2 * 3_600_000; return <article key={report.id} className={`settings-card moderation-card${urgent ? ' urgent' : ''}`}><header><div><span className="page-kicker">{report.source === 'USER_BLOCK' ? 'Automatic block report' : 'User report'} · {report.contentType} · {report.status}</span><h3>{report.reason}</h3></div><strong>{timeRemaining(report.deadlineAt)}</strong></header><dl><div><dt>Report ID</dt><dd>{report.id}</dd></div><div><dt>Submitted</dt><dd>{report.createdAt.toLocaleString()}</dd></div><div><dt>Team</dt><dd>{report.message.team.name}</dd></div><div><dt>Reporter</dt><dd>{report.reporter.name} ({report.reporter.email})</dd></div><div><dt>Reported user</dt><dd>{report.message.user.name} ({report.message.user.email}) · {report.message.user.accountStatus}</dd></div><div><dt>Previous reports</dt><dd>{reportCounts.get(report.reportedUserId) || 1}</dd></div><div><dt>Notification</dt><dd>{report.notificationStatus} · {report.notificationAttempts} attempt(s){report.notificationError ? ` · ${report.notificationError}` : ''}</dd></div></dl>{report.details && <p><strong>Reporter details:</strong> {report.details}</p>}<div><strong>Preserved evidence</strong>{messageContent(report.message.text, report.contentType)}</div>{report.notificationStatus === 'FAILED' && <form action={retryNotification}><input type="hidden" name="reportId" value={report.id} /><button className="btn" type="submit">Retry developer alert</button></form>}<form action={moderateReport} className="moderation-action-form"><input type="hidden" name="reportId" value={report.id} /><label>Moderator action<select name="action" required defaultValue="REMOVE_CONTENT">{ACTIONS.filter(item => item.value !== 'RESTORE_CONTENT').map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Resolution note<textarea name="note" required maxLength={2000} placeholder="Record what was reviewed and why this action is appropriate." /></label><button className="btn btn-primary" type="submit">Record action</button></form></article>; })}</section><section><h2>Voice messages awaiting pre-publication review ({pendingVoice.length})</h2><p>These messages are visible only to their sender until an authorized moderator approves them.</p>{pendingVoice.length === 0 ? <div className="settings-card moderation-card"><strong>No voice messages awaiting review</strong></div> : pendingVoice.map(message => <article className="settings-card moderation-card" key={message.id}><h3>{message.user.name} · {message.team.name}</h3><p>{message.createdAt.toLocaleString()}</p>{messageContent(message.text, 'VOICE')}<form action={reviewVoice} className="moderation-action-form"><input type="hidden" name="messageId" value={message.id} /><label>Review note<textarea name="note" required maxLength={2000} placeholder="Document the review decision." /></label><div className="moderation-buttons"><button className="btn btn-primary" name="decision" value="approve" type="submit">Approve and publish</button><button className="btn btn-destructive" name="decision" value="remove" type="submit">Reject and preserve audit</button></div></form></article>)}</section><section><h2>Recent resolved reports</h2>{resolvedReports.length === 0 ? <p>No resolved reports.</p> : resolvedReports.map(report => <article className="settings-card moderation-card" key={report.id}><header><div><span className="page-kicker">{report.status}</span><h3>{report.reason}</h3></div><span>{report.resolvedAt?.toLocaleString()}</span></header><p><strong>Action:</strong> {report.moderatorAction || 'None'} · <strong>Note:</strong> {report.resolutionNote || 'No note'}</p>{report.message.moderationStatus === 'REMOVED' && <form action={moderateReport} className="moderation-action-form"><input type="hidden" name="reportId" value={report.id} /><input type="hidden" name="action" value="RESTORE_CONTENT" /><label>Restoration note<textarea name="note" required maxLength={2000} /></label><button className="btn" type="submit">Restore content</button></form>}</article>)}</section></main>;
}
