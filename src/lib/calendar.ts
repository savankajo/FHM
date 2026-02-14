// Generate calendar links for adding events

interface CalendarEvent {
    title: string;
    description?: string;
    location?: string;
    startTime: Date;
    endTime: Date;
}

export function generateGoogleCalendarLink(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${formatDate(event.startTime)}/${formatDate(event.endTime)}`,
        details: event.description || '',
        location: event.location || '',
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateICalendarLink(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${formatDate(event.startTime)}`,
        `DTEND:${formatDate(event.endTime)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || ''}`,
        `LOCATION:${event.location || ''}`,
        'END:VEVENT',
        'END:VCALENDAR',
    ].join('\r\n');

    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
}

export function generateOutlookCalendarLink(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
        return date.toISOString();
    };

    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: event.title,
        body: event.description || '',
        location: event.location || '',
        startdt: formatDate(event.startTime),
        enddt: formatDate(event.endTime),
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
