import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Sermon, PodcastEpisode } from '@prisma/client';

async function getSermons(): Promise<Sermon[]> {
    return await prisma.sermon.findMany({
        orderBy: { date: 'desc' },
        take: 10,
    });
}

async function getPodcasts(): Promise<PodcastEpisode[]> {
    return await prisma.podcastEpisode.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 10,
    });
}

export const dynamic = 'force-dynamic';

// ── Arrow Icon ────────────────────────────────────────────────
function ChevronRight() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

// ── Play Icon ─────────────────────────────────────────────────
function PlayIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="white">
            <polygon points="5,3 19,12 5,21" />
        </svg>
    );
}

// ── Live Banner ───────────────────────────────────────────────
async function LiveBanner() {
    try {
        const liveLink = await prisma.liveLink.findFirst({
            where: { expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' }
        });
        if (!liveLink) return null;
        return (
            <div className="live-banner">
                <div className="live-banner-left">
                    <span className="live-pulse-dot" />
                    <div className="live-banner-text">
                        <h3>We are Live!</h3>
                        <p>Join our live service happening now</p>
                    </div>
                </div>
                <a href={liveLink.url} target="_blank" rel="noopener noreferrer" className="live-banner-btn">
                    Watch ↗
                </a>
            </div>
        );
    } catch {
        return null;
    }
}

// ── Sermon Card ───────────────────────────────────────────────
function SermonCard({ sermon, featured }: { sermon: Sermon; featured?: boolean }) {
    if (featured) {
        return (
            <Link href={`/sermons/${sermon.id}`} className="featured-media-card">
                <div className="featured-media-overlay" />
                <div className="featured-media-content">
                    <div className="featured-media-badge">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                        Featured Sermon
                    </div>
                    <div className="featured-media-title">{sermon.title}</div>
                    <div className="featured-media-meta">
                        {new Date(sermon.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {sermon.speaker ? ` · ${sermon.speaker}` : ''}
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/sermons/${sermon.id}`} className="media-list-card">
            <div className="media-list-thumb" style={{ background: 'linear-gradient(135deg, #3a1a08, #C7511F)' }}>
                <span style={{ fontSize: '20px' }}>🎥</span>
                <div className="media-list-play"><PlayIcon /></div>
            </div>
            <div className="media-list-info">
                <div className="media-list-title">{sermon.title}</div>
                <div className="media-list-meta">
                    {new Date(sermon.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {sermon.speaker ? ` · ${sermon.speaker}` : ''}
                </div>
            </div>
            <div className="media-list-arrow"><ChevronRight /></div>
        </Link>
    );
}

// ── Podcast Card ──────────────────────────────────────────────
function PodcastCard({ pod, featured }: { pod: PodcastEpisode; featured?: boolean }) {
    if (featured) {
        return (
            <Link href={`/podcasts/${pod.id}`} className="featured-media-card" style={{ background: 'linear-gradient(135deg, #1a0830 0%, #5b21b6 100%)' }}>
                <div className="featured-media-overlay" />
                <div className="featured-media-content">
                    <div className="featured-media-badge" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="3" /><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="white" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="white" strokeWidth="2" /></svg>
                        Featured Podcast
                    </div>
                    <div className="featured-media-title">{pod.title}</div>
                    <div className="featured-media-meta">
                        {new Date(pod.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={`/podcasts/${pod.id}`} className="media-list-card">
            <div className="media-list-thumb" style={{ background: 'linear-gradient(135deg, #1a0830, #7c3aed)' }}>
                <span style={{ fontSize: '20px' }}>🎧</span>
                <div className="media-list-play"><PlayIcon /></div>
            </div>
            <div className="media-list-info">
                <div className="media-list-title">{pod.title}</div>
                <div className="media-list-meta">
                    {new Date(pod.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
            </div>
            <div className="media-list-arrow"><ChevronRight /></div>
        </Link>
    );
}

// ── Tab Content ───────────────────────────────────────────────
function SermonsTab({ sermons, isAdmin }: { sermons: Sermon[]; isAdmin: boolean }) {
    if (sermons.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🎥</div>
                <p>No sermons uploaded yet.<br />Check back soon!</p>
            </div>
        );
    }
    const [featured, ...rest] = sermons;
    return (
        <>
            {isAdmin && (
                <div style={{ padding: '0 20px 16px' }}>
                    <Link href="/admin/sermons/new">
                        <button className="btn btn-outline btn-sm btn-full">+ Upload Sermon</button>
                    </Link>
                </div>
            )}
            <SermonCard sermon={featured} featured />
            {rest.length > 0 && (
                <>
                    <div className="media-section-title" style={{ marginTop: '20px' }}>Latest Sermons</div>
                    <div className="media-list">
                        {rest.map(s => <SermonCard key={s.id} sermon={s} />)}
                    </div>
                </>
            )}
        </>
    );
}

function PodcastsTab({ podcasts }: { podcasts: PodcastEpisode[] }) {
    if (podcasts.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">🎧</div>
                <p>No podcast episodes yet.<br />Check back soon!</p>
            </div>
        );
    }
    const [featured, ...rest] = podcasts;
    return (
        <>
            <PodcastCard pod={featured} featured />
            {rest.length > 0 && (
                <>
                    <div className="media-section-title" style={{ marginTop: '20px' }}>Podcast Series</div>
                    <div className="media-list">
                        {rest.map(p => <PodcastCard key={p.id} pod={p} />)}
                    </div>
                </>
            )}
        </>
    );
}

function MusicTab() {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">🎵</div>
            <p>Music library coming soon!<br />Stay tuned for worship music.</p>
        </div>
    );
}

// ── Media Page Client Wrapper ─────────────────────────────────
import MediaPageClient from './media-client';

export default async function SermonsAndPodcastsPage() {
    const session = await getSession();
    const sermons = await getSermons();
    const podcasts = await getPodcasts();
    const isAdmin = session?.role === 'ADMIN';

    return (
        <div className="media-page">
            {/* Page Header */}
            <div className="page-header">
                <h1 className="page-title">Media</h1>
                {isAdmin && (
                    <Link href="/admin" className="admin-badge">Admin</Link>
                )}
            </div>

            {/* Live Banner */}
            <LiveBanner />

            {/* Tab-based content */}
            <MediaPageClient
                sermons={sermons}
                podcasts={podcasts}
                isAdmin={isAdmin}
            />
        </div>
    );
}
