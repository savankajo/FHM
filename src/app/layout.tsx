import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import { Providers } from '@/components/providers'
import { BottomNav } from '@/components/layout/bottom-nav'
import '@/styles/globals.css'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'FHM Church',
    description: 'Father Heart Church App',
    manifest: '/manifest.json',
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
        { media: '(prefers-color-scheme: dark)', color: '#0A0A0A' },
    ],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
            <body className={outfit.className}>
                <Providers>
                    <main className="app-shell">
                        {children}
                    </main>
                    <BottomNav />
                </Providers>
            </body>
        </html>
    )
}
