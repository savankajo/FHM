'use client';
import { useState } from 'react';

export default function AccountControls() {
  const [busy, setBusy] = useState(false);
  async function removeAccount() {
    if (!confirm('Permanently delete your account, profile, votes, messages, and team memberships? This cannot be undone.')) return;
    if (!confirm('This is your final confirmation. Delete account now?')) return;
    setBusy(true);
    const response = await fetch('/api/account', { method: 'DELETE' });
    if (response.ok) window.location.href = '/';
    else { alert('Account deletion failed. Please contact support.'); setBusy(false); }
  }
  return <button className="btn btn-destructive" disabled={busy} onClick={removeAccount}>{busy ? 'Deleting…' : 'Delete Account'}</button>;
}
