'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SermonFormProps {
    initialData?: {
        id?: string;
        title: string;
        speaker: string;
        date: string | Date;
        type: 'VIDEO' | 'PDF';
        videoUrl?: string | null;
        fileUrl?: string | null;
        notes?: string | null;
        thumbnailUrl?: string | null;
    };
}

export default function SermonForm({ initialData }: SermonFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<'VIDEO' | 'PDF'>(initialData?.type || 'VIDEO');
    const [thumbPreview, setThumbPreview] = useState<string>(initialData?.thumbnailUrl || '');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        const payload = {
            ...data,
            type,
            id: initialData?.id
        };

        const method = initialData?.id ? 'PUT' : 'POST';

        await fetch('/api/admin/sermons', {
            method,
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        setLoading(false);
        router.push('/admin/sermons');
        router.refresh();
    };

    const defaultDate = initialData?.date
        ? new Date(initialData.date).toISOString().split('T')[0]
        : '';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input name="title" label="Title" required placeholder="Sunday Service" defaultValue={initialData?.title} />
            <Input name="speaker" label="Speaker" required placeholder="Pastor John" defaultValue={initialData?.speaker} />
            <Input name="date" label="Date" type="date" required defaultValue={defaultDate} />

            <div className="flex gap-4 items-center">
                <label className="font-medium text-sm">Type:</label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={type === 'VIDEO' ? 'primary' : 'outline'}
                        onClick={() => setType('VIDEO')}
                        size="sm"
                    >
                        Video
                    </Button>
                    <Button
                        type="button"
                        variant={type === 'PDF' ? 'primary' : 'outline'}
                        onClick={() => setType('PDF')}
                        size="sm"
                    >
                        PDF
                    </Button>
                </div>
            </div>

            {type === 'VIDEO' ? (
                <Input name="videoUrl" label="Video URL" required={type === 'VIDEO'} placeholder="https://youtube.com/..." defaultValue={initialData?.videoUrl || ''} />
            ) : (
                <Input name="fileUrl" label="PDF URL" required={type === 'PDF'} placeholder="https://example.com/sermon.pdf" defaultValue={initialData?.fileUrl || ''} />
            )}

            <Input name="notes" label="Notes" placeholder="Additional notes..." defaultValue={initialData?.notes || ''} />

            {/* Thumbnail URL */}
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
                {loading ? 'Saving...' : (initialData ? 'Update Sermon' : 'Create Sermon')}
            </Button>
        </form>
    );
}
