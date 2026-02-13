import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        redirect('/');
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            // Include team memberships to show if they belong to any
            teams: { select: { name: true } }
        }
    });

    return (
        <div className="p-4 max-w-4xl mx-auto pb-24">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link href="/admin" className="text-sm text-gray-500 hover:text-primary mb-2 block">← Back to Dashboard</Link>
                    <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
                    <p className="text-gray-500 text-sm">Total Users: {users.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-600 border-b">
                            <tr>
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Teams</th>
                                <th className="p-4 font-semibold">Joined</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50/50">
                                        <td className="p-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="p-4 text-gray-600">{user.email}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {user.teams.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.teams.map(t => (
                                                        <span key={t.name} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                            {t.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">None</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-500 whitespace-nowrap">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button size="sm" variant="ghost">Edit</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
