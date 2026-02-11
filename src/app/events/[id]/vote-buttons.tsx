'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface VoteButtonsProps {
    eventId: string;
    currentStatus?: 'YES' | 'NO' | 'MAYBE';
    currentLocIndex?: number | null;
    locations: any[];
}

export default function VoteButtons({ eventId, currentStatus, currentLocIndex, locations }: VoteButtonsProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVote = async (status: 'YES' | 'NO' | 'MAYBE') => {
        setLoading(true);
        try {
            // If multiple locations, user might need to pick one. For MVP, assuming index 0 or handling later.
            // We'll pass 0 as default if there's only one, otherwise we might need a selector.
            // Let's keep it simple: just status for now.

            const res = await fetch('/api/events/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    status,
                    selectedLocationIndex: locations.length === 1 ? 0 : currentLocIndex // Keep existing or default to 0
                }),
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
        <div className="vote-buttons">
            <Button
                variant={currentStatus === 'YES' ? 'primary' : 'outline'}
                className={currentStatus === 'YES' ? 'bg-green-600 hover:bg-green-700' : ''}
                onClick={() => handleVote('YES')}
                disabled={loading}
            >
                YES
            </Button>
            <Button
                variant={currentStatus === 'MAYBE' ? 'primary' : 'outline'}
                className={currentStatus === 'MAYBE' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                onClick={() => handleVote('MAYBE')}
                disabled={loading}
            >
                MAYBE
            </Button>
            <Button
                variant={currentStatus === 'NO' ? 'primary' : 'ghost'}
                className={currentStatus === 'NO' ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                onClick={() => handleVote('NO')}
                disabled={loading}
            >
                NO
            </Button>

            <style jsx>{`
        .vote-buttons {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }
      `}</style>
        </div>
    );
}
