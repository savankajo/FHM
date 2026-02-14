'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { deleteService } from '@/app/actions/team-admin';

export default function DeleteServiceButton({ serviceId, teamId }: { serviceId: string, teamId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        setLoading(true);
        const result = await deleteService(serviceId, teamId);

        if (result.success) {
            router.refresh();
        } else {
            alert('Failed to delete service');
        }
        setLoading(false);
    };

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="h-8 text-xs px-2"
        >
            {loading ? '...' : '🗑️'}
        </Button>
    );
}
