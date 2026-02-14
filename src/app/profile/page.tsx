import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileForm from './profile-form';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true, phone: true }
    });

    if (!user) redirect('/login');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h1>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <ProfileForm user={user} />
                </div>
                <div className="bg-blue-50 p-6 rounded-lg text-blue-800 h-fit">
                    <h3 className="font-bold mb-2">Account Info</h3>
                    <p className="text-sm">Role: <span className="font-semibold">{session.role}</span></p>
                    <p className="text-sm mt-2 mb-4">To change your role or permissions, please contact an administrator.</p>

                    <form action={async () => {
                        'use server';
                        const { logout } = await import('@/app/actions/auth');
                        await logout();
                    }}>
                        <button className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
