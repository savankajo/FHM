'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sermon, PodcastEpisode } from '@prisma/client';

type Tab = 'sermons' | 'podcasts' | 'music';

function ChevronRight() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

function PlayIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="white">
            <polygon points="5,3 19,12 5,21" />
        </svg>
    );
}

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

function PodcastCard({ pod, featured }: { pod: PodcastEpisode; featured?: boolean }) {
    if (featured) {
        return (
            <Link href={`/podcasts/${pod.id}`} className="featured-media-card" style={{ background: 'linear-gradient(135deg, #1a0830 0%, #5b21b6 100%)' }}>
                <div className="featured-media-overlay" />
                <div className="featured-media-content">
                    <div className="featured-media-badge" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                        🎧 Featured Podcast
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

interface Props {
    sermons: Sermon[];
    podcasts: PodcastEpisode[];
    isAdmin: boolean;
}

export default function MediaPageClient({ sermons, podcasts, isAdmin }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('sermons');

    return (
        <>
            {/* Tab Bar */}
            <div className="tab-bar">
                {(['sermons', 'podcasts', 'music'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ transition: 'opacity 0.2s ease', opacity: 1 }}>

                {activeTab === 'sermons' && (
                    <>
                        {sermons.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🎥</div>
                                <p>No sermons uploaded yet.<br />Check back soon!</p>
                            </div>
                        ) : (
                            <>
                                {isAdmin && (
                                    <div style={{ padding: '0 20px 16px' }}>
                                        <Link href="/admin/sermons/new">
                                            <button className="btn btn-outline btn-sm btn-full">+ Upload Sermon</button>
                                        </Link>
                                    </div>
                                )}
                                <SermonCard sermon={sermons[0]} featured />
                                {sermons.length > 1 && (
                                    <>
                                        <div className="media-section-title" style={{ marginTop: '20px' }}>Latest Sermons</div>
                                        <div className="media-list">
                                            {sermons.slice(1).map(s => <SermonCard key={s.id} sermon={s} />)}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

                {activeTab === 'podcasts' && (
                    <>
                        {podcasts.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🎧</div>
                                <p>No podcast episodes yet.<br />Check back soon!</p>
                            </div>
                        ) : (
                            <>
                                <PodcastCard pod={podcasts[0]} featured />
                                {podcasts.length > 1 && (
                                    <>
                                        <div className="media-section-title" style={{ marginTop: '20px' }}>Podcast Series</div>
                                        <div className="media-list">
                                            {podcasts.slice(1).map(p => <PodcastCard key={p.id} pod={p} />)}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

                {activeTab === 'music' && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🎵</div>
                        <p>Music library coming soon!<br />Stay tuned for worship music.</p>
                    </div>
                )}

            </div>
        </>
    );
}
