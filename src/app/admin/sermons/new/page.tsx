'use client';

import Link from 'next/link';
import SermonForm from '../sermon-form';

export default function NewSermonPage() {
    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Add Sermon</h1>
                        <p className="page-kicker">Upload a sermon or meeting recording</p>
                    </div>
                </div>
            </div>
            <SermonForm />
        </div>
    );
}
