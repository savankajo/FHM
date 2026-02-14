'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface DeleteEventButtonProps {
    eventId: string;
    eventTitle: string;
}

export default function DeleteEventButton({ eventId, eventTitle }: DeleteEventButtonProps) {
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to delete event');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting event');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="flex flex-col gap-2 p-3 bg-red-50 rounded border border-red-200">
                <p className="text-xs font-semibold text-red-800">Delete "{eventTitle}"?</p>
                <div className="flex gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
                    >
                        {loading ? '...' : 'Delete'}
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        className="flex-1 px-3 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-xs font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowConfirm(true)}
        >
            Delete
        </Button>
    );
}
