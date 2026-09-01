-- Additive moderation and terms-acceptance storage for App Store Guideline 1.2.
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');
CREATE TYPE "ChatContentType" AS ENUM ('TEXT', 'VOICE', 'POLL');
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REMOVED');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'DISMISSED', 'ACTIONED');
CREATE TYPE "ReportSource" AS ENUM ('USER_REPORT', 'USER_BLOCK');
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
CREATE TYPE "ModerationOutcome" AS ENUM ('ALLOWED', 'REJECTED', 'MANUAL_REVIEW');

ALTER TABLE "User"
  ADD COLUMN "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "suspendedUntil" TIMESTAMP(3),
  ADD COLUMN "termsAcceptedVersion" TEXT,
  ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);

ALTER TABLE "ChatMessage"
  ADD COLUMN "contentType" "ChatContentType" NOT NULL DEFAULT 'TEXT',
  ADD COLUMN "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN "moderationReason" TEXT,
  ADD COLUMN "moderatedAt" TIMESTAMP(3),
  ADD COLUMN "removedAt" TIMESTAMP(3);

UPDATE "ChatMessage"
SET "contentType" = CASE
  WHEN "text" LIKE '__FHM_CHAT__%"kind":"voice"%' THEN 'VOICE'::"ChatContentType"
  WHEN "text" LIKE '__FHM_CHAT__%"kind":"poll"%' THEN 'POLL'::"ChatContentType"
  ELSE 'TEXT'::"ChatContentType"
END;

DROP INDEX IF EXISTS "ChatReport_reporterId_messageId_key";

ALTER TABLE "ChatReport"
  ADD COLUMN "details" TEXT,
  ADD COLUMN "source" "ReportSource" NOT NULL DEFAULT 'USER_REPORT',
  ADD COLUMN "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
  ADD COLUMN "contentType" "ChatContentType" NOT NULL DEFAULT 'TEXT',
  ADD COLUMN "deadlineAt" TIMESTAMP(3),
  ADD COLUMN "reviewStartedAt" TIMESTAMP(3),
  ADD COLUMN "moderatorId" TEXT,
  ADD COLUMN "moderatorAction" TEXT,
  ADD COLUMN "resolutionNote" TEXT,
  ADD COLUMN "reportedUserId" TEXT,
  ADD COLUMN "teamId" TEXT,
  ADD COLUMN "notificationStatus" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "notificationAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "notificationLastAt" TIMESTAMP(3),
  ADD COLUMN "notificationError" TEXT,
  ADD COLUMN "notifiedAt" TIMESTAMP(3),
  ADD COLUMN "escalatedAt" TIMESTAMP(3);

UPDATE "ChatReport" AS report
SET
  "deadlineAt" = report."createdAt" + INTERVAL '24 hours',
  "reportedUserId" = message."userId",
  "teamId" = message."teamId",
  "contentType" = message."contentType"
FROM "ChatMessage" AS message
WHERE message."id" = report."messageId";

ALTER TABLE "ChatReport"
  ALTER COLUMN "deadlineAt" SET NOT NULL,
  ALTER COLUMN "reportedUserId" SET NOT NULL,
  ALTER COLUMN "teamId" SET NOT NULL;

ALTER TABLE "UserBlock"
  ADD COLUMN "reason" TEXT NOT NULL DEFAULT 'Other',
  ADD COLUMN "sourceMessageId" TEXT;
ALTER TABLE "UserBlock" ALTER COLUMN "reason" DROP DEFAULT;

CREATE TABLE "TermsAcceptance" (
  "id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "method" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "TermsAcceptance_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TermsAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ModerationAudit" (
  "id" TEXT NOT NULL,
  "reportId" TEXT,
  "messageId" TEXT,
  "moderatorId" TEXT NOT NULL,
  "subjectUserId" TEXT,
  "action" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ModerationAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContentModerationEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "messageId" TEXT,
  "surface" TEXT NOT NULL,
  "outcome" "ModerationOutcome" NOT NULL,
  "categories" JSONB,
  "contentHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentModerationEvent_pkey" PRIMARY KEY ("id")
);

-- These tables are server-only. The app uses a direct Prisma connection and
-- never exposes moderation data through Supabase's Data API.
ALTER TABLE "TermsAcceptance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ModerationAudit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContentModerationEvent" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE "TermsAcceptance" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "ModerationAudit" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "ContentModerationEvent" FROM anon, authenticated;

CREATE UNIQUE INDEX "TermsAcceptance_userId_version_key" ON "TermsAcceptance"("userId", "version");
CREATE INDEX "TermsAcceptance_acceptedAt_idx" ON "TermsAcceptance"("acceptedAt");
CREATE INDEX "ChatMessage_teamId_moderationStatus_createdAt_idx" ON "ChatMessage"("teamId", "moderationStatus", "createdAt");
CREATE UNIQUE INDEX "ChatReport_reporterId_messageId_source_key" ON "ChatReport"("reporterId", "messageId", "source");
CREATE INDEX "ChatReport_status_deadlineAt_idx" ON "ChatReport"("status", "deadlineAt");
CREATE INDEX "ChatReport_reportedUserId_createdAt_idx" ON "ChatReport"("reportedUserId", "createdAt");
CREATE INDEX "ChatReport_notificationStatus_idx" ON "ChatReport"("notificationStatus");
CREATE INDEX "UserBlock_blockerId_createdAt_idx" ON "UserBlock"("blockerId", "createdAt");
CREATE INDEX "ModerationAudit_reportId_createdAt_idx" ON "ModerationAudit"("reportId", "createdAt");
CREATE INDEX "ModerationAudit_subjectUserId_createdAt_idx" ON "ModerationAudit"("subjectUserId", "createdAt");
CREATE INDEX "ModerationAudit_moderatorId_createdAt_idx" ON "ModerationAudit"("moderatorId", "createdAt");
CREATE INDEX "ContentModerationEvent_userId_createdAt_idx" ON "ContentModerationEvent"("userId", "createdAt");
CREATE INDEX "ContentModerationEvent_outcome_createdAt_idx" ON "ContentModerationEvent"("outcome", "createdAt");
