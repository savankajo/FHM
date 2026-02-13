import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function AppHeader() {
    const session = await getSession();
    let user = null;

    if (session) {
        user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { name: true }
        });
    }

    return (
        <header className="home-header flex items-center justify-between py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2 no-underline">
                <Image
                    src="/logo.png"
                    alt="FHM Church Logo"
                    width={50}
                    height={50}
                    className="object-contain" // keeps aspect ratio
                />
                <h1 className="text-xl font-bold text-primary m-0 hidden sm:block">FHM Church</h1>
            </Link>

            {session ? (
                <div className="flex items-center gap-3">
                    <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                        Hi, {user?.name?.split(' ')[0] || 'Member'}
                    </Link>
                    <form action={async () => {
                        'use server';
                        const { logout } = await import('@/app/actions/auth');
                        await logout();
                    }}>
                        <Button variant="outline" size="sm" className="h-8 text-xs px-3">Sign Out</Button>
                    </form>
                </div>
            ) : (
                <div className="guest-actions flex gap-2">
                    <Link href="/login">
                        <Button variant="outline" size="sm">Sign In</Button>
                    </Link>
                </div>
            )}
        </header>
    );
}
