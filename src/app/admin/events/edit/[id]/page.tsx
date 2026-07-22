import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import EditEventForm from './edit-event-form';
import { canManage } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function EditEventPage({ params }: { params: { id: string } }) {
    const session = await getSession();

    if (!await canManage(session?.userId, session?.role, 'events', 'edit')) {
        redirect('/');
    }

    const event = await prisma.event.findUnique({
        where: { id: params.id },
        include: { teams: { select: { id: true } } }
    });

    if (!event) {
        return <p>Event not found</p>;
    }

    return (
        <div className="admin-list-page">
            <div className="admin-list-topbar">
                <div className="admin-list-title-row">
                    <Link href="/admin/events" className="page-back-btn" aria-label="Back to Events">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </Link>
                    <div className="admin-list-title-copy">
                        <h1 className="page-title">Edit Event</h1>
                        <p className="page-kicker">Update registration and access</p>
                    </div>
                </div>
            </div>
            <EditEventForm event={event} />
        </div>
    );
}
