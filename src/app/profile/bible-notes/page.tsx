import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import BibleNotesList from './bible-notes-list';

export const dynamic = 'force-dynamic';

export default async function BibleNotesPage() {
    if (!await getSession()) redirect('/login?next=/profile/bible-notes');
    return <main className="profile-page settings-page">
        <header className="page-header settings-header">
            <Link href="/profile" className="page-back-btn" aria-label="Back to Profile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg></Link>
            <div><p className="page-kicker">Private to your account</p><h1 className="page-title">Bible Notes</h1></div>
        </header>
        <div className="settings-content"><BibleNotesList /></div>
    </main>;
}
