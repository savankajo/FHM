'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { CURRENT_TERMS_EFFECTIVE_DATE, CURRENT_TERMS_VERSION } from '@/lib/terms';
import { SUPPORT_EMAIL } from '@/lib/support';

function AgreementSummary() {
  return (
    <div className="terms-gate-copy">
      <p className="terms-gate-version">Terms version {CURRENT_TERMS_VERSION} · Effective {CURRENT_TERMS_EFFECTIVE_DATE}</p>
      <h2>Terms of Use &amp; Community Safety Agreement</h2>
      <p>FHM has zero tolerance for objectionable content or abusive behavior.</p>
      <p>You must not post abusive, threatening, harassing, hateful, sexually explicit, violent, discriminatory, defamatory, illegal, or otherwise harmful content, or content you do not have permission to share.</p>
      <p>You can report content and block abusive users. FHM may remove violating content and warn, suspend, or permanently remove accounts. Valid safety reports are reviewed and acted on within 24 hours.</p>
      <nav aria-label="Agreement documents">
        <Link href="/terms" target="_blank">Full Terms of Use</Link>
        <Link href="/community-guidelines" target="_blank">Community Guidelines</Link>
        <Link href="/privacy" target="_blank">Privacy Policy</Link>
        <a href={`mailto:${SUPPORT_EMAIL}`}>Safety contact</a>
      </nav>
    </div>
  );
}
export function PreAuthTermsGate({ actionLabel, onAccepted }: { actionLabel: string; onAccepted: () => void }) {
  const [checked, setChecked] = useState(false);
  const [declined, setDeclined] = useState(false);

  if (declined) {
    return (
      <div className="auth-container">
        <section className="auth-card terms-gate" role="status">
          <h1 className="auth-title">Agreement declined</h1>
          <p className="auth-subtitle">You cannot {actionLabel.toLowerCase()} or use community features unless you accept the Terms of Use.</p>
          <button className="btn btn-primary btn-full" type="button" onClick={() => { setDeclined(false); setChecked(false); }}>Review the agreement again</button>
          <Link className="terms-gate-home" href="/">Return home</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <section className="auth-card terms-gate" aria-labelledby="terms-gate-heading">
        <p className="page-kicker">Required before {actionLabel.toLowerCase()}</p>
        <h1 className="auth-title" id="terms-gate-heading">Review and accept</h1>
        <AgreementSummary />
        <label className="terms-check-row">
          <input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} />
          <span>I have read and agree to the Terms of Use and Community Guidelines.</span>
        </label>
        <div className="terms-gate-actions">
          <button type="button" className="btn btn-primary" disabled={!checked} onClick={() => {
            sessionStorage.setItem('fhm-preauth-terms', JSON.stringify({ version: CURRENT_TERMS_VERSION, acceptedAt: new Date().toISOString() }));
            onAccepted();
          }}>Agree and Continue</button>
          <button type="button" className="btn" onClick={() => { sessionStorage.removeItem('fhm-preauth-terms'); setDeclined(true); }}>Decline</button>
        </div>
      </section>
    </div>
  );
}

export function TermsEnforcement() {
  const { user, loading, logout, refreshUser } = useAuth();
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (loading || !user || user.termsAccepted) return null;

  async function accept() {
    setBusy(true); setError('');
    const response = await fetch('/api/terms/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accepted: true, version: CURRENT_TERMS_VERSION }) });
    if (response.ok) await refreshUser();
    else setError((await response.json()).error || 'Could not record acceptance.');
    setBusy(false);
  }

  return (
    <div className="terms-enforcement-backdrop" role="dialog" aria-modal="true" aria-labelledby="renewed-terms-heading">
      <section className="auth-card terms-gate">
        <p className="page-kicker">Updated agreement required</p>
        <h1 className="auth-title" id="renewed-terms-heading">Please review the current terms</h1>
        <AgreementSummary />
        {error && <p className="error-alert" role="alert">{error}</p>}
        <label className="terms-check-row">
          <input type="checkbox" checked={checked} onChange={event => setChecked(event.target.checked)} />
          <span>I have read and agree to the current Terms of Use and Community Guidelines.</span>
        </label>
        <div className="terms-gate-actions">
          <button type="button" className="btn btn-primary" disabled={!checked || busy} onClick={accept}>{busy ? 'Recording acceptance…' : 'Agree and Continue'}</button>
          <button type="button" className="btn" disabled={busy} onClick={logout}>Decline and Sign Out</button>
        </div>
      </section>
    </div>
  );
}
