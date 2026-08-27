'use client';

export default function MediaError({ reset }: { reset: () => void }) {
    return (
        <main className="route-error" role="alert">
            <div className="route-state-icon" aria-hidden="true">!</div>
            <p className="page-kicker">Media unavailable</p>
            <h1>We couldn’t load this page.</h1>
            <p>Check your connection and try again. Your account and content permissions have not changed.</p>
            <button className="btn btn-primary" onClick={reset}>Try Again</button>
        </main>
    );
}
