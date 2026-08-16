'use client';

import { useState } from 'react';

export default function RsvpButton({ eventId, initialStatus }: { eventId: string; initialStatus?: string | null }) {
  const [status, setStatus] = useState(initialStatus || '');
  const [busy, setBusy] = useState(false);
  async function update(next: 'REGISTERED' | 'CANCELLED') {
    setBusy(true);
    const response = await fetch('/api/events/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId, status: next }) });
    if (response.ok) setStatus(next);
    else alert((await response.json()).error || 'Could not update registration.');
    setBusy(false);
  }
  return status === 'REGISTERED'
    ? <div className="rsvp-confirmed"><strong>✓ You’re registered</strong><button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => update('CANCELLED')}>Cancel registration</button></div>
    : <button className="btn btn-primary btn-full" disabled={busy} onClick={() => update('REGISTERED')}>{busy ? 'Saving…' : 'Register for this team event'}</button>;
}
