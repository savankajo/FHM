import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';
import ArticleForm from '../../article-form';
import DeleteArticleButton from '../../delete-button';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'media', 'edit')) redirect('/admin');

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) notFound();

    return (
        <div className="max-w-[680px] mx-auto px-7 py-8">
            <div className="admin-list-title-row" style={{ marginBottom: 24, justifyContent: 'space-between' }}>
                <div className="admin-list-title-row">
                    <Link href="/admin/media-edit" className="page-back-btn" aria-label="Back to Media Edit">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div>
                        <h1 className="page-title">Edit Article</h1>
                        <p className="page-kicker">Update written media content</p>
                    </div>
                </div>
                <DeleteArticleButton id={article.id} redirectTo="/admin/media-edit" />
            </div>
            <ArticleForm initialData={article} />
        </div>
    );
}
