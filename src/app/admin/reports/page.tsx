import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function resolveReport(formData: FormData) {
  'use server';
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return;
  const id = String(formData.get('id'));
  await prisma.chatReport.update({ where: { id }, data: { resolvedAt: new Date() } });
  revalidatePath('/admin/reports');
}

async function removeMessage(formData: FormData) {
  'use server';
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return;
  const messageId = String(formData.get('messageId'));
  await prisma.chatMessage.delete({ where: { id: messageId } });
  revalidatePath('/admin/reports');
}

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/');
  const reports = await prisma.chatReport.findMany({ where: { resolvedAt: null }, orderBy: { createdAt: 'asc' }, include: { reporter: { select: { name: true, email: true } }, message: { include: { user: { select: { name: true, email: true } }, team: { select: { name: true } } } } } });
  return <div className="legal-page"><Link href="/admin">← Admin</Link><h1>Safety Reports</h1><p>Review reports promptly and document follow-up outside the app when member safety may be at risk.</p>{reports.length === 0 ? <p>No unresolved reports.</p> : reports.map(report => <section key={report.id} className="settings-card" style={{ padding: 16, margin: '16px 0' }}><strong>{report.reason}</strong><p>Team: {report.message.team.name}</p><p>Message from {report.message.user.name} ({report.message.user.email}): “{report.message.text}”</p><p>Reported by {report.reporter.name} ({report.reporter.email}) on {report.createdAt.toLocaleString()}</p><div style={{ display: 'flex', gap: 10 }}><form action={removeMessage}><input type="hidden" name="messageId" value={report.messageId}/><button className="btn btn-destructive">Delete message</button></form><form action={resolveReport}><input type="hidden" name="id" value={report.id}/><button className="btn">Mark resolved</button></form></div></section>)}</div>;
}
