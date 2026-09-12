'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function GlobalSearch({ initialQuery = '' }: { initialQuery?: string }) {
    const [query, setQuery] = useState(initialQuery);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="search-bar-container" role="search">
            <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Search sermons, podcasts, and articles"
                    aria-label="Search sermons, podcasts, and articles"
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>
            <button type="submit" className="search-submit" disabled={!query.trim()}>Search</button>
        </form>
    );
}
