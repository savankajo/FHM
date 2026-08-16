import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateGoogleCalendarLink, generateICalendarLink } from '@/lib/calendar';

export const dynamic = 'force-dynamic';

function nextSaturdayAtOne() {
  const now = new Date();
  const result = new Date(now);
  const days = (6 - now.getDay() + 7) % 7;
  result.setDate(now.getDate() + days);
  result.setHours(13, 0, 0, 0);
  if (result <= now) result.setDate(result.getDate() + 7);
  return result;
}

function CalendarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
}

export default async function CalendarPage() {
  const session = await getSession();
  const userTeams = session ? await prisma.team.findMany({ where: { members: { some: { id: session.userId } } }, select: { id: true } }) : [];
  const teamIds = userTeams.map(team => team.id);
  const events = await prisma.event.findMany({
    where: session?.role === 'ADMIN' ? undefined : {
      OR: [
        { visibility: 'PUBLIC' },
        { teamScope: null },
        ...(session ? [{ teams: { some: { id: { in: teamIds } } } }] : [])
      ]
    },
    include: { teams: { select: { id: true, name: true } } },
    orderBy: [{ startTime: 'asc' }, { createdAt: 'desc' }]
  });

  const saturdayStart = nextSaturdayAtOne();
  const saturdayEnd = new Date(saturdayStart.getTime() + 2 * 60 * 60 * 1000);
  const saturdayCalendar = {
    title: 'Saturday Meeting — FHM Church',
    description: 'Our weekly public church gathering. Everyone is welcome.',
    location: '10167 148 Street, Surrey, BC',
    startTime: saturdayStart,
    endTime: saturdayEnd
  };

  return <main className="events-page">
    <div className="page-header">
      <div><p className="page-kicker">Church life</p><h1 className="page-title">Calendar</h1></div>
      {session?.role === 'ADMIN' && <Link href="/admin/events/new" className="btn btn-primary btn-sm" aria-label="Create a new calendar event">+ New</Link>}
    </div>

    <section className="calendar-intro" aria-labelledby="upcoming-events">
      <div className="calendar-intro-icon"><CalendarIcon /></div>
      <div><h2 id="upcoming-events">Upcoming meetings</h2><p>Public gatherings are visible to everyone. Sign in to see events for your teams.</p></div>
    </section>

    <div className="events-list">
      <article className="event-card calendar-event-card">
        <div className="event-card-date-chip calendar-date-chip"><span className="event-date-month">{saturdayStart.toLocaleString('en-CA', { month: 'short' }).toUpperCase()}</span><span className="event-date-day">{saturdayStart.getDate()}</span></div>
        <div className="event-card-body">
          <div className="event-scope-badge public">Public · Weekly</div>
          <h2 className="event-card-title">Saturday Meeting</h2>
          <p className="event-card-meta">Every Saturday · 1:00 PM–3:00 PM</p>
          <p className="event-card-meta">10167 148 Street, Surrey, BC</p>
          <p className="event-card-desc">Our weekly church gathering. Everyone is welcome—no registration required.</p>
          <div className="event-card-actions">
            <a className="btn btn-primary btn-sm" href={generateICalendarLink(saturdayCalendar)} download="fhm-saturday-meeting.ics">Add to Calendar</a>
            <a className="btn btn-secondary btn-sm" href={generateGoogleCalendarLink(saturdayCalendar)} target="_blank" rel="noreferrer">Google Calendar</a>
          </div>
        </div>
      </article>

      {events.map(event => {
        const locations = Array.isArray(event.locations) ? event.locations as Array<{name?: string; startTime?: string; endTime?: string}> : [];
        const start = event.startTime || (locations[0]?.startTime ? new Date(locations[0].startTime) : null);
        const visibility = event.visibility === 'TEAM' || event.teamScope ? 'TEAM' : 'PUBLIC';
        return <Link key={event.id} href={`/events/${event.id}`} className="event-card calendar-event-card">
          <div className="event-card-date-chip calendar-date-chip"><span className="event-date-month">{start ? start.toLocaleString('en-CA', { month: 'short' }).toUpperCase() : 'DATE'}</span><span className="event-date-day">{start ? start.getDate() : '—'}</span></div>
          <div className="event-card-body">
            <div className={`event-scope-badge ${visibility === 'PUBLIC' ? 'public' : 'team'}`}>{visibility === 'PUBLIC' ? 'Public' : `Team · ${event.teams.map(team => team.name).join(', ') || 'Members'}`}</div>
            <h2 className="event-card-title">{event.title}</h2>
            {start && <p className="event-card-meta">{start.toLocaleString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>}
            <p className="event-card-meta">{event.location || locations[0]?.name || 'Location shared in event details'}</p>
            {event.description && <p className="event-card-desc">{event.description}</p>}
            <span className="event-card-link">{visibility === 'TEAM' ? 'View & register' : 'View details'} →</span>
          </div>
        </Link>;
      })}
    </div>

    {!session && <section className="guest-calendar-note"><strong>Part of a ministry team?</strong><p>Sign in to see private team invitations and registration.</p><Link href="/login" className="btn btn-secondary btn-sm">Sign in</Link></section>}
  </main>;
}
