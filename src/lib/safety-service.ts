import { prisma } from '@/lib/prisma';
import { moderateText, hashModeratedContent } from '@/lib/moderation';
import { sendModerationAlertEmail } from '@/lib/email';
import { CURRENT_TERMS_VERSION } from '@/lib/terms';
import { REPORT_REASONS } from '@/lib/safety-constants';

export async function getUgcAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, accountStatus: true, suspendedUntil: true, termsAcceptedVersion: true },
  });
  if (!user) return { allowed: false as const, status: 401, error: 'Unauthorized' };
  if (user.accountStatus === 'BANNED') return { allowed: false as const, status: 403, error: 'This account is not permitted to use community features.' };
  if (user.accountStatus === 'SUSPENDED' && (!user.suspendedUntil || user.suspendedUntil > new Date())) {
    return { allowed: false as const, status: 403, error: 'This account is temporarily suspended from community features.' };
  }
  if (user.termsAcceptedVersion !== CURRENT_TERMS_VERSION) {
    return { allowed: false as const, status: 428, error: 'Please accept the current Terms of Use before using community features.' };
  }
  return { allowed: true as const, user };
}

export async function moderateAndRecordText(input: {
  text: string;
  surface: string;
  userId?: string;
  messageId?: string;
}) {
  const result = moderateText(input.text);
  await prisma.contentModerationEvent.create({
    data: {
      userId: input.userId,
      messageId: input.messageId,
      surface: input.surface,
      outcome: result.allowed ? 'ALLOWED' : 'REJECTED',
      categories: result.categories,
      contentHash: result.contentHash,
    },
  });
  return result;
}

function normalizeReportInput(reason: unknown, details: unknown) {
  const safeReason = typeof reason === 'string' && REPORT_REASONS.includes(reason as typeof REPORT_REASONS[number]) ? reason : 'Other';
  const safeDetails = typeof details === 'string' ? details.trim().slice(0, 1000) : '';
  return { reason: safeReason, details: safeDetails || null };
}

async function assertReportableMessage(reporterId: string, messageId: string, reportedUserId?: string) {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { id: true, userId: true, teamId: true, contentType: true, team: { select: { members: { where: { id: reporterId }, select: { id: true } } } } },
  });
  if (!message) throw new Error('CONTENT_NOT_FOUND');
  if (message.userId === reporterId) throw new Error('CANNOT_REPORT_SELF');
  if (reportedUserId && message.userId !== reportedUserId) throw new Error('CONTENT_OWNER_MISMATCH');
  const reporter = await prisma.user.findUnique({ where: { id: reporterId }, select: { role: true } });
  if (!message.team.members.length && reporter?.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return message;
}

export async function createMessageReport(input: {
  reporterId: string;
  messageId: string;
  reason: unknown;
  details?: unknown;
  source?: 'USER_REPORT' | 'USER_BLOCK';
  reportedUserId?: string;
}) {
  const message = await assertReportableMessage(input.reporterId, input.messageId, input.reportedUserId);
  const { reason, details } = normalizeReportInput(input.reason, input.details);
  const source = input.source || 'USER_REPORT';
  const deadlineAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const created = await prisma.chatReport.createMany({
    data: [{
      reporterId: input.reporterId,
      messageId: message.id,
      reportedUserId: message.userId,
      teamId: message.teamId,
      contentType: message.contentType,
      reason,
      details,
      source,
      deadlineAt,
    }],
    skipDuplicates: true,
  });
  const report = await prisma.chatReport.findUnique({ where: { reporterId_messageId_source: { reporterId: input.reporterId, messageId: message.id, source } } });
  if (!report) throw new Error('REPORT_NOT_CREATED');
  if (created.count === 1) await dispatchModerationNotification(report.id);
  return report;
}

export async function blockUserFromMessage(input: {
  blockerId: string;
  messageId: string;
  blockedId: string;
  reason: unknown;
  details?: unknown;
}) {
  const message = await assertReportableMessage(input.blockerId, input.messageId, input.blockedId);
  const { reason, details } = normalizeReportInput(input.reason, input.details);
  const deadlineAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [block, report] = await prisma.$transaction([
    prisma.userBlock.upsert({
      where: { blockerId_blockedId: { blockerId: input.blockerId, blockedId: input.blockedId } },
      update: { reason, sourceMessageId: message.id },
      create: { blockerId: input.blockerId, blockedId: input.blockedId, reason, sourceMessageId: message.id },
    }),
    prisma.chatReport.upsert({
      where: { reporterId_messageId_source: { reporterId: input.blockerId, messageId: message.id, source: 'USER_BLOCK' } },
      update: { reason, details },
      create: {
        reporterId: input.blockerId,
        messageId: message.id,
        reportedUserId: message.userId,
        teamId: message.teamId,
        contentType: message.contentType,
        reason,
        details,
        source: 'USER_BLOCK',
        deadlineAt,
      },
    }),
  ]);
  await dispatchModerationNotification(report.id);
  return { block, report };
}

export async function dispatchModerationNotification(reportId: string, escalation = false) {
  const report = await prisma.chatReport.findUnique({ where: { id: reportId }, select: { id: true, reason: true, deadlineAt: true } });
  if (!report) throw new Error('REPORT_NOT_FOUND');
  const attemptAt = new Date();
  try {
    await sendModerationAlertEmail({ reportId: report.id, reason: report.reason, deadlineAt: report.deadlineAt, escalation });
    await prisma.chatReport.update({
      where: { id: report.id },
      data: {
        notificationStatus: 'SENT',
        notificationAttempts: { increment: 1 },
        notificationLastAt: attemptAt,
        notificationError: null,
        notifiedAt: escalation ? undefined : attemptAt,
        escalatedAt: escalation ? attemptAt : undefined,
      },
    });
  } catch (error) {
    await prisma.chatReport.update({
      where: { id: report.id },
      data: {
        notificationStatus: 'FAILED',
        notificationAttempts: { increment: 1 },
        notificationLastAt: attemptAt,
        notificationError: error instanceof Error ? error.message.slice(0, 500) : 'Notification delivery failed',
      },
    });
  }
}

export type ModeratorAction = 'DISMISS' | 'REMOVE_CONTENT' | 'WARN_USER' | 'SUSPEND_USER' | 'BAN_USER' | 'RESTORE_CONTENT';

export async function performModeratorAction(input: {
  reportId: string;
  moderatorId: string;
  action: ModeratorAction;
  note: string;
}) {
  const note = input.note.trim().slice(0, 2000);
  if (!note) throw new Error('A resolution note is required.');
  const moderator = await prisma.user.findUnique({ where: { id: input.moderatorId }, select: { role: true } });
  if (moderator?.role !== 'ADMIN') throw new Error('FORBIDDEN');
  const report = await prisma.chatReport.findUnique({ where: { id: input.reportId }, select: { id: true, messageId: true, reportedUserId: true } });
  if (!report) throw new Error('REPORT_NOT_FOUND');
  const now = new Date();

  await prisma.$transaction(async tx => {
    if (input.action === 'REMOVE_CONTENT') {
      await tx.chatMessage.update({ where: { id: report.messageId }, data: { moderationStatus: 'REMOVED', removedAt: now, moderatedAt: now, moderationReason: note } });
    } else if (input.action === 'RESTORE_CONTENT') {
      await tx.chatMessage.update({ where: { id: report.messageId }, data: { moderationStatus: 'PUBLISHED', removedAt: null, moderatedAt: now, moderationReason: note } });
    } else if (input.action === 'WARN_USER') {
      await tx.notification.create({ data: { type: 'MESSAGE', title: 'Community standards warning', body: 'A moderator reviewed content from your account. Please review the Community Guidelines before posting again.', href: '/community-guidelines', userId: report.reportedUserId } });
    } else if (input.action === 'SUSPEND_USER') {
      await tx.user.update({ where: { id: report.reportedUserId }, data: { accountStatus: 'SUSPENDED', suspendedUntil: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) } });
      await tx.chatMessage.update({ where: { id: report.messageId }, data: { moderationStatus: 'REMOVED', removedAt: now, moderatedAt: now, moderationReason: note } });
    } else if (input.action === 'BAN_USER') {
      await tx.user.update({ where: { id: report.reportedUserId }, data: { accountStatus: 'BANNED', suspendedUntil: null } });
      await tx.chatMessage.update({ where: { id: report.messageId }, data: { moderationStatus: 'REMOVED', removedAt: now, moderatedAt: now, moderationReason: note } });
    }

    await tx.chatReport.update({
      where: { id: report.id },
      data: {
        status: input.action === 'DISMISS' ? 'DISMISSED' : 'ACTIONED',
        reviewStartedAt: now,
        resolvedAt: now,
        moderatorId: input.moderatorId,
        moderatorAction: input.action,
        resolutionNote: note,
      },
    });
    await tx.moderationAudit.create({ data: { reportId: report.id, messageId: report.messageId, moderatorId: input.moderatorId, subjectUserId: report.reportedUserId, action: input.action, note } });
  });
}

export async function reviewPendingVoice(input: { messageId: string; moderatorId: string; approve: boolean; note: string }) {
  const note = input.note.trim().slice(0, 2000);
  if (!note) throw new Error('A review note is required.');
  const moderator = await prisma.user.findUnique({ where: { id: input.moderatorId }, select: { role: true } });
  if (moderator?.role !== 'ADMIN') throw new Error('FORBIDDEN');
  const message = await prisma.chatMessage.findUnique({ where: { id: input.messageId }, select: { id: true, userId: true, contentType: true, moderationStatus: true } });
  if (!message || message.contentType !== 'VOICE' || message.moderationStatus !== 'PENDING') throw new Error('PENDING_VOICE_NOT_FOUND');
  const now = new Date();
  await prisma.$transaction([
    prisma.chatMessage.update({ where: { id: message.id }, data: { moderationStatus: input.approve ? 'PUBLISHED' : 'REMOVED', moderatedAt: now, removedAt: input.approve ? null : now, moderationReason: note } }),
    prisma.moderationAudit.create({ data: { messageId: message.id, moderatorId: input.moderatorId, subjectUserId: message.userId, action: input.approve ? 'APPROVE_CONTENT' : 'REMOVE_CONTENT', note } }),
    prisma.contentModerationEvent.create({ data: { userId: message.userId, messageId: message.id, surface: 'team_chat_voice', outcome: input.approve ? 'ALLOWED' : 'REJECTED', categories: [], contentHash: hashModeratedContent(message.id) } }),
  ]);
}
