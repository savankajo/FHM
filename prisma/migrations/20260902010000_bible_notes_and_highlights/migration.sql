-- Private Bible annotations are stored per account and are only accessible
-- through authenticated server routes.
CREATE TABLE "BibleHighlight" (
  "id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "chapterReference" TEXT NOT NULL,
  "verse" INTEGER NOT NULL,
  "color" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "BibleHighlight_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BibleHighlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "BibleNote" (
  "id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "bookId" TEXT NOT NULL,
  "chapterId" TEXT NOT NULL,
  "chapterReference" TEXT NOT NULL,
  "verseKey" TEXT NOT NULL,
  "verses" INTEGER[] NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  CONSTRAINT "BibleNote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BibleNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "BibleHighlight_userId_version_chapterId_verse_key" ON "BibleHighlight"("userId", "version", "chapterId", "verse");
CREATE INDEX "BibleHighlight_userId_updatedAt_idx" ON "BibleHighlight"("userId", "updatedAt");
CREATE UNIQUE INDEX "BibleNote_userId_version_chapterId_verseKey_key" ON "BibleNote"("userId", "version", "chapterId", "verseKey");
CREATE INDEX "BibleNote_userId_updatedAt_idx" ON "BibleNote"("userId", "updatedAt");

ALTER TABLE "BibleHighlight" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BibleNote" ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE "BibleHighlight" FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE "BibleNote" FROM anon, authenticated;
