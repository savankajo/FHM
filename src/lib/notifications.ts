import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { audienceIds } from '@/lib/audience';
import { parseChatPayload } from '@/lib/chat-message';
import { sendPushToDevices } from '@/lib/push';

export const NOTIFICATION_DEFAULTS = {
  reminders: true,
  invitations: true,
  messages: true,
  live: true,
  media: true,
} as const;

export type NotificationPreference = keyof typeof NOTIFICATION_DEFAULTS;

type Recipient = {
  id: string;
  notificationPreferences: Prisma.JsonValue | null;
  pushDevices: Array<{ token: string }>;
};

type NotificationInput = {
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  dedupePrefix: string;
  eventId?: string;
};

function preferenceEnabled(user: Recipient, preference: NotificationPreference) {
  const preferences = user.notificationPreferences;
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) return true;
  return preferences[preference] !== false;
}

async function deliverToUser(user: Recipient, input: NotificationInput) {
  const dedupeKey = `${input.dedupePrefix}:${user.id}`;
  let notification: { id: string };

  try {
    notification = await prisma.notification.create({
      data: {
        userId: user.id,
        eventId: input.eventId,
        type: input.type,
        title: input.title,
        body: input.body,
        href: input.href,
        dedupeKey,
      },
      select: { id: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return;
    throw error;
  }

  return { user, notification };
}

async function notifyRecipients(recipients: Recipient[], preference: NotificationPreference, input: NotificationInput) {
  const enabled = recipients.filter(user => preferenceEnabled(user, preference));
  const batchSize = 25;
  const created: Array<{ user: Recipient; notification: { id: string } }> = [];
  for (let index = 0; index < enabled.length; index += batchSize) {
    const batch = await Promise.all(enabled.slice(index, index + batchSize).map(user => deliverToUser(user, input)));
    created.push(...batch.filter((item): item is { user: Recipient; notification: { id: string } } => Boolean(item)));
  }

  const tokens = Array.from(new Set(created.flatMap(item => item.user.pushDevices.map(device => device.token))));
  if (!tokens.length) return created.length;

  try {
    const result = await sendPushToDevices(tokens, {
      title: input.title,
      body: input.body,
      href: input.href,
      category: input.type.toLowerCase(),
    });
    if (!result.configured) return created.length;

    const deliveriesByToken = new Map(result.deliveries.map(delivery => [delivery.token, delivery]));
    const invalidTokens = result.deliveries.filter(item => item.invalid).map(item => item.token);
    if (invalidTokens.length) {
      await prisma.pushDevice.updateMany({ where: { token: { in: invalidTokens } }, data: { disabledAt: new Date() } });
    }

    await Promise.all(created.map(({ user, notification }) => {
      const deliveries = user.pushDevices.map(device => deliveriesByToken.get(device.token)).filter(Boolean);
      if (!deliveries.length) return Promise.resolve();
      const delivered = deliveries.some(item => item?.ok);
      const errors = deliveries.filter(item => !item?.ok).map(item => item?.error).filter(Boolean).join(', ');
      return prisma.notification.update({
        where: { id: notification.id },
        data: delivered
          ? { pushSentAt: new Date(), pushError: errors || null }
          : { pushError: errors.slice(0, 500) || 'Push delivery failed' },
      });
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Push delivery failed';
    await Promise.all(created.map(({ notification }) => prisma.notification.update({
      where: { id: notification.id },
      data: { pushError: message.slice(0, 500) },
    })));
    console.error('Push delivery failed:', message);
  }
  return created.length;
}

async function activeUsersForAudience(rawAudienceTeamIds: unknown) {
  const teamIds = audienceIds(rawAudienceTeamIds);
  return prisma.user.findMany({
    where: {
      accountStatus: 'ACTIVE',
      ...(teamIds.length ? { teams: { some: { id: { in: teamIds } } } } : {}),
    },
    select: {
      id: true,
      notificationPreferences: true,
      pushDevices: { where: { disabledAt: null }, select: { token: true } },
    },
  });
}

export async function notifyTeamMessage(input: {
  messageId: string;
  teamId: string;
  teamName: string;
  senderId: string;
  senderName: string;
  text: string;
}) {
  const rich = parseChatPayload(input.text);
  const preview = rich?.kind === 'poll' ? `New poll: ${rich.question}` : input.text.slice(0, 140);
  const recipients = await prisma.user.findMany({
    where: {
      id: { not: input.senderId },
      accountStatus: 'ACTIVE',
      teams: { some: { id: input.teamId } },
      blocksMade: { none: { blockedId: input.senderId } },
    },
    select: {
      id: true,
      notificationPreferences: true,
      pushDevices: { where: { disabledAt: null }, select: { token: true } },
    },
  });
  return notifyRecipients(recipients, 'messages', {
    type: 'MESSAGE',
    title: `${input.senderName} in ${input.teamName}`,
    body: preview,
    href: `/chat/${input.teamId}`,
    dedupePrefix: `message:${input.messageId}`,
  });
}

export async function notifyEventInvitation(event: { id: string; title: string }, teamIds: string[]) {
  const recipients = await activeUsersForAudience(teamIds);
  return notifyRecipients(recipients, 'invitations', {
    type: 'INVITATION',
    title: `Invitation: ${event.title}`,
    body: 'Your team has a new event. Open it to review the details and register.',
    href: `/events/${event.id}`,
    eventId: event.id,
    dedupePrefix: `event-invitation:${event.id}`,
  });
}

export async function notifyLiveStarted(live: { id: string; url: string }) {
  const recipients = await activeUsersForAudience([]);
  return notifyRecipients(recipients, 'live', {
    type: 'LIVE',
    title: 'FHM is live now',
    body: 'The live service has started. Tap to join.',
    href: live.url,
    dedupePrefix: `live:${live.id}`,
  });
}

export async function notifyNewMedia(input: {
  id: string;
  kind: 'sermon' | 'podcast' | 'article';
  title: string;
  audienceTeamIds: unknown;
}) {
  const recipients = await activeUsersForAudience(input.audienceTeamIds);
  const labels = { sermon: 'sermon', podcast: 'podcast episode', article: 'article' } as const;
  const hrefs = { sermon: `/sermons/${input.id}`, podcast: `/podcasts/${input.id}`, article: `/articles/${input.id}` } as const;
  return notifyRecipients(recipients, 'media', {
    type: 'MEDIA',
    title: `New ${labels[input.kind]}`,
    body: input.title,
    href: hrefs[input.kind],
    dedupePrefix: `media:${input.kind}:${input.id}`,
  });
}

export async function sendUpcomingEventReminders(now = new Date()) {
  const reminderCutoff = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const events = await prisma.event.findMany({
    where: { startTime: { gt: now, lte: reminderCutoff } },
    select: { id: true, title: true, startTime: true, visibility: true, teams: { select: { id: true } } },
  });

  let recipientCount = 0;
  for (const event of events) {
    const recipients = event.visibility === 'TEAM'
      ? await prisma.user.findMany({
          where: { accountStatus: 'ACTIVE', eventInvitations: { some: { eventId: event.id } } },
          select: { id: true, notificationPreferences: true, pushDevices: { where: { disabledAt: null }, select: { token: true } } },
        })
      : await activeUsersForAudience([]);
    recipientCount += await notifyRecipients(recipients, 'reminders', {
      type: 'REMINDER',
      title: `Coming up: ${event.title}`,
      body: 'This event starts within the next two hours. Tap to view the details.',
      href: `/events/${event.id}`,
      eventId: event.id,
      dedupePrefix: `event-reminder:${event.id}:${event.startTime?.toISOString()}`,
    });
  }

  return { events: events.length, recipients: recipientCount };
}
