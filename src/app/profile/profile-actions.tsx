'use client';

import { useState } from 'react';

export default function ProfileActions() {
    const [loading, setLoading] = useState(false);

    async function handleLogout() {
        setLoading(true);
        try {
            const { logout } = await import('@/app/actions/auth');
            await logout();
        } catch {
            setLoading(false);
        }
    }

    return (
        <form action={handleLogout}>
            <button
                type="submit"
                className="profile-menu-item"
                disabled={loading}
                style={{ color: '#ef4444' }}
            >
                <div className="profile-menu-icon red">🚪</div>
                <span className="profile-menu-label danger">
                    {loading ? 'Signing out...' : 'Logout'}
                </span>
            </button>
        </form>
    );
}
