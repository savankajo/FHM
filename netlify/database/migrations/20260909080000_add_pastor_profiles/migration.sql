CREATE TABLE "PastorProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PastorProfile_pkey" PRIMARY KEY ("id")
);

INSERT INTO "PastorProfile" ("id", "name", "role", "initials", "sortOrder") VALUES
    ('peter-ramsis', 'Peter Ramsis', 'Senior Pastor', 'PR', 1),
    ('liliane-ramsis', 'Liliane Ramsis', 'Women''s Pastor', 'LR', 2);
