'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { SermonCollection } from '@/lib/media-metadata';

export type MediaAccessItem = {
    id: string;
    title: string;
    collection: SermonCollection;
    collectionLabel: string;
    dateLabel: string;
    accessLabel: string;
    audienceTeamIds: string[];
    editHref: string;
};

export type TeamOption = { id: string; name: string };
export type CollectionAccessState = Record<SermonCollection, string[]>;

const COLLECTIONS: Array<{ id: SermonCollection; label: string }> = [
    { id: 'saturday', label: 'Saturday Sermon / عظة السبت' },
    { id: 'tuesday', label: 'Tuesday Meeting / اجتماع الثلاثاء' },
    { id: 'thursday', label: 'Thursday Meeting / اجتماع الخميس' },
];

function startsWithSearch(title: string, query: string) {
    const cleanQuery = query.trim().toLocaleLowerCase();
    if (!cleanQuery) return true;
    return title.trim().toLocaleLowerCase().startsWith(cleanQuery);
}

export default function MediaAccessClient({ items, teams, initialAccess }: { items: MediaAccessItem[]; teams: TeamOption[]; initialAccess: CollectionAccessState }) {
    const [collection, setCollection] = useState<SermonCollection>('saturday');
    const [query, setQuery] = useState('');
    const [access, setAccess] = useState<CollectionAccessState>(initialAccess);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const filteredItems = useMemo(() => {
        return items.filter(item => item.collection === collection && startsWithSearch(item.title, query));
    }, [collection, items, query]);

    const selectedTeamIds = access[collection] || [];

    const toggleTeam = (teamId: string) => {
        setAccess(current => {
            const selected = new Set(current[collection] || []);
            if (selected.has(teamId)) selected.delete(teamId);
            else selected.add(teamId);
            return { ...current, [collection]: Array.from(selected) };
        });
    };

    const saveCollectionAccess = async () => {
        setSaving(true);
        setMessage('');
        const response = await fetch('/api/admin/media-access', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collection, audienceTeamIds: selectedTeamIds }),
        });
        const data = await response.json().catch(() => ({}));
        setSaving(false);
        setMessage(response.ok ? `Saved access for ${data.updated || 0} items.` : 'Could not save access.');
    };

    return (
        <div className="admin-media-access">
            <div className="admin-access-tabs" role="tablist" aria-label="Sermon collections">
                {COLLECTIONS.map(option => {
                    const count = items.filter(item => item.collection === option.id).length;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            className={`admin-access-tab${collection === option.id ? ' active' : ''}`}
                            onClick={() => {
                                setCollection(option.id);
                                setQuery('');
                            }}
                        >
                            <span>{option.label}</span>
                            <small>{count} items</small>
                        </button>
                    );
                })}
            </div>

            <div className="settings-card" style={{ padding: 16 }}>
                <h2 className="settings-section-title" style={{ marginBottom: 12 }}>Collection Access</h2>
                <label style={{ display: 'block', marginBottom: 10 }}>
                    <input
                        type="radio"
                        checked={selectedTeamIds.length === 0}
                        onChange={() => setAccess(current => ({ ...current, [collection]: [] }))}
                    /> Everyone
                </label>
                <div style={{ display: 'grid', gap: 10 }}>
                    {teams.map(team => (
                        <label key={team.id}>
                            <input
                                type="checkbox"
                                checked={selectedTeamIds.includes(team.id)}
                                onChange={() => toggleTeam(team.id)}
                            /> {team.name}
                        </label>
                    ))}
                </div>
                <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={saveCollectionAccess} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Collection Access'}
                </button>
                {message && <p className="settings-description" style={{ marginTop: 10 }}>{message}</p>}
            </div>

            <div className="media-search-wrap">
                <input
                    className="media-search-input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by first letter or title"
                    aria-label="Search media access by title"
                />
            </div>

            <div className="admin-list-stack">
                {filteredItems.length === 0 ? (
                    <div className="admin-empty-state">
                        <h2>No matching media</h2>
                        <p>Search uses the first letters of the title in English or Arabic.</p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <Link key={item.id} href={item.editHref} className="admin-list-card admin-list-card-link">
                            <div className="admin-list-card-main">
                                <h2>{item.title}</h2>
                                <p>{item.collectionLabel} - {item.dateLabel} - {item.accessLabel}</p>
                            </div>
                            <span className="admin-list-action-link">Edit Access</span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
