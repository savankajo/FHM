import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canSeeAudience } from '@/lib/audience';
import InAppLink from '@/components/ui/in-app-link';

export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    const isAdmin = session?.role === 'ADMIN';
    const teams = session ? await prisma.team.findMany({ where: { members: { some: { id: session.userId } } }, select: { id: true } }) : [];
    const teamIds = teams.map(team => team.id);
    const article = await prisma.article.findUnique({ where: { id: params.id } });

    if (!article || !canSeeAudience(article.audienceTeamIds, teamIds, isAdmin)) notFound();
    const isPdf = Boolean(article.linkUrl && /\.pdf(?:$|[?#])/i.test(article.linkUrl));

    return (
        <div className="page-container">
            <Link href="/sermons-and-podcasts" className="page-back-btn" aria-label="Back to Media">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </Link>
            <article className="settings-card" style={{ marginTop: 20, padding: 24 }}>
                {article.imageUrl && (
                    <div style={{ borderRadius: 18, overflow: 'hidden', aspectRatio: '16/9', marginBottom: 20, background: '#181818' }}>
                        <img src={article.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
                <p className="page-kicker">{new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {article.author}</p>
                <h1 className="page-title" style={{ marginBottom: 16 }}>{article.title}</h1>
                {article.summary && <p style={{ color: '#9ca3af', fontSize: 18, lineHeight: 1.5, marginBottom: 20 }}>{article.summary}</p>}
                {article.body && <div style={{ whiteSpace: 'pre-wrap', color: '#f5f5f5', lineHeight: 1.7 }}>{article.body}</div>}
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
