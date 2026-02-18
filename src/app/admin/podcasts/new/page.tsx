'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewPodcastPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [thumbPreview, setThumbPreview] = useState('');

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

                {/* Thumbnail URL */}
                <div>
                    <Input
                        name="thumbnailUrl"
                        label="Cover Image URL (optional)"
                        placeholder="https://example.com/image.jpg"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThumbPreview(e.target.value)}
                    />
                    {thumbPreview && (
                        <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', width: '100%', maxWidth: '200px', aspectRatio: '16/9', background: '#f0ece6' }}>
                            <img
                                src={thumbPreview}
                                alt="Thumbnail preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={loading} fullWidth>
                    {loading ? 'Saving...' : 'Create Episode'}
                </Button>
            </form>
        </div>
    );
}
