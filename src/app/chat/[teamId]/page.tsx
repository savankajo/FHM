import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ChatPage({ params }: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await params;
    redirect(`/messages/team/${teamId}`);
}
