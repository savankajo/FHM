'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Could not reset password');
            }

            setPassword('');
            setConfirmPassword('');
            setMessage(data.message);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Choose New Password</h1>
                <p className="auth-subtitle">Enter a new password for your FHM Church account.</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-alert">{error}</div>}
                    {message && <div className="success-alert">{message}</div>}
                    {!token && <div className="error-alert">Reset link is missing or invalid.</div>}

                    <Input
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Enter new password"
                        disabled={!token || Boolean(message)}
                    />

                    <Input
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Confirm new password"
                        disabled={!token || Boolean(message)}
                    />

                    <Button type="submit" disabled={loading || !token || Boolean(message)} fullWidth>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>

                <p className="auth-footer">
                    <Link href="/login">Back to sign in</Link>
                </p>
            </div>

            <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--muted);
          padding: 1rem;
        }
        .auth-card {
          background: var(--background);
          padding: 2rem;
          border-radius: var(--radius);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        .auth-title {
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 0.5rem;
          color: var(--primary);
        }
        .auth-subtitle {
          text-align: center;
          color: var(--muted-foreground);
          margin-bottom: 2rem;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .error-alert {
          background-color: #fee2e2;
          color: #ef4444;
          padding: 0.75rem;
          border-radius: var(--radius);
          font-size: 0.875rem;
          text-align: center;
        }
        .success-alert {
          background-color: #dcfce7;
          color: #166534;
          padding: 0.75rem;
          border-radius: var(--radius);
          font-size: 0.875rem;
          text-align: center;
        }
        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: var(--muted-foreground);
        }
        .auth-footer a {
          color: var(--primary);
          font-weight: 500;
        }
        .auth-footer a:hover {
          text-decoration: underline;
        }
      `}</style>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-card">Loading...</div></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
