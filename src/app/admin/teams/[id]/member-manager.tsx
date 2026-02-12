'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addTeamMember, removeTeamMember } from '@/app/actions/team-admin';

type Member = {
    id: string;
    name: string;
    email: string;
};

export default function TeamMemberManager({ teamId, members }: { teamId: string, members: Member[] }) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleAdd(formData: FormData) {
        setLoading(true);
        setStatus(null);
        const emailInput = formData.get('email') as string;

        const result = await addTeamMember(teamId, emailInput);

        if (result.error) {
            setStatus({ type: 'error', message: result.error });
        } else {
            setStatus({ type: 'success', message: 'Member added successfully' });
            setEmail('');
        }
        setLoading(false);
    }

    async function handleRemove(userId: string) {
        if (!confirm('Are you sure you want to remove this member?')) return;

        const result = await removeTeamMember(teamId, userId);
        if (result.error) {
            alert(result.error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold mb-3">Add Member</h3>
                <form action={handleAdd} className="flex gap-2">
                    <input
                        type="email"
                        name="email"
                        placeholder="User Email (e.g. user@example.com)"
                        className="flex-1 p-2 border rounded"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add'}
                    </Button>
                </form>
                {status && (
                    <p className={`mt-2 text-sm ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                        {status.message}
                    </p>
                )}
            </div>

            <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold mb-3">Current Members ({members.length})</h3>
                {members.length === 0 ? (
                    <p className="text-gray-500 text-sm">No members in this team.</p>
                ) : (
                    <ul className="space-y-2">
                        {members.map(member => (
                            <li key={member.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                <div>
                                    <div className="font-medium">{member.name || 'Unnamed'}</div>
                                    <div className="text-xs text-gray-500">{member.email}</div>
                                </div>
                                <form action={() => handleRemove(member.id)}>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                        Remove
                                    </Button>
                                </form>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
