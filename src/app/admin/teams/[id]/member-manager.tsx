'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addTeamMember, removeTeamMember } from '@/app/actions/team-admin';

type Member = {
    id: string;
    name: string | null;
    email: string;
};

export default function TeamMemberManager({ teamId, members, allUsers }: { teamId: string, members: Member[], allUsers: Member[] }) {
    const [selectedEmail, setSelectedEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Filter out users who are already members
    const availableUsers = allUsers.filter(u => !members.some(m => m.id === u.id));

    async function handleAdd(formData: FormData) {
        setLoading(true);
        setStatus(null);
        // Use selectedEmail from state as fallback/primary if not in formData (select usually works with formData though)
        // But since we use controlled select, we can pass it directly or let formData pick it up.
        // The form action will receive formData.
        const email = formData.get('email') as string;

        if (!email) {
            setStatus({ type: 'error', message: 'Please select a user' });
            setLoading(false);
            return;
        }

        const result = await addTeamMember(teamId, email);

        if (result.error) {
            setStatus({ type: 'error', message: result.error });
        } else {
            setStatus({ type: 'success', message: 'Member added successfully!' });
            setSelectedEmail('');
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
            <div className="bg-white p-4 rounded shadow border border-gray-100">
                <h3 className="font-bold mb-3 text-lg">Add Team Member</h3>
                <form action={handleAdd} className="flex gap-2">
                    <select
                        name="email"
                        className="flex-1 p-2 border rounded bg-gray-50 text-black"
                        required
                        value={selectedEmail}
                        onChange={e => setSelectedEmail(e.target.value)}
                    >
                        <option value="">-- Select a User --</option>
                        {availableUsers.map(user => (
                            <option key={user.id} value={user.email}>
                                {user.name || user.email} ({user.email})
                            </option>
                        ))}
                    </select>
                    <Button type="submit" disabled={loading || !selectedEmail}>
                        {loading ? 'Adding...' : 'Add Member'}
                    </Button>
                </form>
                {status && (
                    <p className={`mt-2 text-sm ${status.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                        {status.message}
                    </p>
                )}
            </div>

            <div className="bg-white p-4 rounded shadow border border-gray-100">
                <h3 className="font-bold mb-3 text-lg">Current Members ({members.length})</h3>
                {members.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">No members in this team.</p>
                ) : (
                    <ul className="space-y-2">
                        {members.map(member => (
                            <li key={member.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {(member.name || member.email).substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium">{member.name || 'Unnamed'}</div>
                                        <div className="text-xs text-gray-500">{member.email}</div>
                                    </div>
                                </div>
                                <form action={() => handleRemove(member.id)}>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
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
