'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Impact = {
    sermons: number;
    podcasts: number;
    articles: number;
    events: number;
};

export default function DeleteTeamButton({ teamId, teamName, impact, compact = false }: { teamId: string; teamName: string; impact: Impact; compact?: boolean }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const affected = impact.sermons + impact.podcasts + impact.articles + impact.events;

    async function removeTeam() {
        const impactMessage = affected
            ? `\n\nAffected content will have this team removed from its audience:\n• ${impact.sermons} sermon(s)\n• ${impact.podcasts} podcast episode(s)\n• ${impact.articles} article(s)\n• ${impact.events} event(s)`
            : '';
        if (!window.confirm(`Delete “${teamName}”? This cannot be undone.${impactMessage}`)) return;

        setDeleting(true);
        setError('');
        try {
            const response = await fetch(`/api/admin/teams?id=${encodeURIComponent(teamId)}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to delete team');
            router.push('/admin/teams');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete team');
            setDeleting(false);
        }
    }

    if (compact) return (
        <div className="admin-team-remove-wrap">
            <button type="button" className="admin-team-remove-button" onClick={removeTeam} disabled={deleting}>
                {deleting ? 'Removing…' : 'Remove'}
            </button>
            {error && <span className="form-error" role="alert">{error}</span>}
        </div>
    );

    return (
        <div className="admin-danger-zone">
            <div>
                <h2>Remove Team</h2>
                <p>Deletes this team, its memberships, services, and chat history. Content audience references will be safely removed.</p>
                {affected > 0 && <p className="admin-danger-impact">This affects {affected} content item{affected === 1 ? '' : 's'}.</p>}
            </div>
            <button type="button" className="admin-danger-button" onClick={removeTeam} disabled={deleting}>
                {deleting ? 'Removing…' : 'Remove Team'}
            </button>
            {error && <p className="form-error" role="alert">{error}</p>}
        </div>
    );
}
