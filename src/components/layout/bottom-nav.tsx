'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Icons (Simulated with text/emoji for now to avoid icon lib dependency hell without npm, 
// but normally I'd use lucide-react)
const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: '🏠' },
  { label: 'Media', href: '/sermons-and-podcasts', icon: '🎧' },
  { label: 'Teams', href: '/teams', icon: '👥' },
  { label: 'Events', href: '/events', icon: '📅' },
  { label: 'Chat', href: '/chat', icon: '💬' },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide nav on login/register pages
  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn('nav-item', isActive && 'active')}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}

      {/* Styles for this component specifically */}
      <style jsx global>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: var(--background);
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-around;
          align-items: center;
          z-index: 50;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          color: var(--muted-foreground);
          font-size: 0.75rem;
        }
        .nav-item.active {
          color: var(--primary);
        }
        .nav-icon {
          font-size: 1.25rem;
          margin-bottom: 2px;
        }
      `}</style>
    </nav>
  );
}
