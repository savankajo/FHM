'use client';
import { useState } from 'react';
import { updatePassword, updatePrivacyName } from '@/app/actions/profile';

export function NameForm({ name }: { name: string }) {
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    async function submit(formData: FormData) {
        setBusy(true); setMessage('');
        const result = await updatePrivacyName(formData);
        setMessage(result.error || 'Name updated successfully.');
        setBusy(false);
    }
    return <form action={submit}>
        <div className="input-group"><label className="input-label" htmlFor="privacy-name">Full name</label><input id="privacy-name" className="input" name="name" defaultValue={name} required autoComplete="name" /></div>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save Name'}</button>
        {message && <p className="settings-description" role="status">{message}</p>}
    </form>;
}

export default function PrivacyForm() {
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    async function submit(formData: FormData) {
        setBusy(true); setMessage('');
        const result = await updatePassword(formData);
        setMessage(result.error || 'Password updated successfully.');
        setBusy(false);
    }
    return <form action={submit}>
        <div className="input-group"><label className="input-label" htmlFor="new-password">New password</label><input id="new-password" className="input" name="password" type="password" minLength={6} required autoComplete="new-password" /></div>
        <div className="input-group"><label className="input-label" htmlFor="confirm-new-password">Confirm new password</label><input id="confirm-new-password" className="input" name="confirmPassword" type="password" minLength={6} required autoComplete="new-password" /></div>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Updating...' : 'Change Password'}</button>
        {message && <p className="settings-description" role="status">{message}</p>}
    </form>;
}
