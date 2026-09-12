'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        <path d="M3 12L12 3l9 9" />
        <path d="M9 21V12h6v9" />
        <path d="M3 12v9h18V12" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.15 : 0} />
        {active
          ? <path d="M3 12L12 3l9 9v9H3V12z" fill="currentColor" opacity={0.12} />
          : null}
      </svg>
    ),
  },
  {
    label: 'Media',
    href: '/sermons-and-podcasts',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        {active ? (
          <>
            <rect x="3" y="5" width="18" height="14" rx="3" fill="currentColor" opacity={0.15} />
            <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth={1.8} />
            <polygon points="10,9 16,12 10,15" fill="currentColor" />
          </>
        ) : (
          <>
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <polygon points="10,9 16,12 10,15" fill="currentColor" />
          </>
        )}
      </svg>
    ),
  },
  {
    label: 'Bible',
    href: '/bible',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11a3 3 0 0 1 3 3v16a3 3 0 0 0-3-3H7.5A3.5 3.5 0 0 0 4 21.5z" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.14 : 1} />
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H14v19a3 3 0 0 1 3-3h-.5a3.5 3.5 0 0 1 3.5 3.5z" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.14 : 1} />
        <path d="M14 5v16" />
        <path d="M7 7h4M7 10h4M17 7h1" />
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        <path d="M5 5.5h14A2.5 2.5 0 0 1 21.5 8v8A2.5 2.5 0 0 1 19 18.5H10l-4.8 3.2.8-3.2A2.5 2.5 0 0 1 3.5 16V8A2.5 2.5 0 0 1 5 5.5Z" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.2 : 1} />
        <path d="M8 11h8M8 14h5" />
      </svg>
    ),
  },
  {
    label: 'Calendar',
    href: '/events',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        <rect x="3" y="4" width="18" height="18" rx="3" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.12 : 0} />
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <circle cx="8" cy="15" r="1" fill="currentColor" />
        <circle cx="12" cy="15" r="1" fill="currentColor" />
        <circle cx="16" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
        <circle cx="12" cy="8" r="4" fill={active ? 'currentColor' : 'none'} opacity={active ? 0.2 : 0} />
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={item.href === '/profile' ? false : undefined}
            className={`nav-item${isActive ? ' active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="nav-icon-wrap">
              {item.icon(isActive)}
            </span>
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
