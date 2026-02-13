import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  let user = null;
  if (session) {
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true }
    });
  }

  const isAdmin = session?.role === 'ADMIN';

  return (
    <div className="home-page min-h-screen flex flex-col">
      <header className="home-header">
        <h1>FHM Church</h1>

        {session ? (
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-sm hover:underline">Welcome, {user?.name || 'Member'}</Link>
            <form action={async () => {
              'use server';
              const { logout } = await import('@/app/actions/auth');
              await logout();
            }}>
              <Button variant="outline" className="h-8 text-xs">Sign Out</Button>
            </form>
          </div>
        ) : (
          <p>Welcome, Guest</p>
        )}

        {!session && (
          <div className="guest-actions">
            <Link href="/login"><Button variant="outline">Sign In</Button></Link>
          </div>
        )}
      </header>

      {/* Admin Controls Placeholder */}
      {isAdmin && (
        <div className="admin-panel-link">
          <Link href="/admin">
            <Button variant="ghost" className="w-full border-dashed border-2">
              🔧 Admin Dashboard
            </Button>
          </Link>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">New Home Page Coming Soon</h2>
        <p className="text-gray-600 max-w-md">
          We are redesigning our experience. In the meantime, you can access our Sermons and Podcasts below.
        </p>

        <Link href="/sermons-and-podcasts">
          <Button className="bg-primary text-white px-8 py-6 text-lg rounded-full shadow-lg hover:bg-primary/90 transition-all">
            View Sermons & Podcasts →
          </Button>
        </Link>
      </main>

    </div>
  );
}
