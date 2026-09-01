import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import VolunteerButton from './volunteer-button';

export const dynamic = 'force-dynamic';

export default async function TeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect('/teams?signin=required');
  const team = await prisma.team.findFirst({
    where: session.role === 'ADMIN' ? { id } : { id, members: { some: { id: session.userId } } },
    include: { services: { where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } }, orderBy: { date: 'asc' }, include: { volunteers: true } } }
  });
  if (!team) redirect('/teams?notice=not-assigned');

  return <main className="team-detail-page">
    <header className="page-header"><Link href="/teams" className="page-back-btn" aria-label="Back to My Teams">←</Link><div><h1 className="page-title">{team.name}</h1><p className="page-kicker">Your ministry team</p></div></header>
    {team.description && <section className="detail-card" style={{margin:'0 20px 18px',padding:18}}><p style={{margin:0,color:'var(--text-secondary)',lineHeight:1.6}}>{team.description}</p></section>}
    <div style={{padding:'0 20px 12px'}}><span className="detail-section-label">Upcoming services</span></div>
    {team.services.length ? <div className="service-list">{team.services.map(service => { const joined=service.volunteers.some(user=>user.id===session.userId); const spots=service.maxVolunteers ? service.maxVolunteers-service.volunteers.length : null; return <article className="service-card" key={service.id}><div className="service-info"><h2 className="service-title">{service.title}</h2><p className="service-time">{service.date.toLocaleString('en-CA',{weekday:'long',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'})}</p>{service.description&&<p>{service.description}</p>}</div><VolunteerButton serviceId={service.id} isVolunteering={joined} disabled={spots===0&&!joined} serviceTitle={service.title} serviceDate={service.date}/></article>;})}</div> : <section className="designed-empty"><div className="designed-empty-icon">◇</div><h2>No upcoming service assignments</h2><p>Your team schedule will appear here when an administrator adds it.</p></section>}
    <div className="team-chat-btn-wrap"><Link href={`/chat/${team.id}`} className="team-chat-btn">Message Team</Link></div>
  </main>;
}
