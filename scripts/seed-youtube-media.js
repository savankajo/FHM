const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const CHANNELS = [
  {
    kind: 'sermon',
    channelId: 'UC4p4zFF7ytfDAd7vchdKYOA',
    speaker: 'FHM Church',
    notesPrefix: '[mediaCollection:saturday]\nSaturday Sermon imported from Fathers Heart Church YouTube channel.',
  },
  {
    kind: 'podcast',
    channelId: 'UCWevdBMSq2D4_ugGkXOI3aA',
    descriptionPrefix: '[podcastSeason:season-1]\nCoffee With the Shepherd episode imported from YouTube.',
  },
];

function asText(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value.text === 'string') return value.text;
  if (typeof value.toString === 'function') return value.toString();
  return '';
}

function thumbnailUrl(videoId, item) {
  const thumbnails = item?.content_image?.image || [];
  const best = thumbnails[thumbnails.length - 1];
  return best?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function durationText(item) {
  const overlays = item?.content_image?.overlays || [];
  for (const overlay of overlays) {
    const text = overlay?.badges?.[0]?.text || overlay?.thumbnail_badge?.text;
    if (text) return asText(text);
  }
  const label = asText(item?.renderer_context?.accessibility_context?.label);
  const match = label.match(/(\d+\s+hours?,\s+)?\d+\s+minutes?(,\s+\d+\s+seconds?)?|\d+:\d{2}(?::\d{2})?/);
  return match?.[0] || '';
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      'accept-language': 'en-US,en;q=0.9',
    },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.text();
}

async function getPublishDate(videoId) {
  const html = await fetchText(`https://www.youtube.com/watch?v=${videoId}`);
  const date = html.match(/"publishDate":"([^"]+)/)?.[1]
    || html.match(/"uploadDate":"([^"]+)/)?.[1]
    || html.match(/datePublished" content="([^"]+)/)?.[1];
  return date ? new Date(date) : new Date();
}

async function getChannelVideos(channelId) {
  const { Innertube } = await import('youtubei.js');
  const youtube = await Innertube.create();
  const channel = await youtube.getChannel(channelId);
  let page = await channel.getVideos();
  const seen = new Set();
  const videos = [];

  while (page) {
    for (const item of page.videos || []) {
      const videoId = item.content_id;
      const title = asText(item?.metadata?.title);
      if (!videoId || !title || seen.has(videoId)) continue;
      seen.add(videoId);
      videos.push({
        videoId,
        title,
        length: durationText(item),
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: thumbnailUrl(videoId, item),
      });
    }

    if (!page.has_continuation) break;
    page = await page.getContinuation();
  }

  return videos;
}

async function getChannelPlaylists(channelId) {
  const { Innertube } = await import('youtubei.js');
  const youtube = await Innertube.create();
  const channel = await youtube.getChannel(channelId);
  let page = await channel.getPlaylists();
  const playlists = [];

  while (page) {
    for (const item of page.playlists || []) {
      const playlistId = item.content_id;
      const playlistName = asText(item?.metadata?.title);
      if (!playlistId || !playlistName) continue;
      const playlist = await youtube.getPlaylist(playlistId);
      const videos = playlist.videos || [];
      playlists.push({
        playlistId,
        playlistName,
        videoIds: videos.map(video => video.content_id).filter(Boolean),
      });
    }

    if (!page.has_continuation) break;
    page = await page.getContinuation();
  }

  return playlists;
}

async function upsertSermon(video, channel) {
  const date = await getPublishDate(video.videoId);
  const existing = await prisma.sermon.findFirst({ where: { videoUrl: video.url } });
  const playlistLines = video.playlistId && video.playlistName
    ? [`[youtubePlaylistId:${video.playlistId}]`, `[youtubePlaylistName:${video.playlistName}]`]
    : [];
  const data = {
    title: video.title,
    speaker: channel.speaker,
    date,
    type: 'VIDEO',
    videoUrl: video.url,
    thumbnailUrl: video.thumbnailUrl,
    notes: [...playlistLines, channel.notesPrefix, video.length ? `Duration: ${video.length}` : ''].filter(Boolean).join('\n'),
    audienceTeamIds: [],
  };

  if (existing) {
    await prisma.sermon.update({ where: { id: existing.id }, data });
    return 'updated';
  }

  await prisma.sermon.create({ data });
  return 'created';
}

async function upsertPodcast(video, channel) {
  const publishedAt = await getPublishDate(video.videoId);
  const existing = await prisma.podcastEpisode.findFirst({ where: { audioUrl: video.url } });
  const data = {
    title: video.title,
    description: [channel.descriptionPrefix, video.length ? `Duration: ${video.length}` : ''].filter(Boolean).join('\n'),
    publishedAt,
    audioUrl: video.url,
    thumbnailUrl: video.thumbnailUrl,
    audienceTeamIds: [],
  };

  if (existing) {
    await prisma.podcastEpisode.update({ where: { id: existing.id }, data });
    return 'updated';
  }

  await prisma.podcastEpisode.create({ data });
  return 'created';
}

async function main() {
  for (const channel of CHANNELS) {
    const videos = await getChannelVideos(channel.channelId);
    if (channel.kind === 'sermon') {
      const playlists = await getChannelPlaylists(channel.channelId);
      const byVideoId = new Map();
      for (const playlist of playlists) {
        for (const videoId of playlist.videoIds) {
          if (!byVideoId.has(videoId)) byVideoId.set(videoId, playlist);
        }
      }
      for (const video of videos) {
        const playlist = byVideoId.get(video.videoId);
        if (playlist) {
          video.playlistId = playlist.playlistId;
          video.playlistName = playlist.playlistName;
        }
      }
      console.log(`${channel.kind}: found ${playlists.length} playlists`);
    }
    let created = 0;
    let updated = 0;

    console.log(`${channel.kind}: found ${videos.length} videos`);

    for (const video of videos) {
      const result = channel.kind === 'sermon'
        ? await upsertSermon(video, channel)
        : await upsertPodcast(video, channel);
      if (result === 'created') created += 1;
      if (result === 'updated') updated += 1;
      console.log(`${channel.kind}: ${result} ${video.title}`);
    }

    console.log(`${channel.kind}: ${created} created, ${updated} updated`);
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
