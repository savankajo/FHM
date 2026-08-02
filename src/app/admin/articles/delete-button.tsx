'use client';

import { useRouter } from 'next/navigation';

export default function DeleteArticleButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Delete this article?')) return;
        await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
        if (redirectTo) router.push(redirectTo);
        router.refresh();
    };

    return <button onClick={handleDelete} className="admin-list-action-link text-red-600">Delete</button>;
}
