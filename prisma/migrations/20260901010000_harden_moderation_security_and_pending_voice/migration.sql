-- Keep moderation evidence server-only in every Supabase environment.
ALTER TABLE "ChatReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserBlock" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE "ChatReport" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "UserBlock" FROM anon, authenticated;

-- Authoritatively allow at most one voice message awaiting review per user.
-- The application catches this constraint as an idempotent HTTP 409 response.
CREATE UNIQUE INDEX "ChatMessage_one_pending_voice_per_user_idx"
ON "ChatMessage" ("userId")
WHERE "contentType" = 'VOICE'::"ChatContentType"
  AND "moderationStatus" = 'PENDING'::"ModerationStatus";
