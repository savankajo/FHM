'use client';
import { useEffect, useState } from 'react';
import { requestPushPermission } from '@/lib/push-client';

const labels = { reminders: 'Event reminders', invitations: 'Event invitations', messages: 'Team messages', live: 'Live services', media: 'New media' };
export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState({ reminders: true, invitations: true, messages: true, live: true, media: true });
  const [saved, setSaved] = useState('');
  useEffect(() => { fetch('/api/notifications/preferences').then(r => r.ok ? r.json() : null).then(data => data?.preferences && setPrefs(data.preferences)); }, []);
  async function toggle(key: keyof typeof prefs) { const next = { ...prefs, [key]: !prefs[key] }; setPrefs(next); setSaved('Saving…'); const response = await fetch('/api/notifications/preferences', { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(next) }); setSaved(response.ok ? 'Saved' : 'Could not save'); }
  async function enablePush() { setSaved('Opening notification permission…'); try { const result = await requestPushPermission(); setSaved(result.message); } catch { setSaved('Could not enable device notifications. Please try again.'); } }
  return <section id="notifications" className="settings-section"><h2 className="settings-section-title">Notifications</h2><div className="settings-card"><p className="settings-help">Choose what you receive. Push permission is requested here, in context—not at launch.</p>{(Object.keys(labels) as Array<keyof typeof prefs>).map(key => <label className="preference-row" key={key}><span>{labels[key]}</span><input type="checkbox" checked={prefs[key]} onChange={() => toggle(key)} aria-label={labels[key]}/></label>)}<button className="btn btn-secondary btn-full" onClick={enablePush}>Enable device notifications</button>{saved && <p className="settings-save-status" role="status">{saved}</p>}</div></section>;
}
