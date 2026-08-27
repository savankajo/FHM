export default function MediaLoading() {
    return (
        <main className="media-page route-loading" aria-busy="true" aria-label="Loading Media">
            <div className="skeleton skeleton-heading" />
            <div className="skeleton skeleton-tabs" />
            <div className="skeleton skeleton-card" />
            <div className="skeleton skeleton-card" />
            <span className="sr-only">Loading Media…</span>
        </main>
    );
}
