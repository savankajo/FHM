'use client';

import { useTheme } from '@/context/theme-context';
import Link from 'next/link';

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
                <h1 className="page-title">Theme</h1>
            </header>

            <div className="settings-content">
                <section className="settings-section">
                    <h2 className="settings-section-title">Choose your theme</h2>

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

            </div>
        </div>
    );
}
