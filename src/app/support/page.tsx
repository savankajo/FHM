import Link from 'next/link';
import { SUPPORT_EMAIL } from '@/lib/support';

export default function SupportPage() {
  return <main className="legal-page"><h1>FHM Church Support</h1><p>For account help, content or safety concerns, accessibility support, privacy requests, or questions about FHM Church, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p><p>Include enough information to identify the issue, but do not email passwords or other sensitive credentials. For objectionable in-app content, use the message safety menu when possible so the exact content is securely attached to the report.</p><p>Authorized FHM moderators review valid objectionable-content reports and commit to acting within 24 hours. For immediate danger, contact local emergency services.</p><p><Link href="/terms">Terms of Use</Link> · <Link href="/community-guidelines">Community Guidelines</Link> · <Link href="/privacy">Privacy Policy</Link> · <Link href="/">Return home</Link></p></main>;
}
