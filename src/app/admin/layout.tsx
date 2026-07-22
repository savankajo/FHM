import { getSession } from '@/lib/auth';
import { hasAnyAdminAccess } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!await hasAnyAdminAccess(session?.userId, session?.role)) redirect('/');
  return children;
}
