import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function teamVisual(name: string) {
  const value = name.toLowerCase();
  if (/worship|music|praise/.test(value)) return { icon: '♪', gradient: 'linear-gradient(135deg,#2a0e04,#C7511F)' };
  if (/youth|young|teen/.test(value)) return { icon: '⚡', gradient: 'linear-gradient(135deg,#0a1628,#2563eb)' };
  if (/prayer|intercession/.test(value)) return { icon: '✦', gradient: 'linear-gradient(135deg,#1a0830,#7c3aed)' };
  if (/children|kids/.test(value)) return { icon: '★', gradient: 'linear-gradient(135deg,#0a2010,#16a34a)' };
  if (/media|tech|av/.test(value)) return { icon: '▶', gradient: 'linear-gradient(135deg,#0a1a2a,#0284c7)' };
  return { icon: '♙', gradient: 'linear-gradient(135deg,#3a1a08,#8B6914)' };
}

function MinistryIntroduction({ signedIn }: { signedIn: boolean }) {
  return <section className="ministry-introduction">
    <div className="ministry-intro-mark" aria-hidden="true">✦</div>
    <p className="page-kicker">Growing together</p>
    <h1>A place to belong and serve</h1>
    <p>Father’s Heart Ministry helps people hear God’s voice, grow in faith, and experience meaningful change through prayer, encouragement, teaching, and community.</p>
    <div className="ministry-values"><span>Connect</span><span>Grow</span><span>Serve</span></div>
    {signedIn ? <p className="ministry-assignment-note">You haven’t been assigned to a ministry team yet. Please contact a church administrator when you are ready to get connected.</p> : <Link href="/login" className="btn btn-primary btn-sm">Sign in to view your teams</Link>}
  </section>;
}

export default async function TeamsPage({ searchParams }: { searchParams?: Promise<{ notice?: string; signin?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const session = await getSession();
  const teams = session ? await prisma.team.findMany({
    where: session.role === 'ADMIN' ? undefined : { members: { some: { id: session.userId } } },
    include: { _count: { select: { members: true } } },
    orderBy: { name: 'asc' }
  }) : [];
  const notice = resolvedSearchParams?.notice === 'not-assigned' ? 'This team is not assigned to your account.' : resolvedSearchParams?.signin === 'required' ? 'Sign in to view the teams assigned to you.' : '';

  return <main className="teams-page">
    <div className="teams-hero"><div className="teams-hero-overlay"/><div className="teams-hero-content"><div className="teams-hero-title">Ministry Teams</div><div className="teams-hero-sub">Connected in faith, purpose, and service</div></div></div>
    {notice && <div className="team-access-notice" role="status">{notice}</div>}
    {!session || teams.length === 0 ? <MinistryIntroduction signedIn={Boolean(session)} /> : <>
      <div className="chat-section-head"><div><h1 className="chat-section-label">{session.role === 'ADMIN' ? 'All ministry teams' : 'My Teams'}</h1><p>{session.role === 'ADMIN' ? 'Manage and open every team.' : 'Only teams assigned to you are shown here.'}</p></div><span className="chat-section-chip">{teams.length}</span></div>
      <div className="teams-list">{teams.map(team => { const visual = teamVisual(team.name); return <Link key={team.id} href={`/chat/${team.id}`} className="team-card"><div className="team-card-image" style={{background:visual.gradient}} aria-hidden="true"><span style={{fontSize:32}}>{visual.icon}</span></div><div className="team-card-body"><h2 className="team-card-name">{team.name}</h2><p className="team-card-desc">{team.description || 'Connect and serve together in ministry.'}</p><div className="team-card-meta">{team._count.members} {team._count.members === 1 ? 'member' : 'members'} · Open team chat</div></div><div className="team-card-arrow" aria-hidden="true">›</div></Link>;})}</div>
    </>}
  </main>;
}
