'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to FHM Church</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-alert">{error}</div>}

                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />

                    <Button type="submit" disabled={loading} fullWidth>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link href="/register">Sign up</Link>
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
