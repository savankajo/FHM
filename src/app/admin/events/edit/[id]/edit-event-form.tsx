'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface EditEventFormProps {
    event: any;
}

export default function EditEventForm({ event }: EditEventFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const locations = event.locations as any[];
    const firstLocation = locations?.[0] || {};

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

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
            locations: [location]
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

    // Format datetime for input (YYYY-MM-DDTHH:mm)
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

    return (
        <div>
            <Link href="/admin/events" className="text-sm text-gray-500 hover:text-primary mb-4 block">
                ← Back to Events
            </Link>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    name="title"
                    label="Event Title"
                    required
                    placeholder="Summer Picnic"
                    defaultValue={event.title}
                />
                <Input
                    name="description"
                    label="Description"
                    placeholder="Details..."
                    defaultValue={event.description || ''}
                />

                <h3 className="font-bold mt-2">Location & Time</h3>
                <Input
                    name="locName"
                    label="Location Name"
                    required
                    placeholder="Central Park"
                    defaultValue={firstLocation.name || ''}
                />
                <Input
                    name="locAddress"
                    label="Address"
                    required
                    placeholder="123 Park Ave"
                    defaultValue={firstLocation.address || ''}
                />
                <Input
                    name="startTime"
                    label="Start Time"
                    type="datetime-local"
                    required
                    defaultValue={formatDateTimeLocal(firstLocation.startTime)}
                />
                <Input
                    name="endTime"
                    label="End Time"
                    type="datetime-local"
                    required
                    defaultValue={formatDateTimeLocal(firstLocation.endTime)}
                />
                <Input
                    name="mapUrl"
                    label="Map URL"
                    placeholder="https://maps.google.com/..."
                    defaultValue={firstLocation.mapUrl || ''}
                />

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
