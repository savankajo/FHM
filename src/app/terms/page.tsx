import Link from 'next/link';

export default function TermsPage() {
    return (
        <article className="legal-page">
            <Link href="/" className="page-back-btn legal-back-btn" aria-label="Back to Home">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </Link>
            <h1>Terms & Community Standards</h1>
            <p>Use FHM Church respectfully and only for lawful church and team activities. Do not post harassment, threats, hate, sexual content, private information, spam, or material you do not have permission to share.</p>
            <p>Messages may be reported to church administrators. Members can block another member, and content or accounts may be removed when these standards are violated.</p>
            <p>If you believe content presents an immediate danger, contact local emergency services.</p>
            <p><Link href="/support">Contact support</Link> | <Link href="/">Return home</Link></p>
        </article>
    );
}
