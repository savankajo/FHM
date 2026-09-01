import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canSeeAudience } from '@/lib/audience';
import InAppLink from '@/components/ui/in-app-link';

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    const isAdmin = session?.role === 'ADMIN';
    const teams = session ? await prisma.team.findMany({ where: { members: { some: { id: session.userId } } }, select: { id: true } }) : [];
    const teamIds = teams.map(team => team.id);
    const article = await prisma.article.findUnique({ where: { id } });

    if (!article || !canSeeAudience(article.audienceTeamIds, teamIds, isAdmin)) notFound();
    const isPdf = Boolean(article.linkUrl && /\.pdf(?:$|[?#])/i.test(article.linkUrl));

    return (
        <div className="content-shell article-detail-page">
            <header className="page-header">
                <Link href="/sermons-and-podcasts?tab=articles" className="page-back-btn" aria-label="Back to Articles">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div>
                    <h1 className="page-title">Article</h1>
                    <p className="page-kicker">Father’s Heart Journal</p>
                </div>
            </header>
            <article className="settings-card article-detail-card">
                {article.imageUrl ? (
                    <div className="article-detail-image">
                        <Image src={article.imageUrl} alt={`${article.title} featured image`} fill sizes="(max-width: 760px) 100vw, 760px" />
                    </div>
                ) : (
                    <div className="article-detail-image article-detail-fallback" role="img" aria-label="Father’s Heart Journal">
                        <span>FHM</span><small>Journal</small>
                    </div>
                )}
                <div className="article-detail-meta">
                    <span>Article</span>
                    <time dateTime={article.publishedAt.toISOString()}>{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time>
                    <span>By {article.author}</span>
                </div>
                <h1 className="article-detail-title">{article.title}</h1>
                {article.summary && <p className="article-detail-summary">{article.summary}</p>}
                {article.body && <div className="article-detail-body">{article.body}</div>}
                {article.linkUrl && isPdf && (
                    <section className="article-document" aria-label={`${article.title} document`}>
                        <iframe src={article.linkUrl} title={article.title} />
                        <InAppLink href={article.linkUrl} className="btn btn-secondary btn-full" ariaLabel={`Open full-screen ${article.title}`}>
                            Open Full Screen
                        </InAppLink>
                    </section>
                )}
                {article.linkUrl && !isPdf && (
                    <InAppLink href={article.linkUrl} className="btn btn-primary btn-full" ariaLabel={`Read ${article.title} inside the app`}>
                        Read Article
                    </InAppLink>
                )}
            </article>
        </div>
    );
}
