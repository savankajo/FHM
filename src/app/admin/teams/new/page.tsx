'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewTeamPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        await fetch('/api/admin/teams', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: { 'Content-Type': 'application/json' }
        });

        setLoading(false);
        router.push('/admin/teams');
        router.refresh();
    };

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Create Team</h1>
                        <p className="page-kicker">Add a team or group</p>
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input name="name" label="Team Name" required placeholder="Worship Team" />
                <Input name="description" label="Description" placeholder="Musicians and tech crew..." />

                <Button type="submit" disabled={loading} fullWidth>
                    {loading ? 'Saving...' : 'Create Team'}
                </Button>
            </form>
        </div>
    );
}
