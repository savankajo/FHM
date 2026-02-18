'use client';

import { useState } from 'react';
import { updateProfile } from '@/app/actions/profile';

type User = {
    name: string | null;
    email: string;
    phone: string | null;
};

export default function ProfileForm({ user }: { user: User }) {
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setStatus(null);
        const result = await updateProfile(formData);
        if (result.error) {
            setStatus({ type: 'error', message: result.error });
        } else {
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
        }
        setLoading(false);
    }

    return (
        <form action={handleSubmit}>

            <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                    name="name"
                    defaultValue={user.name || ''}
                    placeholder="Your full name"
                    className="input"
                />
            </div>

            <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    className="input"
                    readOnly
                    title="Email cannot be changed"
                    style={{ opacity: 0.6, cursor: 'not-allowed', background: 'var(--bg-muted)' }}
                />
            </div>

            <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                    name="phone"
                    type="tel"
                    defaultValue={user.phone || ''}
                    placeholder="+1 (555) 000-0000"
                    className="input"
                />
            </div>

            <div style={{ height: '1px', background: 'var(--border-light)', margin: '16px 0' }} />

            <div className="input-group">
                <label className="input-label">New Password</label>
                <input
                    name="password"
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="input"
                />
            </div>

            <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className="input"
                />
            </div>

            <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ marginTop: '8px' }}
            >
                {loading ? 'Saving...' : 'Save Changes'}
            </button>

            {status && (
                <div
                    style={{
                        marginTop: '12px',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '14px',
                        fontWeight: 500,
                        background: status.type === 'error' ? '#fef2f2' : '#f0fdf4',
                        color: status.type === 'error' ? '#dc2626' : '#16a34a',
                        border: `1px solid ${status.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                    }}
                >
                    {status.message}
                </div>
            )}
        </form>
    );
}
