import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { GlobalSearch } from '@/components/ui/global-search';
import { getSession } from '@/lib/auth';
import { canSeeAudience } from '@/lib/audience';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
    searchParams,
}: {
    searchParams?: Promise<{ q?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const query = (resolvedSearchParams?.q || '').trim().slice(0, 100);

    if (!query) {
        return (
            <main className="search-page">
                <header className="search-page-hero"><p className="page-kicker">Find what you need</p><h1>Search the library</h1><p>Explore sermons, podcasts, and articles from Father’s Heart Church.</p></header>
                <section className="search-page-content"><GlobalSearch /></section>
            </main>
        );
    }

    const session = await getSession();
    const isAdmin = session?.role === 'ADMIN';
    const teams = session ? await prisma.team.findMany({ where: { members: { some: { id: session.userId } } }, select: { id: true } }) : [];
    const teamIds = teams.map(team => team.id);
    const [sermons, podcasts, articles] = await Promise.all([
        prisma.sermon.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { speaker: { contains: query, mode: 'insensitive' } },
                ]
            },
            take: 10
        }),
        prisma.podcastEpisode.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ]
            },
            take: 10
        }),
        prisma.article.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { author: { contains: query, mode: 'insensitive' } },
                    { summary: { contains: query, mode: 'insensitive' } },
                ]
            },
            take: 10
        }),
    ]);

    type SearchResult = {
        id: string;
        title: string;
        detail: string;
        type: 'sermon' | 'podcast' | 'article';
        url: string;
        displayDate: Date;
    };

    const results: SearchResult[] = [
        ...sermons.filter(item => canSeeAudience(item.audienceTeamIds, teamIds, isAdmin)).map(s => ({ id: s.id, title: s.title, detail: s.speaker || 'Sermon', type: 'sermon' as const, url: `/sermons/${s.id}`, displayDate: s.date })),
        ...podcasts.filter(item => canSeeAudience(item.audienceTeamIds, teamIds, isAdmin)).map(p => ({ id: p.id, title: p.title, detail: 'Podcast', type: 'podcast' as const, url: `/podcasts/${p.id}`, displayDate: p.publishedAt })),
        ...articles.filter(item => canSeeAudience(item.audienceTeamIds, teamIds, isAdmin)).map(article => ({ id: article.id, title: article.title, detail: article.author, type: 'article' as const, url: `/articles/${article.id}`, displayDate: article.publishedAt })),
    ].sort((a, b) => {
        return b.displayDate.getTime() - a.displayDate.getTime();
    });

    return (
        <main className="search-page">
            <header className="search-page-hero"><p className="page-kicker">Search results</p><h1>Results for “{query}”</h1><p>Showing sermons, podcasts, and articles available to you.</p></header>
            <section className="search-page-content">
                <GlobalSearch initialQuery={query} />
                <p className="search-result-count" aria-live="polite">{results.length} {results.length === 1 ? 'result' : 'results'} found</p>

            {results.length === 0 ? (
                <div className="search-empty"><strong>No matches yet</strong><p>Try a speaker, topic, sermon title, podcast, or article author.</p></div>
            ) : (
                <div className="search-results-list">
                    {results.map((item) => (
                        <Link key={`${item.type}-${item.id}`} href={item.url} className="search-result-card">
                            <span className={`search-result-icon ${item.type}`} aria-hidden="true">{item.type === 'sermon' ? '▶' : item.type === 'podcast' ? '◉' : '✦'}</span>
                            <span className="search-result-copy"><span className="search-result-meta"><span className="search-result-type">{item.type}</span><span>{formatDate(item.displayDate)}</span></span><strong>{item.title}</strong><small>{item.detail}</small></span>
                            <span className="search-result-arrow" aria-hidden="true">›</span>
                        </Link>
                    ))}
                </div>
            )}
            </section>
        </main>
    );
}
