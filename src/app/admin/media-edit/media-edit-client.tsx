'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type MediaEditType = 'all' | 'sermon' | 'podcast';

export type MediaEditItem = {
    id: string;
    type: 'sermon' | 'podcast';
    typeLabel: string;
    title: string;
    accessLabel: string;
    editHref: string;
};

function startsWithSearch(title: string, query: string) {
    const cleanQuery = query.trim().toLocaleLowerCase();
    if (!cleanQuery) return true;
    return title.trim().toLocaleLowerCase().startsWith(cleanQuery);
}

export default function MediaEditClient({ items }: { items: MediaEditItem[] }) {
    const [type, setType] = useState<MediaEditType>('all');
    const [query, setQuery] = useState('');

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const typeMatches = type === 'all' || item.type === type;
            return typeMatches && startsWithSearch(item.title, query);
        });
    }, [items, query, type]);

    return (
        <div className="admin-media-access">
            <div className="media-search-wrap" style={{ display: 'grid', gap: 10 }}>
                <select
                    className="media-search-input"
                    value={type}
                    onChange={(event) => {
                        setType(event.target.value as MediaEditType);
                        setQuery('');
                    }}
                    aria-label="Choose media type"
                >
                    <option value="all">Sermons and Podcasts</option>
                    <option value="sermon">Sermons</option>
                    <option value="podcast">Podcasts</option>
                </select>
                <input
                    className="media-search-input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by first letter or title"
                    aria-label="Search media by title"
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
                        <Link key={`${item.type}-${item.id}`} href={item.editHref} className="admin-list-card admin-list-card-link">
                            <div className="admin-list-card-main">
                                <h2>{item.title}</h2>
                                <p>{item.typeLabel} - {item.accessLabel}</p>
                            </div>
                            <span className="admin-list-action-link">Edit</span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
