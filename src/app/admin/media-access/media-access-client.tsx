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
    editHref: string;
};

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

export default function MediaAccessClient({ items }: { items: MediaAccessItem[] }) {
    const [collection, setCollection] = useState<SermonCollection>('saturday');
    const [query, setQuery] = useState('');

    const filteredItems = useMemo(() => {
        return items.filter(item => item.collection === collection && startsWithSearch(item.title, query));
    }, [collection, items, query]);

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
