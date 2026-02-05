import { Video, Folder } from '../types';

export const folders: Folder[] = [
  { id: 'all', name: 'All Clips' },
  { id: 'ratio-3-1', name: 'Ratio 3:1' },
  { id: 'ratio-4-1', name: 'Ratio 4:1' },
];

const CUSTOMER_ID = 'customer-da4812z845ijzly5';

function getThumbnailUrl(videoId: string): string {
  return `https://${CUSTOMER_ID}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`;
}

// Store loaded videos in memory
let cachedVideos: Video[] | null = null;

/**
 * Load clips from clips.json dynamically
 * This allows updating clips without modifying code
 */
async function loadClipsFromJson(): Promise<Video[]> {
  try {
    const response = await fetch('/clips.json');
    if (!response.ok) {
      throw new Error(`Failed to load clips.json: ${response.status}`);
    }

    const data = await response.json();

    // Transform clips data to Video format
    const videos: Video[] = data.clips.map((clip: any) => ({
      id: clip.id,
      title: clip.title,
      folder: clip.folder,
      hlsUrl: clip.hlsUrl,
      thumbnailUrl: getThumbnailUrl(clip.videoId),
    }));

    console.log(`✓ Loaded ${videos.length} clips from clips.json`);
    return videos;
  } catch (error) {
    console.error('Failed to load clips.json:', error);
    // Return empty array on error
    return [];
  }
}

/**
 * Get all videos (loads from clips.json on first call, then caches)
 */
export async function getVideos(): Promise<Video[]> {
  if (cachedVideos === null) {
    cachedVideos = await loadClipsFromJson();
  }
  return cachedVideos;
}

/**
 * Get video by ID
 */
export async function getVideoById(id: string): Promise<Video | undefined> {
  const videos = await getVideos();
  return videos.find(v => v.id === id);
}

/**
 * Get videos filtered by folder
 */
export async function getVideosByFolder(folderId: string): Promise<Video[]> {
  const videos = await getVideos();
  if (folderId === 'all') return videos;
  return videos.filter(v => v.folder === folderId);
}

/**
 * Reload clips from JSON (useful for hot-reload or refresh)
 */
export async function reloadClips(): Promise<Video[]> {
  cachedVideos = null;
  return getVideos();
}

// For backward compatibility, export a synchronous videos array
// This will be empty initially until clips are loaded
export const videos: Video[] = [];

// Load clips immediately when module is imported
getVideos().then(loadedVideos => {
  // Populate the videos array for any code that expects it synchronously
  videos.length = 0;
  videos.push(...loadedVideos);
});
