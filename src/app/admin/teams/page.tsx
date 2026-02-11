import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminTeamsPage() {
    const teams = await prisma.team.findMany({
        include: { _count: { select: { members: true } } }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Manage Teams</h1>
                <Link href="/admin/teams/new"><Button>+ New Team</Button></Link>
            </div>

            <div className="flex flex-col gap-4">
                {teams.map(team => (
                    <Link key={team.id} href={`/admin/teams/${team.id}`}>
                        <div className="card flex justify-between items-center bg-white p-4 rounded shadow cursor-pointer hover:border-black">
                            <div>
                                <h3 className="font-bold">{team.name}</h3>
                                <p className="text-sm text-gray-500">{team._count.members} Members</p>
                            </div>
                            <div className="text-xl">➡️</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
