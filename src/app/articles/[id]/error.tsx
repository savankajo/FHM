'use client';

import Link from 'next/link';

export default function ArticleError({ reset }: { reset: () => void }) {
    return (
        <main className="route-error" role="alert">
            <div className="route-state-icon" aria-hidden="true">!</div>
            <p className="page-kicker">Article unavailable</p>
            <h1>We couldn’t open this article.</h1>
            <p>Try again, or return to the journal to choose another story.</p>
            <div className="route-state-actions">
                <button className="btn btn-primary" onClick={reset}>Try Again</button>
                <Link className="btn btn-outline" href="/sermons-and-podcasts?tab=articles">All Articles</Link>
            </div>
        </main>
    );
}
