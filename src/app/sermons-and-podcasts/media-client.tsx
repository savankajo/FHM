'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Article, PodcastEpisode, Sermon } from '@prisma/client';
import { getPodcastSeason, getSermonCollection } from '@/lib/media-metadata';
import { PUBLISHED_ARABIC_ARTICLES, type PublishedArabicArticle } from '@/data/published-arabic-articles';

type Tab = 'sermons' | 'podcasts' | 'articles';
type ArticleLanguage = 'en' | 'ar';

interface Props {
    sermons: Sermon[];
    podcasts: PodcastEpisode[];
    articles: Article[];
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

function isRestricted(item: Sermon | PodcastEpisode | Article) {
    return Array.isArray(item.audienceTeamIds) && item.audienceTeamIds.length > 0;
}

function formatCount(count: number, label: string) {
    if (count === 0) return `No ${label}s yet`;
    return `${count} ${label}${count === 1 ? '' : 's'}`;
}

function mediaDate(value: Date) {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
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

function ArticleCard({ article, featured = false, language = 'en' }: { article: Article | PublishedArabicArticle; featured?: boolean; language?: ArticleLanguage }) {
    const isPublishedArabic = 'sourceUrl' in article;
    const accessLabel = isPublishedArabic ? 'مقال PDF' : isRestricted(article) ? 'Team article' : 'Article';
    const date = new Date(article.publishedAt);
    const content = <>
            <div
                className={`article-card-media${article.imageUrl ? '' : ' fallback'}`}
                style={article.imageUrl ? { backgroundImage: `url(${article.imageUrl})` } : undefined}
                role="img"
                aria-label={article.imageUrl ? `${article.title} featured image` : language === 'ar' ? 'مجلة قلب الآب' : 'Father’s Heart Journal'}
            >
                {!article.imageUrl && <><span aria-hidden="true">FHM</span><small>Journal</small></>}
                <span className="article-type-badge">{accessLabel}</span>
            </div>
            <div className="article-card-content">
                <div className="article-card-meta">
                    <time dateTime={date.toISOString()}>{date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time>
                    {article.author && <><span aria-hidden="true">·</span><span>{article.author}</span></>}
                </div>
                <h3>{article.title}</h3>
                {article.summary && <p>{article.summary}</p>}
                <span className="article-read-link">{isPublishedArabic ? 'عرض المقال' : 'Read article'} <ChevronRight /></span>
            </div>
        </>;
    const className = `article-card${featured ? ' featured' : ''}${language === 'ar' ? ' article-card-rtl' : ''}`;
    return isPublishedArabic
        ? <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className={className} lang="ar" dir="rtl" aria-label={`عرض ${article.title} (PDF)`}>{content}</a>
        : <Link href={`/articles/${article.id}`} className={className}>{content}</Link>;
}

function EmptyState({ title, text, language = 'en' }: { title: string; text: string; language?: ArticleLanguage }) {
    return (
        <div className={`empty-state media-empty-state${language === 'ar' ? ' article-empty-rtl' : ''}`} lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="empty-state-icon">Media</div>
            <h2>{title}</h2>
            <p>{text}</p>
        </div>
    );
}

export default function MediaPageClient({ sermons, podcasts, articles, isAdmin }: Props) {
    const searchParams = useSearchParams();
    const requestedTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<Tab>(requestedTab === 'articles' || requestedTab === 'podcasts' ? requestedTab : 'sermons');
    const [sermonSearch, setSermonSearch] = useState('');
    const [podcastSearch, setPodcastSearch] = useState('');
    const [articleSearch, setArticleSearch] = useState('');
    const [articleLanguage, setArticleLanguage] = useState<ArticleLanguage>('en');

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
    const articleQuery = articleSearch.trim().toLocaleLowerCase();
    const selectedArticles = articleLanguage === 'ar' ? PUBLISHED_ARABIC_ARTICLES : articles;
    const latestArticles = selectedArticles
        .filter(article => !articleQuery || [article.title, article.author, article.summary || ''].some(value => value.toLowerCase().includes(articleQuery)))
        .slice(0, 6);
    const [featuredArticle, ...remainingArticles] = latestArticles;

    return (
        <>
            <div className="tab-bar media-tab-bar" role="tablist" aria-label="Media categories">
                {(['sermons', 'podcasts', 'articles'] as Tab[]).map(tab => (
                    <button
                        key={tab}
                        id={`media-tab-${tab}`}
                        className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                        role="tab"
                        aria-selected={activeTab === tab}
                        aria-controls={`media-panel-${tab}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {activeTab === 'sermons' && (
                <div id="media-panel-sermons" role="tabpanel" aria-labelledby="media-tab-sermons">
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
                </div>
            )}

            {activeTab === 'podcasts' && (
                <div id="media-panel-podcasts" role="tabpanel" aria-labelledby="media-tab-podcasts">
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
                            meta={seasonTwoPodcasts.length > 0 ? formatCount(seasonTwoPodcasts.length, 'episode') : 'Browse season'}
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
                </div>
            )}

            {activeTab === 'articles' && (
                <section id="media-panel-articles" className="articles-experience" role="tabpanel" aria-labelledby="media-tab-articles">
                    {isAdmin && (
                        <div className="media-admin-row">
                            <Link href="/admin/articles/new" className="btn btn-outline btn-sm btn-full">Add Article</Link>
                        </div>
                    )}

                    <div className={`articles-intro${articleLanguage === 'ar' ? ' articles-intro-rtl' : ''}`} lang={articleLanguage} dir={articleLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        <p className="page-kicker">Father’s Heart Journal</p>
                        <h2>{articleLanguage === 'ar' ? 'مقالات للرحلة' : 'Stories for a growing faith'}</h2>
                        <p>{articleLanguage === 'ar' ? 'اقرأ تأملات وموارد منشورة من خدمة قلب الآب.' : 'Thoughtful teaching and encouragement from our church community.'}</p>
                        <div className="article-language-selector" role="group" aria-label="Article language" dir="ltr">
                            <button type="button" className={articleLanguage === 'en' ? 'active' : ''} aria-pressed={articleLanguage === 'en'} onClick={() => { setArticleLanguage('en'); setArticleSearch(''); }}>English</button>
                            <button type="button" className={articleLanguage === 'ar' ? 'active' : ''} aria-pressed={articleLanguage === 'ar'} lang="ar" onClick={() => { setArticleLanguage('ar'); setArticleSearch(''); }}>العربية</button>
                        </div>
                    </div>
                    <div className="media-search-wrap">
                        <input
                            className="media-search-input"
                            type="search"
                            value={articleSearch}
                            onChange={(event) => setArticleSearch(event.target.value)}
                            placeholder={articleLanguage === 'ar' ? 'ابحث في المقالات العربية' : 'Search latest articles'}
                            aria-label={articleLanguage === 'ar' ? 'ابحث في المقالات العربية' : 'Search latest articles'}
                            lang={articleLanguage === 'ar' ? 'ar' : 'en'}
                            dir={articleLanguage === 'ar' ? 'rtl' : 'ltr'}
                        />
                    </div>
                    {featuredArticle ? (
                        <div className="articles-layout">
                            <ArticleCard article={featuredArticle} featured={!articleQuery} language={articleLanguage} />
                            {remainingArticles.length > 0 && (
                                <div className="article-grid" aria-label="More articles">
                                    {remainingArticles.map(article => <ArticleCard key={article.id} article={article} language={articleLanguage} />)}
                                </div>
                            )}
                        </div>
                    ) : (
                        <EmptyState
                            title={articleQuery ? (articleLanguage === 'ar' ? 'لم يتم العثور على مقالات' : 'No Articles Found') : (articleLanguage === 'ar' ? 'ستتوفر مقالات قريبًا' : 'Stories Are Coming Soon')}
                            text={articleQuery ? (articleLanguage === 'ar' ? 'جرّب عنوانًا أو كلمة مفتاحية أخرى.' : 'Try a different title, author, or keyword.') : (articleLanguage === 'ar' ? 'ستظهر المقالات هنا عند نشرها.' : 'Articles will appear here after they are published.')}
                            language={articleLanguage}
                        />
                    )}
                </section>
            )}
        </>
    );
}
