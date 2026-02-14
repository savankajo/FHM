'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
        setLoading(true);
        try {
            if (isVolunteering) return;

            const res = await fetch('/api/services/volunteer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceId }),
            });

            if (res.ok) {
                router.refresh();
                // Show calendar options after successful volunteer
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
        const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

        const event = {
            title: `${serviceTitle} - FHM Church Service`,
            description: `You volunteered for this service at Father's Heart Church`,
            location: 'Father\'s Heart Church',
            startTime,
            endTime,
        };

        let calendarUrl = '';

        if (type === 'google') {
            calendarUrl = generateGoogleCalendarLink(event);
            window.open(calendarUrl, '_blank');
        } else if (type === 'apple') {
            calendarUrl = generateICalendarLink(event);
            const link = document.createElement('a');
            link.href = calendarUrl;
            link.download = `${serviceTitle}.ics`;
            link.click();
        } else if (type === 'outlook') {
            calendarUrl = generateOutlookCalendarLink(event);
            window.open(calendarUrl, '_blank');
        }

        setShowCalendarOptions(false);
    };

    if (showCalendarOptions) {
        return (
            <div className="flex flex-col gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-800 mb-1">✓ You're volunteering! Add to calendar:</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAddToCalendar('google')}
                        className="flex-1 px-3 py-2 bg-white hover:bg-green-100 border border-green-300 rounded-lg text-xs font-medium text-green-700 transition-colors"
                    >
                        📅 Google
                    </button>
                    <button
                        onClick={() => handleAddToCalendar('apple')}
                        className="flex-1 px-3 py-2 bg-white hover:bg-green-100 border border-green-300 rounded-lg text-xs font-medium text-green-700 transition-colors"
                    >
                        🍎 Apple
                    </button>
                    <button
                        onClick={() => handleAddToCalendar('outlook')}
                        className="flex-1 px-3 py-2 bg-white hover:bg-green-100 border border-green-300 rounded-lg text-xs font-medium text-green-700 transition-colors"
                    >
                        📧 Outlook
                    </button>
                </div>
                <button
                    onClick={() => setShowCalendarOptions(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                >
                    Skip for now
                </button>
            </div>
        );
    }

    if (isVolunteering) {
        return (
            <div className="flex gap-2">
                <Button size="sm" variant="outline" className="bg-green-50 border-green-500 text-green-700">
                    ✓ Going
                </Button>
                <button
                    onClick={() => setShowCalendarOptions(true)}
                    className="px-3 py-1 text-xs bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 transition-colors"
                >
                    📅 Add to Calendar
                </button>
            </div>
        );
    }

    return (
        <Button size="sm" onClick={handleVolunteer} disabled={loading || disabled}>
            {loading ? '...' : disabled ? 'Full' : 'Volunteer'}
        </Button>
    );
}
