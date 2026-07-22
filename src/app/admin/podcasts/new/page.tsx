import Link from 'next/link';
import PodcastForm from '../podcast-form';

export default function NewPodcastPage() {
    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Add Podcast Episode</h1>
                        <p className="page-kicker">Add audio and cover image</p>
                    </div>
                </div>
            </div>
            <PodcastForm />
        </div>
    );
}
