import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/layout/app-header';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  // user fetching removed as it is handled in AppHeader
  const isAdmin = session?.role === 'ADMIN';

  return (
    <div className="home-page min-h-screen flex flex-col">
      <AppHeader />

      {/* Admin Controls Placeholder */}
      {
        isAdmin && (
          <div className="admin-panel-link">
            <Link href="/admin">
              <Button variant="ghost" className="w-full border-dashed border-2">
                🔧 Admin Dashboard
              </Button>
            </Link>
          </div>
        )
      }

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
  )
}


