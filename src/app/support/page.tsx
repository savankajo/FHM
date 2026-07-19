import Link from 'next/link';

export default function SupportPage() {
    return (
        <article className="legal-page">
            <Link href="/" className="page-back-btn legal-back-btn" aria-label="Back to Home">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </Link>
            <h1>Support</h1>
            <p>For account help, content concerns, accessibility support, or questions about FHM Church, email <a href="mailto:Media@fathersheartministry.ca">Media@fathersheartministry.ca</a>.</p>
            <p>Include a description of the issue and the page where it occurred. Do not email passwords or sensitive information.</p>
            <p><Link href="/privacy">Privacy Policy</Link> | <Link href="/terms">Community Standards</Link> | <Link href="/">Return home</Link></p>
        </article>
    );
}
