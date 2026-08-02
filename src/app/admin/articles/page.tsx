import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import DeleteArticleButton from './delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'media', 'edit')) redirect('/admin');

    const articles = await prisma.article.findMany({ orderBy: { publishedAt: 'desc' }, take: 300 });

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Manage Articles</h1>
                        <p className="page-kicker">Add or update article content</p>
                    </div>
                </div>
                <Link href="/admin/articles/new" className="admin-list-create">+ New Article</Link>
            </div>

            <div className="admin-list-stack">
                {articles.length === 0 ? (
                    <div className="admin-empty-state">
                        <h2>No articles yet</h2>
                        <p>Create one article so the public Articles section is ready for screenshots.</p>
                    </div>
                ) : (
                    articles.map(article => (
                        <div key={article.id} className="admin-list-card">
                            <div className="admin-list-card-main">
                                <h2>{article.title}</h2>
                                <p>{new Date(article.publishedAt).toLocaleDateString('en-US')} - {article.author}</p>
                            </div>
                            <div className="admin-list-actions">
                                <Link href={`/admin/articles/edit/${article.id}`} className="admin-list-action-link">Edit</Link>
                                <DeleteArticleButton id={article.id} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
