import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Providers } from '@/components/providers'
import { BottomNav } from '@/components/layout/bottom-nav'
import '@/styles/globals.css'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'FHM Church',
    description: 'Father Heart Church App',
    manifest: '/manifest.json',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={outfit.className}>
                <Providers>
                    <main className="container">
                        {children}
                    </main>
                    <BottomNav />
                </Providers>
            </body>
        </html>
    )
}
