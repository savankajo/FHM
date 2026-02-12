'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateProfile } from '@/app/actions/profile';

type User = {
    name: string | null;
    email: string;
};

export default function ProfileForm({ user }: { user: User }) {
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
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
        <form action={handleSubmit} className="space-y-4 max-w-md bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                    name="name"
                    defaultValue={user.name || ''}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
            </div>

            <hr className="my-4 border-gray-200" />

            <div>
                <label className="block text-sm font-medium mb-1">New Password (leave blank to keep current)</label>
                <input
                    name="password"
                    type="password"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                    name="confirmPassword"
                    type="password"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
            </Button>

            {status && (
                <div className={`p-3 rounded text-sm ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                    {status.message}
                </div>
            )}
        </form>
    );
}
