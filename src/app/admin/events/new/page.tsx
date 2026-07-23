'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AudienceSelector from '@/components/admin/audience-selector';
import EventLocationsEditor, { createBlankEventLocation } from '../event-locations-editor';

export default function NewEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState([createBlankEventLocation()]);

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

        await fetch('/api/admin/events', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        setLoading(false);
        router.push('/admin/events');
        router.refresh();
    };

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Create Event</h1>
                        <p className="page-kicker">Add event registration</p>
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input name="title" label="Event Title" required placeholder="Summer Picnic" />
                <Input name="description" label="Description" placeholder="Details..." />
                <AudienceSelector />

                <EventLocationsEditor locations={locations} onChange={setLocations} />

                <h3 className="font-bold mt-2">Voting</h3>
                <Input name="votingDeadline" label="Voting Deadline" type="datetime-local" />

                <Button type="submit" disabled={loading} fullWidth>
                    {loading ? 'Saving...' : 'Create Event'}
                </Button>
            </form>
        </div>
    );
}
