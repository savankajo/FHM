'use client';

import { useState } from 'react';
import { createLiveLink, deleteLiveLink } from '@/app/actions/live-link';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLiveLinkPage() {
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleCreate(formData: FormData) {
        setLoading(true);
        setStatus(null);
        const result = await createLiveLink(formData);
        if (result.error) {
            setStatus({ type: 'error', message: result.error });
        } else {
            setStatus({ type: 'success', message: 'Live link updated!' });
        }
        setLoading(false);
    }

    async function handleClear() {
        if (!confirm('Are you sure you want to remove the current live link?')) return;
        setLoading(true);
        setStatus(null);
        const result = await deleteLiveLink();
        if (result.error) {
            setStatus({ type: 'error', message: result.error });
        } else {
            setStatus({ type: 'success', message: 'Live link removed!' });
        }
        setLoading(false);
    }

    return (
        <div className="p-4 max-w-lg mx-auto">
            <Link href="/admin" className="text-sm text-gray-500 hover:text-primary mb-4 block">← Back to Admin</Link>
            <h1 className="text-2xl font-bold mb-6">Manage Live Link</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <form action={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Live Stream URL</label>
                        <input name="url" type="url" placeholder="https://youtube.com/live/..." required className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Expires In (Hours)</label>
                        <input name="expiryHours" type="number" min="1" step="1" defaultValue="2" required className="w-full p-2 border rounded" />
                        <p className="text-xs text-gray-500 mt-1">Link will automatically disappear after this time.</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Updating...' : 'Set Live Link'}
                    </Button>
                </form>

                <div className="mt-8 border-t pt-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Remove Active Link</h3>
                    <p className="text-sm text-gray-600 mb-4">Manually remove the link before it expires.</p>
                    <Button variant="destructive" onClick={handleClear} disabled={loading} className="w-full">
                        Remove Live Link
                    </Button>
                </div>

                {status && (
                    <div className={`mt-4 p-3 rounded text-sm ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                        {status.message}
                    </div>
                )}
            </div>
        </div>
    );
}
