'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PodcastEpisode, Sermon } from '@prisma/client';
import { getPodcastSeason, getSermonCollection } from '@/lib/media-metadata';

type Tab = 'sermons' | 'podcasts' | 'articles';

interface Props {
    sermons: Sermon[];
    podcasts: PodcastEpisode[];
    isAdmin: boolean;
}

function ChevronRight() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

function ExternalIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
        </svg>
    );
}

function isRestricted(item: Sermon | PodcastEpisode) {
    return Array.isArray(item.audienceTeamIds) && item.audienceTeamIds.length > 0;
}

function formatCount(count: number, label: string) {
    if (count === 0) return `No ${label}s yet`;
    return `${count} ${label}${count === 1 ? '' : 's'}`;
}

function mediaDate(value: Date) {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function CollectionCard({
    title,
    description,
    meta,
    href,
    tone = 'orange',
    restricted = false,
    comingSoon = false,
}: {
    title: string;
    description: string;
    meta: string;
    href?: string;
    tone?: 'orange' | 'purple' | 'gray';
    restricted?: boolean;
    comingSoon?: boolean;
}) {
    const content = (
        <>
            <div className={`media-collection-mark ${tone}`}>
                {comingSoon ? 'Soon' : tone === 'purple' ? 'Pod' : 'Media'}
            </div>
            <div className="media-list-info">
                <div className="media-list-title">{title}</div>
                <div className="media-list-meta">{description}</div>
                <div className="media-collection-footer">
                    <span>{meta}</span>
                    {restricted && <span className="media-access-badge">Team access</span>}
                </div>
            </div>
            <div className="media-list-arrow">{href ? <ChevronRight /> : <ExternalIcon />}</div>
        </>
    );

    if (!href) {
        return <div className="media-list-card media-collection-card inactive">{content}</div>;
    }

    return (
        <Link href={href} className="media-list-card media-collection-card">
            {content}
        </Link>
    );
}

function EpisodeCard({ item, type }: { item: Sermon | PodcastEpisode; type: 'sermon' | 'podcast' }) {
    const href = type === 'sermon' ? `/sermons/${item.id}` : `/podcasts/${item.id}`;
    const thumb = item.thumbnailUrl;
    const date = type === 'sermon' ? (item as Sermon).date : (item as PodcastEpisode).publishedAt;

    return (
        <Link href={href} className="media-list-card">
            <div
                className="media-list-thumb"
                style={thumb
                    ? { backgroundImage: `url(${thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : { background: type === 'sermon' ? 'linear-gradient(135deg, #3a1a08, #C7511F)' : 'linear-gradient(135deg, #2b183f, #8a4a21)' }}
            />
            <div className="media-list-info">
                <div className="media-list-title">{item.title}</div>
                <div className="media-list-meta">
                    {mediaDate(date)}
                    {isRestricted(item) ? ' · Team access' : ''}
                </div>
            </div>
            <div className="media-list-arrow"><ChevronRight /></div>
        </Link>
    );
}

function EmptyState({ title, text }: { title: string; text: string }) {
    return (
        <div className="empty-state media-empty-state">
            <div className="empty-state-icon">Media</div>
            <h2>{title}</h2>
            <p>{text}</p>
        </div>
    );
}

export default function MediaPageClient({ sermons, podcasts, isAdmin }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('sermons');
    const [sermonSearch, setSermonSearch] = useState('');
    const [podcastSearch, setPodcastSearch] = useState('');

    const saturdaySermons = useMemo(() => sermons.filter(sermon => getSermonCollection(sermon.notes) === 'saturday'), [sermons]);
    const tuesdayMeetings = useMemo(() => sermons.filter(sermon => getSermonCollection(sermon.notes) === 'tuesday'), [sermons]);
    const thursdayMeetings = useMemo(() => sermons.filter(sermon => getSermonCollection(sermon.notes) === 'thursday'), [sermons]);
    const seasonOnePodcasts = useMemo(() => podcasts.filter(podcast => getPodcastSeason(podcast.description) === 'season-1'), [podcasts]);
    const seasonTwoPodcasts = useMemo(() => podcasts.filter(podcast => getPodcastSeason(podcast.description) === 'season-2'), [podcasts]);
    const latestSermons = saturdaySermons
        .filter(sermon => sermon.title.toLowerCase().includes(sermonSearch.trim().toLowerCase()))
        .slice(0, 3);
    const latestPodcasts = seasonOnePodcasts
        .filter(podcast => podcast.title.toLowerCase().includes(podcastSearch.trim().toLowerCase()))
        .slice(0, 3);

    return (
        <>
            <div className="tab-bar media-tab-bar" role="tablist" aria-label="Media categories">
                {(['sermons', 'podcasts', 'articles'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                        role="tab"
                        aria-selected={activeTab === tab}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'sermons' && (
                <>
                    {isAdmin && (
                        <div className="media-admin-row">
                            <Link href="/admin/sermons/new" className="btn btn-outline btn-sm btn-full">Add Sermon</Link>
                        </div>
                    )}

                    <div className="media-section-title">Sermon Collections</div>
                    <div className="media-list">
                        <CollectionCard
                            title="Saturday Sermon"
                            description="Public weekly sermon messages from FHM Church."
                            meta={formatCount(saturdaySermons.length, 'episode')}
                            href="/sermons-and-podcasts/saturday"
                        />
                        {(isAdmin || tuesdayMeetings.length > 0) && <CollectionCard
                            title="Tuesday Meeting"
                            description="Meeting recordings for approved teams."
                            meta={formatCount(tuesdayMeetings.length, 'recording')}
                            href={tuesdayMeetings[0] ? `/sermons/${tuesdayMeetings[0].id}` : undefined}
                            restricted
                        />}
                        {(isAdmin || thursdayMeetings.length > 0) && <CollectionCard
                            title="Thursday Meeting"
                            description="Meeting recordings with separate team visibility."
                            meta={formatCount(thursdayMeetings.length, 'recording')}
                            href={thursdayMeetings[0] ? `/sermons/${thursdayMeetings[0].id}` : undefined}
                            restricted
                        />}
                    </div>

                    <div className="media-section-title">Latest Sermons</div>
                    <div className="media-search-wrap">
                        <input
                            className="media-search-input"
                            type="search"
                            value={sermonSearch}
                            onChange={(event) => setSermonSearch(event.target.value)}
                            placeholder="Search latest sermons"
                            aria-label="Search latest sermons"
                        />
                    </div>
                    {latestSermons.length > 0 ? (
                        <div className="media-list">
                                {latestSermons.map(sermon => <EpisodeCard key={sermon.id} item={sermon} type="sermon" />)}
                        </div>
                    ) : (
                        <EmptyState title="No Sermons Found" text="Try another search or open Saturday Sermon for all playlists." />
                    )}
                </>
            )}

            {activeTab === 'podcasts' && (
                <>
                    <div className="media-section-title">Podcast Seasons</div>
                    <div className="media-list">
                        <CollectionCard
                            title="Coffee With the Shepherd"
                            description="Season 1 podcast conversations and episodes."
                            meta={formatCount(seasonOnePodcasts.length, 'episode')}
                            href="/sermons-and-podcasts/podcasts/season-1"
                            tone="purple"
                        />
                        <CollectionCard
                            title="Season 2"
                            description="A new podcast season is being prepared."
                            meta={seasonTwoPodcasts.length > 0 ? formatCount(seasonTwoPodcasts.length, 'episode') : 'Coming soon'}
                            href={seasonTwoPodcasts.length > 0 ? '/sermons-and-podcasts/podcasts/season-2' : undefined}
                            tone="gray"
                            comingSoon={seasonTwoPodcasts.length === 0}
                        />
                    </div>

                    <div className="media-section-title">Latest Podcasts</div>
                    <div className="media-search-wrap">
                        <input
                            className="media-search-input"
                            type="search"
                            value={podcastSearch}
                            onChange={(event) => setPodcastSearch(event.target.value)}
                            placeholder="Search latest podcasts"
                            aria-label="Search latest podcasts"
                        />
                    </div>
                    {latestPodcasts.length > 0 ? (
                        <div className="media-list">
                                {latestPodcasts.map(podcast => <EpisodeCard key={podcast.id} item={podcast} type="podcast" />)}
                        </div>
                    ) : (
                        <EmptyState title="No Podcasts Found" text="Try another search or open Coffee With the Shepherd for all episodes." />
                    )}
                </>
            )}

            {activeTab === 'articles' && (
                <EmptyState
                    title="Articles Coming Soon"
                    text="No articles have been uploaded yet. This section will replace the old Music category."
                />
            )}
        </>
    );
}
