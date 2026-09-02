import Link from 'next/link';
import NotificationPreferences from '../profile/settings/notification-preferences';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  const notifications = await prisma.notification.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' }, take: 100 });
  await prisma.notification.updateMany({ where: { userId: session.userId, readAt: null }, data: { readAt: new Date() } });
  return <main className="notifications-page"><header className="page-header"><Link href="/profile" className="page-back-btn" aria-label="Back to Profile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg></Link><div><p className="page-kicker">Stay connected</p><h1 className="page-title">Notifications</h1></div></header>
    <div className="notification-preferences-panel"><NotificationPreferences /></div>
    {notifications.length ? <div className="notification-list">{notifications.map(item => <Link key={item.id} href={item.href || '#'} className={`notification-card ${item.readAt ? '' : 'unread'}`}><span className={`notification-type ${item.type.toLowerCase()}`}>{item.type === 'INVITATION' ? '✉' : item.type === 'REMINDER' ? '◷' : '●'}</span><span><strong>{item.title}</strong><p>{item.body}</p><time>{item.createdAt.toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time></span></Link>)}</div>
    : <section className="designed-empty"><div className="designed-empty-icon">◇</div><h2>You’re all caught up</h2><p>Event reminders, team invitations, and church messages will appear here.</p></section>}
  </main>;
}
