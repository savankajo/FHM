export default function ArticleLoading() {
    return (
        <main className="content-shell route-loading" aria-busy="true" aria-label="Loading article">
            <div className="skeleton skeleton-heading" />
            <div className="skeleton skeleton-hero" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
            <span className="sr-only">Loading article…</span>
        </main>
    );
}
