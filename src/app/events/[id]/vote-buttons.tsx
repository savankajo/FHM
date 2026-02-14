'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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

                // Show calendar options after voting YES or MAYBE
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
            // Add the actual event
            const firstLocation = locations[currentLocIndex || 0] || locations[0];
            const startTime = new Date(firstLocation.startTime);
            const endTime = new Date(firstLocation.endTime);

            event = {
                title: `${eventTitle} - FHM Church`,
                description: `Event at ${firstLocation.name}`,
                location: firstLocation.address || firstLocation.name,
                startTime,
                endTime,
            };
        } else {
            // Add deadline reminder
            const deadlineDate = new Date(votingDeadline!);
            const reminderStart = new Date(deadlineDate.getTime() - 30 * 60 * 1000); // 30 min before deadline

            event = {
                title: `⏰ Deadline: Decide on "${eventTitle}"`,
                description: `Voting deadline for ${eventTitle}. Make your final decision!`,
                location: 'FHM Church',
                startTime: reminderStart,
                endTime: deadlineDate,
            };
        }

        let calendarUrl = '';

        if (type === 'google') {
            calendarUrl = generateGoogleCalendarLink(event);
            window.open(calendarUrl, '_blank');
        } else if (type === 'apple') {
            calendarUrl = generateICalendarLink(event);
            const link = document.createElement('a');
            link.href = calendarUrl;
            link.download = `${eventTitle}.ics`;
            link.click();
        } else if (type === 'outlook') {
            calendarUrl = generateOutlookCalendarLink(event);
            window.open(calendarUrl, '_blank');
        }

        setShowCalendarOptions(false);
    };

    if (showCalendarOptions) {
        return (
            <div className="flex flex-col gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-800">
                    {calendarType === 'event'
                        ? '✓ You said YES! Add event to calendar:'
                        : '📅 Add deadline reminder to calendar:'}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAddToCalendar('google')}
                        className="flex-1 px-4 py-2 bg-white hover:bg-green-100 border border-green-300 rounded-lg text-sm font-medium text-green-700 transition-colors"
                    >
                        📅 Google
                    </button>
                    <button
                        onClick={() => handleAddToCalendar('apple')}
                        className="flex-1 px-4 py-2 bg-white hover:bg-green-100 border border-green-300 rounded-lg text-sm font-medium text-green-700 transition-colors"
                    >
                        🍎 Apple
                    </button>
                    <button
                        onClick={() => handleAddToCalendar('outlook')}
                        className="flex-1 px-4 py-2 bg-white hover:bg-green-100 border border-green-300 rounded-lg text-sm font-medium text-green-700 transition-colors"
                    >
                        📧 Outlook
                    </button>
                </div>
                <button
                    onClick={() => setShowCalendarOptions(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Skip for now
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="vote-buttons flex justify-center gap-2">
                <Button
                    variant={currentStatus === 'YES' ? 'primary' : 'outline'}
                    className={currentStatus === 'YES' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => handleVote('YES')}
                    disabled={loading}
                >
                    YES
                </Button>
                <Button
                    variant={currentStatus === 'MAYBE' ? 'primary' : 'outline'}
                    className={currentStatus === 'MAYBE' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                    onClick={() => handleVote('MAYBE')}
                    disabled={loading}
                >
                    MAYBE
                </Button>
                <Button
                    variant={currentStatus === 'NO' ? 'primary' : 'ghost'}
                    className={currentStatus === 'NO' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                    onClick={() => handleVote('NO')}
                    disabled={loading}
                >
                    NO
                </Button>
            </div>

            {/* Show calendar button for existing votes */}
            {currentStatus === 'YES' && (
                <button
                    onClick={() => { setCalendarType('event'); setShowCalendarOptions(true); }}
                    className="px-4 py-2 text-sm bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 transition-colors"
                >
                    📅 Add Event to Calendar
                </button>
            )}
            {currentStatus === 'MAYBE' && votingDeadline && (
                <button
                    onClick={() => { setCalendarType('deadline'); setShowCalendarOptions(true); }}
                    className="px-4 py-2 text-sm bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 transition-colors"
                >
                    ⏰ Add Deadline Reminder
                </button>
            )}
        </div>
    );
}
