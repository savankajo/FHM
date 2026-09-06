ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'LIVE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MEDIA';

ALTER TABLE "Notification"
  ADD COLUMN "dedupeKey" TEXT,
  ADD COLUMN "pushSentAt" TIMESTAMP(3),
  ADD COLUMN "pushError" TEXT;

CREATE UNIQUE INDEX "Notification_dedupeKey_key" ON "Notification"("dedupeKey");

CREATE TABLE "PushDevice" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "platform" TEXT NOT NULL DEFAULT 'ios',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "disabledAt" TIMESTAMP(3),
  "userId" TEXT NOT NULL,
  CONSTRAINT "PushDevice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushDevice_token_key" ON "PushDevice"("token");
CREATE INDEX "PushDevice_userId_disabledAt_idx" ON "PushDevice"("userId", "disabledAt");
ALTER TABLE "PushDevice" ADD CONSTRAINT "PushDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
