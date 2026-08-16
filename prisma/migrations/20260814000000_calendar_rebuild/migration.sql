CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'TEAM');
CREATE TYPE "RsvpStatus" AS ENUM ('REGISTERED', 'WAITLISTED', 'CANCELLED');

ALTER TABLE "Event"
  ADD COLUMN "startTime" TIMESTAMP(3),
  ADD COLUMN "endTime" TIMESTAMP(3),
  ADD COLUMN "location" TEXT,
  ADD COLUMN "visibility" "EventVisibility" NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN "teamId" TEXT,
  ADD COLUMN "isRecurring" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "recurrenceRule" TEXT;

UPDATE "Event"
SET "visibility" = CASE WHEN "teamScope" IS NULL THEN 'PUBLIC'::"EventVisibility" ELSE 'TEAM'::"EventVisibility" END,
    "startTime" = NULLIF(("locations"->0->>'startTime'), '')::timestamp,
    "endTime" = NULLIF(("locations"->0->>'endTime'), '')::timestamp,
    "location" = COALESCE("locations"->0->>'name', "locations"->0->>'address');

CREATE TABLE "Rsvp" (
  "id" TEXT NOT NULL,
  "status" "RsvpStatus" NOT NULL DEFAULT 'REGISTERED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "Rsvp_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Invitation" (
  "id" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "respondedAt" TIMESTAMP(3),
  "eventId" TEXT NOT NULL,
  "teamId" TEXT,
  "userId" TEXT,
  CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Rsvp_eventId_userId_key" ON "Rsvp"("eventId", "userId");
CREATE INDEX "Rsvp_userId_status_idx" ON "Rsvp"("userId", "status");
CREATE INDEX "Invitation_eventId_idx" ON "Invitation"("eventId");
CREATE INDEX "Invitation_teamId_idx" ON "Invitation"("teamId");
CREATE INDEX "Invitation_userId_idx" ON "Invitation"("userId");
CREATE INDEX "Event_visibility_startTime_idx" ON "Event"("visibility", "startTime");
CREATE INDEX "Event_teamId_idx" ON "Event"("teamId");
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
