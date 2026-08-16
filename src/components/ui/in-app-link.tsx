'use client';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import type { MouseEvent, ReactNode } from 'react';

export default function InAppLink({ href, className, children, ariaLabel }: { href: string; className?: string; children: ReactNode; ariaLabel?: string }) {
  async function open(event: MouseEvent<HTMLAnchorElement>) {
    if (!Capacitor.isNativePlatform()) return;
    event.preventDefault();
    await Browser.open({ url: href, presentationStyle: 'popover', toolbarColor: '#141414' });
  }
  return <a href={href} className={className} onClick={open} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>{children}</a>;
}
