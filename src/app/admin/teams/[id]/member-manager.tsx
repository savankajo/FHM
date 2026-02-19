'use client';

import { useState } from 'react';
import { addTeamMember, removeTeamMember } from '@/app/actions/team-admin';

type Member = {
    id: string;
    name: string | null;
    email: string;
};

function getRoleBadge(email: string) {
    // Derive a short role label from email domain hints or fallback
    if (email.includes('admin') || email.includes('ministry')) return 'AD';
    return 'SA';
}

export default function TeamMemberManager({ teamId, members, allUsers }: { teamId: string, members: Member[], allUsers: Member[] }) {
    const [selectedEmail, setSelectedEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const availableUsers = allUsers.filter(u => !members.some(m => m.id === u.id));

    async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        if (!selectedEmail) {
            setStatus({ type: 'error', message: 'Please select a user' });
            setLoading(false);
            return;
        }

        const result = await addTeamMember(teamId, selectedEmail);

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
        <div className="atm-member-manager">
            {/* Add Team Member Card */}
            <div className="atm-card atm-add-member-card">
                <div className="atm-card-label">Add Team Member</div>
                <form onSubmit={handleAdd} className="atm-add-form">
                    <div className="atm-select-wrap">
                        <select
                            name="email"
                            className="atm-select"
                            required
                            value={selectedEmail}
                            onChange={e => setSelectedEmail(e.target.value)}
                            disabled={availableUsers.length === 0}
                        >
                            <option value="">
                                {availableUsers.length === 0 ? 'All users are members' : '— Select a User —'}
                            </option>
                            {availableUsers.map(user => (
                                <option key={user.id} value={user.email}>
                                    {user.name || user.email} ({user.email})
                                </option>
                            ))}
                        </select>
                        <span className="atm-select-chevron">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </span>
                    </div>

                    <div className="atm-add-form-footer">
                        {status && (
                            <p className={`atm-status-msg ${status.type === 'error' ? 'atm-status-error' : 'atm-status-success'}`}>
                                {status.type === 'success' ? '✓ ' : '⚠ '}{status.message}
                            </p>
                        )}
                        <button
                            type="submit"
                            className="atm-btn-primary"
                            disabled={loading || !selectedEmail}
                        >
                            {loading ? (
                                <>
                                    <span className="atm-spinner" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Add Member
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Confirmed Members List */}
            <div className="atm-card atm-members-card">
                <div className="atm-card-label">
                    Confirmed Members
                    <span className="atm-member-count">{members.length}</span>
                </div>

                {members.length === 0 ? (
                    <div className="atm-members-empty">
                        <span style={{ fontSize: '28px', opacity: 0.4 }}>👥</span>
                        <p>No members yet. Add your first team member above.</p>
                    </div>
                ) : (
                    <ul className="atm-members-scroll-list">
                        {members.map(member => {
                            const initials = (member.name || member.email).substring(0, 2).toUpperCase();
                            const role = getRoleBadge(member.email);
                            return (
                                <li key={member.id} className="atm-member-row">
                                    <div className="atm-member-left">
                                        <span className="atm-role-pill">{role}</span>
                                        <div className="atm-member-info">
                                            <div className="atm-member-name">{member.name || initials}</div>
                                            <div className="atm-member-email">{member.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        className="atm-remove-btn"
                                        onClick={() => handleRemove(member.id)}
                                        aria-label={`Remove ${member.name || member.email}`}
                                    >
                                        Remove
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
