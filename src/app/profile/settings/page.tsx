'use client';

import { useTheme } from '@/context/theme-context';
import Link from 'next/link';
import AccountControls from './account-controls';

const THEME_OPTIONS = [
    { id: 'dark', label: 'Dark', description: 'Black background with warm accents' },
    { id: 'light', label: 'Light', description: 'White background for daytime reading' },
    { id: 'warm', label: 'Warm', description: 'Soft cream and amber tones' },
    { id: 'blue', label: 'Blue', description: 'Deep blue with bright accents' },
] as const;

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

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
                        <div className="theme-choice-grid">
                            {THEME_OPTIONS.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className={`theme-choice${theme === option.id ? ' active' : ''}`}
                                    onClick={() => setTheme(option.id)}
                                    aria-pressed={theme === option.id}
                                >
                                    <span className={`theme-choice-swatch ${option.id}`} />
                                    <span>
                                        <strong>{option.label}</strong>
                                        <small>{option.description}</small>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="settings-section">
                    <h2 className="settings-section-title">Privacy & Support</h2>
                    <div className="settings-card" style={{ padding: 16, display: 'grid', gap: 12 }}>
                        <Link href="/privacy">Privacy Policy</Link>
                        <Link href="/terms">Terms & Community Standards</Link>
                        <Link href="/support">Contact Support</Link>
                    </div>
                </section>
                <section className="settings-section">
                    <h2 className="settings-section-title">Account</h2>
                    <p className="settings-description">Deleting your account permanently removes your profile and associated activity.</p>
                    <AccountControls />
                </section>
            </div>
        </div>
    );
}
