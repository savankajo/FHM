import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { canManage } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { DEFAULT_PASTORS, PASTOR_PROFILE_IDS } from '@/data/pastors';
import PastorEditor from './pastor-editor';

export const dynamic = 'force-dynamic';

export default async function AdminPastorsPage() {
  const session = await getSession();
  if (!await canManage(session?.userId, session?.role, 'media', 'edit')) redirect('/admin');

  const savedPastors = await prisma.pastorProfile.findMany({
    where: { id: { in: [...PASTOR_PROFILE_IDS] } },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, role: true, initials: true, imageUrl: true, sortOrder: true },
  });
  const pastors = PASTOR_PROFILE_IDS.map(id => savedPastors.find(pastor => pastor.id === id) || DEFAULT_PASTORS.find(pastor => pastor.id === id)!);

  return (
    <div className="admin-list-page">
      <div className="admin-list-topbar">
        <div className="admin-list-title-row">
          <Link href="/admin" className="page-back-btn" aria-label="Back to Admin">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>
          <div className="admin-list-title-copy">
            <h1 className="page-title">Pastor Profiles</h1>
            <p className="page-kicker">Update homepage names, roles and photos</p>
          </div>
        </div>
      </div>
      <PastorEditor pastors={pastors} />
    </div>
  );
}
