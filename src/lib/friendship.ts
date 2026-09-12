import { prisma } from '@/lib/prisma';

export function conversationParticipants(firstUserId: string, secondUserId: string) {
  return firstUserId < secondUserId
    ? { participantLowId: firstUserId, participantHighId: secondUserId }
    : { participantLowId: secondUserId, participantHighId: firstUserId };
}

export async function areAcceptedFriends(firstUserId: string, secondUserId: string) {
  if (!firstUserId || firstUserId === secondUserId) return false;
  return Boolean(await prisma.friendRequest.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { requesterId: firstUserId, recipientId: secondUserId },
        { requesterId: secondUserId, recipientId: firstUserId },
      ],
    },
    select: { id: true },
  }));
}

export async function usersHaveBlockedEachOther(firstUserId: string, secondUserId: string) {
  return Boolean(await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: firstUserId, blockedId: secondUserId },
        { blockerId: secondUserId, blockedId: firstUserId },
      ],
    },
    select: { id: true },
  }));
}

export async function canDirectMessage(firstUserId: string, secondUserId: string) {
  return await areAcceptedFriends(firstUserId, secondUserId) && !await usersHaveBlockedEachOther(firstUserId, secondUserId);
}
