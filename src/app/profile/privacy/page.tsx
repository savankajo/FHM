import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PrivacyForm, { NameForm } from './privacy-form';
import AccountControls from '../settings/account-controls';

export const dynamic = 'force-dynamic';

export default async function PrivacyPage() {
    const session = await getSession();
    if (!session) redirect('/login');
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true } });
    if (!user) redirect('/login');

    return (
        <div className="profile-page settings-page">
            <header className="page-header settings-header">
                <Link href="/profile" className="page-back-btn" aria-label="Back to Profile">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                </Link>
                <h1 className="page-title">Privacy</h1>
            </header>
            <div className="settings-content">
                <section className="settings-section">
                    <h2 className="settings-section-title">Your name</h2>
                    <div className="settings-card"><NameForm name={user.name || ''} /></div>
                </section>
                <section className="settings-section">
                    <h2 className="settings-section-title">Account email</h2>
                    <div className="settings-card"><p className="settings-description">Your email is used to sign in and recover your account.</p><div className="input">{user.email}</div></div>
                </section>
                <section className="settings-section">
                    <h2 className="settings-section-title">Change password</h2>
                    <div className="settings-card"><PrivacyForm /></div>
                </section>
                <section className="settings-section">
                    <h2 className="settings-section-title">Delete account</h2>
                    <p className="settings-description">This permanently removes your profile and associated activity.</p>
                    <AccountControls />
                </section>
                <p className="settings-description"><Link href="/privacy">Read the full Privacy Policy</Link></p>
            </div>
        </div>
    );
}
