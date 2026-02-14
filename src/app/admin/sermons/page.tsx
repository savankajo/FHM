import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DeleteSermonButton from './delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminSermonsPage() {
    const sermons = await prisma.sermon.findMany({ orderBy: { date: 'desc' } });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Manage Sermons</h1>
                <Link href="/admin/sermons/new"><Button>+ New Sermon</Button></Link>
            </div>

            <div className="flex flex-col gap-4">
                {sermons.map(sermon => (
                    <div key={sermon.id} className="card flex justify-between items-center bg-white p-4 rounded shadow">
                        <div>
                            <h3 className="font-bold">{sermon.title}</h3>
                            <p className="text-sm text-gray-500">{new Date(sermon.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/admin/sermons/edit/${sermon.id}`}>
                                <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <DeleteSermonButton id={sermon.id} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
