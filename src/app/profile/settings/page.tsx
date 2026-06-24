'use client';

import { useTheme } from '@/context/theme-context';
import Link from 'next/link';

export default function SettingsPage() {
    const { theme } = useTheme();

    return (
        <div className="profile-page settings-page">
            <header className="page-header settings-header">
                <Link href="/profile" className="page-back-btn" aria-label="Back to Profile">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                </Link>
                <h1 className="page-title">Settings</h1>
            </header>

            <div className="settings-content">
                <section className="settings-section">
                    <h2 className="settings-section-title">Appearance</h2>

                    <div className="settings-card">
                        <div className="settings-row">
                            <div className="settings-label-group">
                                <div className="settings-badge">ON</div>
                                <div className="settings-text">
                                    <div className="settings-label">Dark Mode</div>
                                    <div className="settings-description">Always on for the FHM app</div>
                                </div>
                            </div>

                            <div
                                aria-label={`Dark mode is ${theme}`}
                                className="settings-toggle"
                            >
                                <div className="settings-toggle-thumb" />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="settings-note">
                    <p>
                        <strong>Dark Mode</strong> is locked on so the app has one consistent visual style across devices.
                    </p>
                </div>
            </div>
        </div>
    );
}
