'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewTeamPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        await fetch('/api/admin/teams', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: { 'Content-Type': 'application/json' }
        });

        setLoading(false);
        router.push('/admin/teams');
        router.refresh();
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Create Team</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input name="name" label="Team Name" required placeholder="Worship Team" />
                <Input name="description" label="Description" placeholder="Musicians and tech crew..." />

                <Button type="submit" disabled={loading} fullWidth>
                    {loading ? 'Saving...' : 'Create Team'}
                </Button>
            </form>
        </div>
    );
}
