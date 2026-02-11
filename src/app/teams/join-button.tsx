'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function JoinButton({ teamId }: { teamId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleJoin = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/teams/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId }),
            });
            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button size="sm" variant="outline" onClick={handleJoin} disabled={loading}>
            {loading ? '...' : 'Join'}
        </Button>
    );
}
