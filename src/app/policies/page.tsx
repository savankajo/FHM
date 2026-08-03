import Link from 'next/link';

export default function PoliciesPage() {
    return (
        <article className="legal-page">
            <Link href="/profile" className="page-back-btn legal-back-btn" aria-label="Back to Profile">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </Link>
            <h1>Policies &amp; Support</h1>
            <p>Our guidelines and support resources for the FHM Church community.</p>

            <h2>Privacy Policy</h2>
            <p>FHM Church collects the name, email address, optional phone number, team memberships, event responses, volunteer activity, and messages you provide to operate the app.</p>
            <p>We use this information to authenticate members, provide church communications and team features, maintain safety, and support the service. We do not sell personal information or use it for cross-app tracking.</p>
            <p>Team chat messages expire after 48 hours. You can permanently delete your account and associated data in Profile &gt; Settings. Privacy questions: <a href="mailto:privacy@fhmchurch.ca">privacy@fhmchurch.ca</a>.</p>

            <h2>Terms &amp; Community Standards</h2>
            <p>Use FHM Church respectfully and only for lawful church and team activities. Do not post harassment, threats, hate, sexual content, private information, spam, or material you do not have permission to share.</p>
            <p>Messages may be reported to church administrators. Members can block another member, and content or accounts may be removed when these standards are violated. If you believe content presents an immediate danger, contact local emergency services.</p>

            <h2>Contact Support</h2>
            <p>For account help, content concerns, accessibility support, or questions about FHM Church, email <a href="mailto:Media@fathersheartministry.ca">Media@fathersheartministry.ca</a>.</p>
            <p>Include a description of the issue and the page where it occurred. Do not email passwords or sensitive information.</p>
            <p><Link href="/">Return home</Link></p>
        </article>
    );
}
