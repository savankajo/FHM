'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateGoogleCalendarLink, generateICalendarLink, generateOutlookCalendarLink } from '@/lib/calendar';

interface VolunteerButtonProps {
    serviceId: string;
    isVolunteering: boolean;
    disabled: boolean;
    serviceTitle: string;
    serviceDate: Date;
}

export default function VolunteerButton({
    serviceId,
    isVolunteering,
    disabled,
    serviceTitle,
    serviceDate
}: VolunteerButtonProps) {
    const [loading, setLoading] = useState(false);
    const [showCalendarOptions, setShowCalendarOptions] = useState(false);
    const router = useRouter();

    const handleVolunteer = async () => {
        if (isVolunteering || loading) return;
        setLoading(true);
        try {
            const res = await fetch('/api/services/volunteer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceId }),
            });
            if (res.ok) {
                router.refresh();
                setShowCalendarOptions(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCalendar = (type: 'google' | 'apple' | 'outlook') => {
        const startTime = new Date(serviceDate);
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
        const event = {
            title: `${serviceTitle} - FHM Church Service`,
            description: `You volunteered for this service at Father's Heart Church`,
            location: "Father's Heart Church",
            startTime,
            endTime,
        };
        if (type === 'google') window.open(generateGoogleCalendarLink(event), '_blank');
        else if (type === 'apple') {
            const link = document.createElement('a');
            link.href = generateICalendarLink(event);
            link.download = `${serviceTitle}.ics`;
            link.click();
        } else if (type === 'outlook') window.open(generateOutlookCalendarLink(event), '_blank');
        setShowCalendarOptions(false);
    };

    // ── Calendar picker state ─────────────────────────────────
    if (showCalendarOptions) {
        return (
            <div className="calendar-picker">
                <p className="calendar-picker-title">✓ You're volunteering!<br />Add to calendar:</p>
                <div className="calendar-picker-btns">
                    <button onClick={() => handleAddToCalendar('google')} className="cal-btn">📅 Google</button>
                    <button onClick={() => handleAddToCalendar('apple')} className="cal-btn">🍎 Apple</button>
                    <button onClick={() => handleAddToCalendar('outlook')} className="cal-btn">📧 Outlook</button>
                </div>
                <button onClick={() => setShowCalendarOptions(false)} className="cal-skip">Skip for now</button>
            </div>
        );
    }

    // ── Already volunteering ──────────────────────────────────
    if (isVolunteering) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <div className="volunteer-going-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Going
                </div>
                <button
                    onClick={() => setShowCalendarOptions(true)}
                    className="cal-add-btn"
                >
                    📅 Add to Calendar
                </button>
            </div>
        );
    }

    // ── Default volunteer button ──────────────────────────────
    return (
        <button
            onClick={handleVolunteer}
            disabled={loading || disabled}
            className={`volunteer-btn${disabled ? ' disabled' : ''}`}
        >
            {loading ? (
                <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : disabled ? 'Full' : 'Volunteer'}
        </button>
    );
}
