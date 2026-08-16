import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateGoogleCalendarLink, generateICalendarLink } from '@/lib/calendar';
import CalendarView, { AppCalendarEvent } from './calendar-view';

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
        ...(session ? [{ teams: { some: { id: { in: teamIds } } } }, { invitations: { some: { userId: session.userId } } }] : [])
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
    endTime: saturdayEnd,
    recurrenceRule: 'FREQ=WEEKLY;BYDAY=SA',
    reminderMinutesBefore: 120
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

    <div className="saturday-calendar-actions">
      <div><strong>Saturday Meeting</strong><p>Every Saturday, 1:00 PM · reminder at 11:00 AM</p></div>
      <div className="event-card-actions">
        <a className="btn btn-primary btn-sm" href={generateICalendarLink(saturdayCalendar)} download="fhm-saturday-meeting.ics">Add recurring reminder</a>
        <a className="btn btn-secondary btn-sm" href={generateGoogleCalendarLink(saturdayCalendar)} target="_blank" rel="noreferrer">Google Calendar</a>
      </div>
    </div>
    <CalendarView events={events.flatMap(event => {
      const locations = Array.isArray(event.locations) ? event.locations as Array<{name?: string; startTime?: string}> : [];
      const start = event.startTime || (locations[0]?.startTime ? new Date(locations[0].startTime) : null);
      if (!start) return [];
      return [{ id: event.id, title: event.title, startTime: start.toISOString(), location: event.location || locations[0]?.name || 'Location shared in event details', scope: event.visibility === 'TEAM' || event.teamScope ? 'TEAM' : 'PUBLIC' } satisfies AppCalendarEvent];
    })} />
    {!session && <section className="guest-calendar-note"><strong>Part of a ministry team?</strong><p>Sign in to see private team invitations and registration.</p><Link href="/login" className="btn btn-secondary btn-sm">Sign in</Link></section>}
  </main>;
}
