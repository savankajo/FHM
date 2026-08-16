CREATE TYPE "VideoProvider" AS ENUM ('YOUTUBE', 'VIMEO');
ALTER TABLE "Sermon" ADD COLUMN "videoProvider" "VideoProvider", ADD COLUMN "videoId" TEXT;
ALTER TABLE "PodcastEpisode" ADD COLUMN "videoProvider" "VideoProvider", ADD COLUMN "videoId" TEXT;
UPDATE "Sermon" SET "videoProvider"='YOUTUBE' WHERE "videoUrl" LIKE '%youtu%';
