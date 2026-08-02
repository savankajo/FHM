import Link from 'next/link';
import ArticleForm from '../article-form';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export default async function NewArticlePage() {
    const session = await getSession();
    if (!await canManage(session?.userId, session?.role, 'media', 'add')) redirect('/admin');

    return (
        <div className="max-w-[680px] mx-auto px-7 py-8">
            <div className="admin-list-title-row" style={{ marginBottom: 24 }}>
                <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                </Link>
                <div>
                    <h1 className="page-title">Add Article</h1>
                    <p className="page-kicker">Create a written update or devotional</p>
                </div>
            </div>
            <ArticleForm />
        </div>
    );
}
