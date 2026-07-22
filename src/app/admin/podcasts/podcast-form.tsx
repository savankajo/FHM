'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AudienceSelector from '@/components/admin/audience-selector';
import { getPodcastSeason, setPodcastSeason, stripPodcastSeason } from '@/lib/media-metadata';

interface PodcastFormProps {
    initialData?: {
        id?: string;
        title: string;
        description?: string | null;
        publishedAt: string | Date;
        audioUrl: string;
        thumbnailUrl?: string | null;
        audienceTeamIds?: unknown;
    };
}

export default function PodcastForm({ initialData }: PodcastFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [thumbPreview, setThumbPreview] = useState(initialData?.thumbnailUrl || '');
    const [season, setSeason] = useState(getPodcastSeason(initialData?.description));

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);
        const audienceTeamIds = formData.getAll('audienceTeamIds').map(String);
        if (data.audience === 'teams' && audienceTeamIds.length === 0) {
            alert('Select at least one team or choose Everyone.');
            setLoading(false);
            return;
        }

        await fetch('/api/admin/podcasts', {
            method: initialData?.id ? 'PUT' : 'POST',
            body: JSON.stringify({
                ...data,
                id: initialData?.id,
                description: setPodcastSeason(String(data.description || ''), season),
                audienceTeamIds: data.audience === 'teams' ? audienceTeamIds : [],
            }),
            headers: { 'Content-Type': 'application/json' },
        });

        setLoading(false);
        router.push('/admin/podcasts');
        router.refresh();
    };

    const defaultDate = initialData?.publishedAt
        ? new Date(initialData.publishedAt).toISOString().split('T')[0]
        : '';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input name="title" label="Title" required placeholder="Episode 1: Faith" defaultValue={initialData?.title} />
            <Input name="publishedAt" label="Date" type="date" required defaultValue={defaultDate} />
            <Input name="audioUrl" label="Audio URL" required placeholder="https://..." defaultValue={initialData?.audioUrl} />
            <Input name="description" label="Description" placeholder="Episode summary..." defaultValue={stripPodcastSeason(initialData?.description)} />
            <label className="flex flex-col gap-1 text-sm font-medium">
                Podcast Season
                <select
                    value={season}
                    onChange={(event) => setSeason(event.target.value as typeof season)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                >
                    <option value="season-1">Coffee With the Shepherd</option>
                    <option value="season-2">Season 2</option>
                </select>
            </label>
            <AudienceSelector defaultTeamIds={Array.isArray(initialData?.audienceTeamIds) ? initialData.audienceTeamIds as string[] : []} />

            <div>
                <Input
                    name="thumbnailUrl"
                    label="Cover Image URL (optional)"
                    placeholder="https://example.com/image.jpg"
                    defaultValue={initialData?.thumbnailUrl || ''}
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
                {loading ? 'Saving...' : (initialData ? 'Update Episode' : 'Create Episode')}
            </Button>
        </form>
    );
}
