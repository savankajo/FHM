'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateGoogleCalendarLink, generateICalendarLink, generateOutlookCalendarLink } from '@/lib/calendar';

interface VoteButtonsProps {
    eventId: string;
    currentStatus?: 'YES' | 'NO' | 'MAYBE';
    currentLocIndex?: number | null;
    locations: any[];
    eventTitle: string;
    votingDeadline?: Date | null;
}

export default function VoteButtons({
    eventId,
    currentStatus,
    currentLocIndex,
    locations,
    eventTitle,
    votingDeadline
}: VoteButtonsProps) {
    const [loading, setLoading] = useState(false);
    const [showCalendarOptions, setShowCalendarOptions] = useState(false);
    const [calendarType, setCalendarType] = useState<'event' | 'deadline'>('event');
    const router = useRouter();

    const handleVote = async (status: 'YES' | 'NO' | 'MAYBE') => {
        setLoading(true);
        try {
            const res = await fetch('/api/events/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    status,
                    selectedLocationIndex: locations.length === 1 ? 0 : currentLocIndex
                }),
            });
            if (res.ok) {
                router.refresh();
                if (status === 'YES') {
                    setCalendarType('event');
                    setShowCalendarOptions(true);
                } else if (status === 'MAYBE' && votingDeadline) {
                    setCalendarType('deadline');
                    setShowCalendarOptions(true);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCalendar = (type: 'google' | 'apple' | 'outlook') => {
        let event;
        if (calendarType === 'event') {
            const firstLocation = locations[currentLocIndex || 0] || locations[0];
            event = {
                title: `${eventTitle} - FHM Church`,
                description: `Event at ${firstLocation.name}`,
                location: firstLocation.address || firstLocation.name,
                startTime: new Date(firstLocation.startTime),
                endTime: new Date(firstLocation.endTime),
            };
        } else {
            const deadlineDate = new Date(votingDeadline!);
            const reminderStart = new Date(deadlineDate.getTime() - 30 * 60 * 1000);
            event = {
                title: `⏰ Deadline: Decide on "${eventTitle}"`,
                description: `Voting deadline for ${eventTitle}. Make your final decision!`,
                location: 'FHM Church',
                startTime: reminderStart,
                endTime: deadlineDate,
            };
        }
        if (type === 'google') window.open(generateGoogleCalendarLink(event), '_blank');
        else if (type === 'apple') {
            const link = document.createElement('a');
            link.href = generateICalendarLink(event);
            link.download = `${eventTitle}.ics`;
            link.click();
        } else if (type === 'outlook') window.open(generateOutlookCalendarLink(event), '_blank');
        setShowCalendarOptions(false);
    };

    // ── Calendar picker ───────────────────────────────────────
    if (showCalendarOptions) {
        return (
            <div className="calendar-picker">
                <p className="calendar-picker-title">
                    {calendarType === 'event' ? '✓ You said YES! Add to calendar:' : '📅 Add deadline reminder:'}
                </p>
                <div className="calendar-picker-btns">
                    <button onClick={() => handleAddToCalendar('google')} className="cal-btn">📅 Google</button>
                    <button onClick={() => handleAddToCalendar('apple')} className="cal-btn">🍎 Apple</button>
                    <button onClick={() => handleAddToCalendar('outlook')} className="cal-btn">📧 Outlook</button>
                </div>
                <button onClick={() => setShowCalendarOptions(false)} className="cal-skip">Skip for now</button>
            </div>
        );
    }

    // ── Vote buttons ──────────────────────────────────────────
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="vote-btn-group">
                <button
                    className={`vote-btn yes${currentStatus === 'YES' ? ' active' : ''}`}
                    onClick={() => handleVote('YES')}
                    disabled={loading}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    YES
                </button>
                <button
                    className={`vote-btn maybe${currentStatus === 'MAYBE' ? ' active' : ''}`}
                    onClick={() => handleVote('MAYBE')}
                    disabled={loading}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    MAYBE
                </button>
                <button
                    className={`vote-btn no${currentStatus === 'NO' ? ' active' : ''}`}
                    onClick={() => handleVote('NO')}
                    disabled={loading}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    NO
                </button>
            </div>

            {/* Calendar shortcuts for existing votes */}
            {currentStatus === 'YES' && (
                <button
                    onClick={() => { setCalendarType('event'); setShowCalendarOptions(true); }}
                    className="cal-add-btn"
                >
                    📅 Add Event to Calendar
                </button>
            )}
            {currentStatus === 'MAYBE' && votingDeadline && (
                <button
                    onClick={() => { setCalendarType('deadline'); setShowCalendarOptions(true); }}
                    className="cal-add-btn"
                >
                    ⏰ Add Deadline Reminder
                </button>
            )}
        </div>
    );
}
