'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Simplified location input for MVP: Single location
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        // Construct simplified location object
        const location = {
            name: data.locName,
            address: data.locAddress,
            startTime: data.startTime,
            endTime: data.endTime,
            mapUrl: data.mapUrl
        };

        const payload = {
            title: data.title,
            description: data.description,
            votingDeadline: data.votingDeadline ? new Date(data.votingDeadline as string) : null,
            locations: [location] // Array of 1 for now
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
        <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Create Event</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input name="title" label="Event Title" required placeholder="Summer Picnic" />
                <Input name="description" label="Description" placeholder="Details..." />

                <h3 className="font-bold mt-2">Location & Time</h3>
                <Input name="locName" label="Location Name" required placeholder="Central Park" />
                <Input name="locAddress" label="Address" required placeholder="123 Park Ave" />
                <Input name="startTime" label="Start Time" type="datetime-local" required />
                <Input name="endTime" label="End Time" type="datetime-local" required />
                <Input name="mapUrl" label="Map URL" placeholder="https://maps.google.com/..." />

                <h3 className="font-bold mt-2">Voting</h3>
                <Input name="votingDeadline" label="Voting Deadline" type="datetime-local" />

                <Button type="submit" disabled={loading} fullWidth>
                    {loading ? 'Saving...' : 'Create Event'}
                </Button>
            </form>
        </div>
    );
}
