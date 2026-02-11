'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DeletePodcastButton({ id }: { id: string }) {
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Delete this episode?')) return;
        await fetch(`/api/admin/podcasts?id=${id}`, { method: 'DELETE' });
        router.refresh();
    };

    return <Button variant="ghost" className="text-red-500" onClick={handleDelete}>🗑️</Button>;
}
