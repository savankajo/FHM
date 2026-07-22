export type SermonCollection = 'saturday' | 'tuesday' | 'thursday';
export type PodcastSeason = 'season-1' | 'season-2';

const SERMON_COLLECTION_RE = /\[mediaCollection:(saturday|tuesday|thursday)\]\n?/;
const PODCAST_SEASON_RE = /\[podcastSeason:(season-1|season-2)\]\n?/;
const YOUTUBE_PLAYLIST_ID_RE = /\[youtubePlaylistId:([^\]]+)\]\n?/;
const YOUTUBE_PLAYLIST_NAME_RE = /\[youtubePlaylistName:([^\]]+)\]\n?/;

export function getSermonCollection(notes?: string | null): SermonCollection {
  return (notes?.match(SERMON_COLLECTION_RE)?.[1] as SermonCollection | undefined) || 'saturday';
}

export function setSermonCollection(notes: string | null | undefined, collection: SermonCollection): string {
  const cleanNotes = (notes || '').replace(SERMON_COLLECTION_RE, '').trim();
  return [`[mediaCollection:${collection}]`, cleanNotes].filter(Boolean).join('\n');
}

export function stripSermonCollection(notes?: string | null): string {
  return (notes || '').replace(SERMON_COLLECTION_RE, '').replace(YOUTUBE_PLAYLIST_ID_RE, '').replace(YOUTUBE_PLAYLIST_NAME_RE, '').trim();
}

export function getYoutubePlaylistId(notes?: string | null): string {
  return notes?.match(YOUTUBE_PLAYLIST_ID_RE)?.[1] || 'all';
}

export function getYoutubePlaylistName(notes?: string | null): string {
  return notes?.match(YOUTUBE_PLAYLIST_NAME_RE)?.[1] || 'All Saturday Sermons';
}

export function setYoutubePlaylist(notes: string | null | undefined, playlistId: string, playlistName: string): string {
  const cleanNotes = (notes || '').replace(YOUTUBE_PLAYLIST_ID_RE, '').replace(YOUTUBE_PLAYLIST_NAME_RE, '').trim();
  return [`[youtubePlaylistId:${playlistId}]`, `[youtubePlaylistName:${playlistName}]`, cleanNotes].filter(Boolean).join('\n');
}

export function getPodcastSeason(description?: string | null): PodcastSeason {
  return (description?.match(PODCAST_SEASON_RE)?.[1] as PodcastSeason | undefined) || 'season-1';
}

export function setPodcastSeason(description: string | null | undefined, season: PodcastSeason): string {
  const cleanDescription = (description || '').replace(PODCAST_SEASON_RE, '').trim();
  return [`[podcastSeason:${season}]`, cleanDescription].filter(Boolean).join('\n');
}

export function stripPodcastSeason(description?: string | null): string {
  return (description || '').replace(PODCAST_SEASON_RE, '').trim();
}
