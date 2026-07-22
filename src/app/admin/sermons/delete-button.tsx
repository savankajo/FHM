'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DeleteSermonButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Delete this sermon?')) return;
        await fetch(`/api/admin/sermons?id=${id}`, { method: 'DELETE' });
        if (redirectTo) {
            router.push(redirectTo);
            return;
        }
        router.refresh();
    };

    return <Button variant="ghost" size="sm" className="admin-delete-btn" onClick={handleDelete}>Delete</Button>;
}
