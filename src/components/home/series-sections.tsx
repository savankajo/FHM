import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────
type SeriesItem = {
    id: string;
    title: string;
    episodes: number;
    thumbnailUrl: string | null;
    type: 'sermon' | 'podcast';
    url: string;
};

// ── Section Header ────────────────────────────────────────────
function SectionHeader({ title, href }: { title: string; href: string }) {
    return (
        <div className="section-header">
            <span className="section-title">{title}</span>
            <Link href={href} className="section-link">See all →</Link>
        </div>
    );
}

// ── Single Series Card ────────────────────────────────────────
function SeriesCard({ item }: { item: SeriesItem }) {
    const isSermon = item.type === 'sermon';
    const gradient = isSermon
        ? 'linear-gradient(135deg, #3a1a08 0%, #C7511F 100%)'
        : 'linear-gradient(135deg, #1a0830 0%, #7c3aed 100%)';
    const icon = isSermon ? '🎥' : '🎧';

    return (
        <Link href={item.url} className="series-card">
            <div
                className="series-card-thumb"
                style={
                    item.thumbnailUrl
                        ? { backgroundImage: `url(${item.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { background: gradient }
                }
            >
                {!item.thumbnailUrl && <span className="series-card-icon">{icon}</span>}
                <div className="series-card-overlay" />
                <div className="series-ep-badge">
                    {item.episodes} {item.episodes === 1 ? 'episode' : 'episodes'}
                </div>
            </div>
            <div className="series-card-body">
                <div className="series-card-title">{item.title}</div>
                <div className="series-card-type">{isSermon ? 'Sermon' : 'Podcast'}</div>
            </div>
        </Link>
    );
}

// ── Sermon Series Section ─────────────────────────────────────
export function SermonSeriesSection({
    sermons,
}: {
    sermons: Array<{ id: string; title: string; speaker: string; thumbnailUrl: string | null }>;
}) {
    if (sermons.length === 0) return null;

    // Group by speaker as "series" (simple grouping without backend series model)
    const speakerMap = new Map<string, { id: string; count: number; thumbnailUrl: string | null }>();
    for (const s of sermons) {
        const key = s.speaker || 'Featured';
        if (!speakerMap.has(key)) {
            speakerMap.set(key, { id: s.id, count: 0, thumbnailUrl: s.thumbnailUrl });
        }
        speakerMap.get(key)!.count++;
    }

    const items: SeriesItem[] = Array.from(speakerMap.entries()).map(([speaker, data]) => ({
        id: data.id,
        title: speaker,
        episodes: data.count,
        thumbnailUrl: data.thumbnailUrl,
        type: 'sermon',
        url: '/sermons-and-podcasts',
    }));

    return (
        <section className="home-series-section">
            <SectionHeader title="Sermon Series" href="/sermons-and-podcasts" />
            <div className="series-scroll-wrap">
                {items.map((item) => (
                    <SeriesCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}

// ── Podcast Series Section ────────────────────────────────────
export function PodcastSeriesSection({
    podcasts,
}: {
    podcasts: Array<{ id: string; title: string; thumbnailUrl: string | null }>;
}) {
    if (podcasts.length === 0) return null;

    // Treat each podcast episode as its own card (no backend series model)
    const items: SeriesItem[] = podcasts.slice(0, 8).map((p) => ({
        id: p.id,
        title: p.title,
        episodes: 1,
        thumbnailUrl: p.thumbnailUrl,
        type: 'podcast',
        url: `/podcasts/${p.id}`,
    }));

    return (
        <section className="home-series-section">
            <SectionHeader title="Podcast Series" href="/sermons-and-podcasts" />
            <div className="series-scroll-wrap">
                {items.map((item) => (
                    <SeriesCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}
