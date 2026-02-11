'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewPodcastPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        await fetch('/api/admin/podcasts', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: { 'Content-Type': 'application/json' }
        });

        setLoading(false);
        router.push('/admin/podcasts');
        router.refresh();
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Add Podcast Episode</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input name="title" label="Title" required placeholder="Episode 1: Faith" />
                <Input name="publishedAt" label="Date" type="date" required />
                <Input name="audioUrl" label="Audio URL" required placeholder="https://..." />
                <Input name="description" label="Description" placeholder="Episode summary..." />

                <Button type="submit" disabled={loading} fullWidth>
                    {loading ? 'Saving...' : 'Create Episode'}
                </Button>
            </form>
        </div>
    );
}
