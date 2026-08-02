'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AudienceSelector from '@/components/admin/audience-selector';

interface ArticleFormProps {
    initialData?: {
        id?: string;
        title: string;
        author: string;
        summary?: string | null;
        body?: string | null;
        publishedAt: string | Date;
        imageUrl?: string | null;
        linkUrl?: string | null;
        audienceTeamIds?: unknown;
    };
}

export default function ArticleForm({ initialData }: ArticleFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || '');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData);
        const audienceTeamIds = formData.getAll('audienceTeamIds').map(String);

        if (data.audience === 'teams' && audienceTeamIds.length === 0) {
            alert('Select at least one team or choose Everyone.');
            setLoading(false);
            return;
        }

        await fetch('/api/admin/articles', {
            method: initialData?.id ? 'PUT' : 'POST',
            body: JSON.stringify({
                ...data,
                id: initialData?.id,
                audienceTeamIds: data.audience === 'teams' ? audienceTeamIds : [],
            }),
            headers: { 'Content-Type': 'application/json' },
        });

        setLoading(false);
        router.push('/admin/articles');
        router.refresh();
    };

    const defaultDate = initialData?.publishedAt
        ? new Date(initialData.publishedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input name="title" label="Title" required placeholder="Walking in Faith During Difficult Seasons" defaultValue={initialData?.title} />
            <Input name="author" label="Author" required placeholder="FHM Church" defaultValue={initialData?.author || 'FHM Church'} />
            <Input name="publishedAt" label="Date" type="date" required defaultValue={defaultDate} />
            <Input name="summary" label="Short Summary" placeholder="A short encouragement for the church family." defaultValue={initialData?.summary || ''} />
            <Input name="linkUrl" label="Link URL (optional)" type="url" placeholder="https://..." defaultValue={initialData?.linkUrl || ''} />

            <label className="flex flex-col gap-1 text-sm font-medium">
                Article Body (optional)
                <textarea
                    name="body"
                    rows={8}
                    className="input"
                    placeholder="Optional. If this article is on your website, leave this blank and use Link URL."
                    defaultValue={initialData?.body || ''}
                />
            </label>

            <AudienceSelector defaultTeamIds={Array.isArray(initialData?.audienceTeamIds) ? initialData.audienceTeamIds as string[] : []} />

            <div>
                <Input
                    name="imageUrl"
                    label="Image URL (optional)"
                    placeholder="https://example.com/image.jpg"
                    defaultValue={initialData?.imageUrl || ''}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setImagePreview(event.target.value)}
                />
                {imagePreview && (
                    <div style={{ marginTop: '8px', borderRadius: '12px', overflow: 'hidden', width: '100%', maxWidth: '240px', aspectRatio: '16/9', background: '#f0ece6' }}>
                        <img
                            src={imagePreview}
                            alt="Article preview"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(event) => { (event.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    </div>
                )}
            </div>

            <Button type="submit" disabled={loading} fullWidth>
                {loading ? 'Saving...' : (initialData ? 'Update Article' : 'Create Article')}
            </Button>
        </form>
    );
}
