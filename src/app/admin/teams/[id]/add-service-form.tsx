'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddServiceForm({ teamId }: { teamId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        await fetch('/api/admin/services', {
            method: 'POST',
            body: JSON.stringify({ ...data, teamId }),
            headers: { 'Content-Type': 'application/json' }
        });

        setLoading(false);
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
        router.refresh();

        // Auto-dismiss success
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="atm-service-form">
            <div className="atm-form-group">
                <label className="atm-form-label" htmlFor="svc-title">Service Title</label>
                <input
                    id="svc-title"
                    name="title"
                    type="text"
                    className="atm-input"
                    required
                    placeholder="Sunday Morning Worship"
                />
            </div>

            <div className="atm-form-group">
                <label className="atm-form-label" htmlFor="svc-date">Date &amp; Time</label>
                <input
                    id="svc-date"
                    name="date"
                    type="datetime-local"
                    className="atm-input"
                    required
                />
            </div>

            <div className="atm-form-group">
                <label className="atm-form-label" htmlFor="svc-volunteers">Max Volunteers</label>
                <input
                    id="svc-volunteers"
                    name="maxVolunteers"
                    type="number"
                    className="atm-input"
                    placeholder="Optional"
                    min="1"
                />
            </div>

            <div className="atm-form-group">
                <label className="atm-form-label" htmlFor="svc-notes">Notes</label>
                <textarea
                    id="svc-notes"
                    name="description"
                    className="atm-input atm-textarea"
                    placeholder="Instructions or additional details..."
                    rows={3}
                />
            </div>

            {success && (
                <div className="atm-success-banner">
                    ✓ Service added successfully!
                </div>
            )}

            <div className="atm-form-footer">
                <button
                    type="submit"
                    className="atm-btn-primary"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="atm-spinner" />
                            Adding...
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Service
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
