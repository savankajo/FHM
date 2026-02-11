'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewSermonPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        await fetch('/api/admin/sermons', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: { 'Content-Type': 'application/json' }
        });

        setLoading(false);
        router.push('/admin/sermons');
        router.refresh();
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Add Sermon</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input name="title" label="Title" required placeholder="Sunday Service" />
                <Input name="speaker" label="Speaker" required placeholder="Pastor John" />
                <Input name="date" label="Date" type="date" required />
                <Input name="videoUrl" label="Video URL" required placeholder="https://youtube.com/..." />
                <Input name="notes" label="Notes" placeholder="Link to PDF or text..." />

                <Button type="submit" disabled={loading} fullWidth>
                    {loading ? 'Saving...' : 'Create Sermon'}
                </Button>
            </form>
        </div>
    );
}
