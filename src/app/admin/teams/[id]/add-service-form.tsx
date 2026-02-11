'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AddServiceForm({ teamId }: { teamId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        await fetch('/api/admin/services', {
            method: 'POST',
            body: JSON.stringify({ ...data, teamId }),
            headers: { 'Content-Type': 'application/json' }
        });

        setLoading(false);
        // basic reset
        (e.target as HTMLFormElement).reset();
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input name="title" label="Service Title" required placeholder="Sunday Morning Worship" />
            <Input name="date" label="Date & Time" type="datetime-local" required />
            <Input name="maxVolunteers" label="Max Volunteers" type="number" placeholder="Optional" />
            <Input name="description" label="Notes" placeholder="Instructions..." />

            <Button type="submit" disabled={loading} size="sm">
                {loading ? 'Adding...' : 'Add Service'}
            </Button>
        </form>
    );
}
