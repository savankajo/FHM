'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Block = { id: string; reason: string; createdAt: string; blocked: { id: string; name: string } };

export default function BlockedUsersPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    const response = await fetch('/api/safety/blocks');
    if (response.ok) setBlocks((await response.json()).blocks);
    else setMessage('Could not load blocked users.');
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function unblock(block: Block) {
    if (!confirm(`Unblock ${block.blocked.name}? Their future, published content may appear again.`)) return;
    const response = await fetch('/api/safety/blocks', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: block.blocked.id }) });
    if (response.ok) {
      setBlocks(current => current.filter(item => item.id !== block.id));
      setMessage(`${block.blocked.name} was unblocked.`);
    } else setMessage('Could not unblock that user.');
  }

  return <main className="profile-page settings-page"><header className="page-header settings-header"><Link href="/profile" className="page-back-btn" aria-label="Back to Profile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg></Link><div><p className="page-kicker">Community safety</p><h1 className="page-title">Blocked Users</h1></div></header><div className="settings-content"><section className="settings-section"><p className="settings-description">Blocked users’ messages stay hidden from your chats and realtime refreshes. Unblocking restores only future or still-available published content; it does not change moderation actions.</p>{message && <p role="status" className="settings-description">{message}</p>}{loading ? <p>Loading…</p> : blocks.length === 0 ? <div className="settings-card" style={{ padding: 18 }}><strong>No blocked users</strong><p className="settings-description">You can block someone from the safety menu on their team-chat message.</p></div> : <div className="grid gap-3">{blocks.map(block => <article className="settings-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center' }} key={block.id}><div><strong>{block.blocked.name}</strong><p className="settings-description" style={{ margin: '4px 0 0' }}>Blocked for {block.reason} · {new Date(block.createdAt).toLocaleDateString()}</p></div><button type="button" className="btn" onClick={() => unblock(block)}>Unblock</button></article>)}</div>}</section></div></main>;
}
