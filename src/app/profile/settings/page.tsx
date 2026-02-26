'use client';

import { useTheme } from '@/context/theme-context';
import Link from 'next/link';

export default function SettingsPage() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="profile-page min-h-screen pb-20">
            {/* Header */}
            <header className="page-header sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-10 border-b border-gray-100 dark:border-gray-800">
                <Link href="/profile" className="page-back-btn dark:bg-gray-900 dark:text-white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                </Link>
                <h1 className="page-title dark:text-white">Settings</h1>
            </header>

            <div className="px-5 py-8 space-y-8">
                {/* Visual Preference Section */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Appearance</h2>

                    <div className="bg-white dark:bg-gray-900 rounded-[28px] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${theme === 'dark' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                    {theme === 'dark' ? '☀️' : '🌙'}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white">Dark Mode</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</div>
                                </div>
                            </div>

                            <button
                                onClick={toggleTheme}
                                className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${theme === 'dark' ? 'bg-primary' : 'bg-gray-200'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-amber-50 dark:bg-gray-900/50 rounded-[24px] p-6 border border-amber-100 dark:border-gray-800">
                    <p className="text-sm text-amber-800 dark:text-gray-400 leading-relaxed">
                        <strong>Dark Mode</strong> is a experimental feature. We're working on making every page look perfect in dark mode.
                    </p>
                </div>
            </div>
        </div>
    );
}
