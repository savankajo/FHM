import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import JoinButton from './join-button';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
    const session = await getSession();

    if (!session) {
        return (
            <div className="max-w-[980px] mx-auto px-7 py-16 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Teams</h1>
                <p className="text-gray-500 mb-6">Please sign in to view teams.</p>
                <Link href="/login"><Button>Sign In</Button></Link>
            </div>
        );
    }

    const myTeams = await prisma.team.findMany({
        where: {
            members: { some: { id: session.userId } }
        },
        include: { _count: { select: { members: true } } }
    });

    const otherTeams = await prisma.team.findMany({
        where: {
            NOT: { members: { some: { id: session.userId } } }
        },
        include: { _count: { select: { members: true } } }
    });

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[980px] mx-auto px-7 py-8">

                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Teams</h1>

                {/* My Teams Section */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">My Teams</h2>

                    {myTeams.length === 0 ? (
                        <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center">
                            <p className="text-gray-400 text-sm">You are not in any teams yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myTeams.map(team => (
                                <Link key={team.id} href={`/teams/${team.id}`} className="block no-underline">
                                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-gray-300 transition-all bg-white">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 bg-orange-100 text-orange-800 px-3 py-1 rounded-md inline-block">
                                                    {team.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-2">{team._count.members} Members</p>
                                            </div>
                                            <span className="text-2xl">💬</span>
                                        </div>
                                        <div className="mt-4 flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-2.5 rounded-lg">
                                            <span>Open team chat →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {otherTeams.length > 0 && (
                    <>
                        <hr className="border-0 border-t border-gray-200 my-8" />

                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Teams</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {otherTeams.map(team => (
                                    <div key={team.id} className="border border-gray-200 rounded-xl p-6 bg-white">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{team.name}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{team._count.members} Members</p>
                                            </div>
                                            <JoinButton teamId={team.id} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

            </div>
        </div>
    );
}
