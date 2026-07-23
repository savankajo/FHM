'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import AudienceSelector from '@/components/admin/audience-selector';
import EventLocationsEditor, { EventLocationInput, createBlankEventLocation } from '../../event-locations-editor';

interface EditEventFormProps {
    event: any;
}

export default function EditEventForm({ event }: EditEventFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const formatDateTimeLocal = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const existingLocations = Array.isArray(event.locations) ? event.locations as any[] : [];
    const [locations, setLocations] = useState<EventLocationInput[]>(
        existingLocations.length
            ? existingLocations.map(location => ({
                name: location.name || '',
                address: location.address || '',
                startTime: formatDateTimeLocal(location.startTime),
                endTime: formatDateTimeLocal(location.endTime),
                mapUrl: location.mapUrl || ''
            }))
            : [createBlankEventLocation()]
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);
        const audienceTeamIds = formData.getAll('audienceTeamIds').map(String);
        if (data.audience === 'teams' && audienceTeamIds.length === 0) { alert('Select at least one team or choose Everyone.'); setLoading(false); return; }

        const payload = {
            title: data.title,
            description: data.description,
            votingDeadline: data.votingDeadline ? new Date(data.votingDeadline as string) : null,
            locations: locations.map(location => ({
                ...location,
                mapUrl: location.mapUrl.trim()
            })),
            audienceTeamIds: data.audience === 'teams' ? audienceTeamIds : []
        };

        const res = await fetch(`/api/events/${event.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        setLoading(false);

        if (res.ok) {
            router.push('/admin/events');
            router.refresh();
        } else {
            alert('Failed to update event');
        }
    };

    return (
        <div>
            <header className="page-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <Link href="/admin/events" className="page-back-btn" aria-label="Back to Events">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div>
                    <h1 className="page-title">Edit Event</h1>
                    <p className="page-kicker">Update event details</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    name="title"
                    label="Event Title"
                    required
                    placeholder="Summer Picnic"
                    defaultValue={event.title}
                />
                <AudienceSelector defaultTeamIds={(event.teams || []).map((team: { id: string }) => team.id)} />
                <Input
                    name="description"
                    label="Description"
                    placeholder="Details..."
                    defaultValue={event.description || ''}
                />

                <EventLocationsEditor locations={locations} onChange={setLocations} />

                <h3 className="font-bold mt-2">Voting</h3>
                <Input
                    name="votingDeadline"
                    label="Voting Deadline"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(event.votingDeadline)}
                />

                <div className="flex gap-2 mt-4">
                    <Button type="submit" disabled={loading} fullWidth>
                        {loading ? 'Saving...' : 'Update Event'}
                    </Button>
                    <Link href="/admin/events" className="flex-1">
                        <Button type="button" variant="outline" fullWidth>
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
