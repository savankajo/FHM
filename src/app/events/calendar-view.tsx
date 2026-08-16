'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export interface AppCalendarEvent {
  id: string;
  title: string;
  startTime: string;
  location: string;
  scope: 'PUBLIC' | 'TEAM';
}

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function keyFor(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function CalendarView({ events }: { events: AppCalendarEvent[] }) {
  const [month, setMonth] = useState(() => { const value = new Date(); value.setDate(1); value.setHours(12, 0, 0, 0); return value; });
  const today = new Date();
  const cells = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1, 12))];
  }, [month]);
  const eventMap = useMemo(() => {
    const map = new Map<string, AppCalendarEvent[]>();
    for (const event of events) {
      const start = new Date(event.startTime);
      const key = keyFor(start);
      map.set(key, [...(map.get(key) || []), event]);
    }
    for (const date of cells) {
      if (date?.getDay() === 6) {
        const key = keyFor(date);
        map.set(key, [{ id: 'saturday', title: 'Saturday Meeting', startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 13).toISOString(), location: '10167 148 Street, Surrey, BC', scope: 'PUBLIC' }, ...(map.get(key) || [])]);
      }
    }
    return map;
  }, [cells, events]);
  const visibleEvents = cells.flatMap(date => date ? eventMap.get(keyFor(date)) || [] : []).sort((a, b) => +new Date(a.startTime) - +new Date(b.startTime));
  const move = (amount: number) => setMonth(current => new Date(current.getFullYear(), current.getMonth() + amount, 1, 12));

  return <>
    <section className="month-calendar" aria-label={`${month.toLocaleString('en-CA', { month: 'long' })} calendar`}>
      <div className="month-calendar-toolbar">
        <button type="button" onClick={() => move(-1)} aria-label="Previous month">‹</button>
        <h2>{month.toLocaleString('en-CA', { month: 'long', year: 'numeric' })}</h2>
        <button type="button" onClick={() => move(1)} aria-label="Next month">›</button>
      </div>
      <div className="month-calendar-grid month-calendar-weekdays">{weekdays.map(day => <span key={day}>{day}</span>)}</div>
      <div className="month-calendar-grid">{cells.map((date, index) => {
        if (!date) return <span className="month-calendar-blank" key={`blank-${index}`} />;
        const dayEvents = eventMap.get(keyFor(date)) || [];
        const isToday = keyFor(date) === keyFor(today);
        return <div className={`month-calendar-day${isToday ? ' today' : ''}`} key={keyFor(date)}>
          <span className="month-calendar-number">{date.getDate()}</span>
          <span className="month-calendar-dots" aria-label={`${dayEvents.length} events`}>{dayEvents.slice(0, 3).map((event, i) => <i className={event.scope === 'TEAM' ? 'team' : ''} key={`${event.id}-${i}`} />)}</span>
        </div>;
      })}</div>
    </section>

    <div className="events-list">
      {visibleEvents.map((event, index) => {
        const start = new Date(event.startTime);
        const content = <><div className="event-card-date-chip calendar-date-chip"><span className="event-date-month">{start.toLocaleString('en-CA', { month: 'short' }).toUpperCase()}</span><span className="event-date-day">{start.getDate()}</span></div><div className="event-card-body"><div className={`event-scope-badge ${event.scope === 'TEAM' ? 'team' : 'public'}`}>{event.id === 'saturday' ? 'Public · Weekly' : event.scope === 'TEAM' ? 'Invited' : 'Public'}</div><h2 className="event-card-title">{event.title}</h2><p className="event-card-meta">{start.toLocaleString('en-CA', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}</p><p className="event-card-meta">{event.location}</p>{event.id === 'saturday' && <p className="event-card-desc">Reminder: every Saturday at 11:00 AM.</p>}</div></>;
        return event.id === 'saturday' ? <article className="event-card calendar-event-card" key={`${event.id}-${index}`}>{content}</article> : <Link href={`/events/${event.id}`} className="event-card calendar-event-card" key={event.id}>{content}</Link>;
      })}
    </div>
  </>;
}
