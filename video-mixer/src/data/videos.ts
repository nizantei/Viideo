import { Video, Folder } from '../types';

export const folders: Folder[] = [
  { id: 'all', name: 'All Clips' },
  { id: 'ratio-3-1', name: 'Ratio 3:1' },
  { id: 'ratio-4-1', name: 'Ratio 4:1' },
];

const CUSTOMER_ID = 'customer-da4812z845ijzly5';

function getHlsUrl(videoId: string): string {
  return `https://${CUSTOMER_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
}

function getThumbnailUrl(videoId: string): string {
  return `https://${CUSTOMER_ID}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`;
}

export const videos: Video[] = [
  {
    id: 'clip-1',
    title: 'Clip 1',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('19209a3a0ff8c65eacb7302bb73e274a'),
    thumbnailUrl: getThumbnailUrl('19209a3a0ff8c65eacb7302bb73e274a'),
  },
  {
    id: 'clip-2',
    title: 'Clip 2',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('022ea8b1bcdac625474960c261bb101f'),
    thumbnailUrl: getThumbnailUrl('022ea8b1bcdac625474960c261bb101f'),
  },
  {
    id: 'clip-3',
    title: 'Clip 3',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('195fa9fc137a10fe1b53c8d7e078053b'),
    thumbnailUrl: getThumbnailUrl('195fa9fc137a10fe1b53c8d7e078053b'),
  },
  {
    id: 'clip-4',
    title: 'Clip 4',
    folder: 'ratio-4-1',
    hlsUrl: getHlsUrl('612b963a737a82987354a8f1094d59c0'),
    thumbnailUrl: getThumbnailUrl('612b963a737a82987354a8f1094d59c0'),
  },
  {
    id: 'clip-5',
    title: 'Clip 5',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('8944030da2164d93919cea93c8f3441c'),
    thumbnailUrl: getThumbnailUrl('8944030da2164d93919cea93c8f3441c'),
  },
  {
    id: 'clip-6',
    title: 'Clip 6',
    folder: 'ratio-4-1',
    hlsUrl: getHlsUrl('dd562e3354c917cfbfdb1409ef7f6cc8'),
    thumbnailUrl: getThumbnailUrl('dd562e3354c917cfbfdb1409ef7f6cc8'),
  },
  {
    id: 'clip-7',
    title: 'Clip 7',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('0059e09f9bc9b54852d6631756654ca3'),
    thumbnailUrl: getThumbnailUrl('0059e09f9bc9b54852d6631756654ca3'),
  },
  {
    id: 'clip-8',
    title: 'Clip 8',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('5063374b84fd19117c586716b39c262c'),
    thumbnailUrl: getThumbnailUrl('5063374b84fd19117c586716b39c262c'),
  },
  {
    id: 'clip-9',
    title: 'Clip 9',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('3271614ed4ba4fa990f972cf9faec503'),
    thumbnailUrl: getThumbnailUrl('3271614ed4ba4fa990f972cf9faec503'),
  },
  {
    id: 'clip-10',
    title: 'Clip 10',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('78d709b309d4b9294143fe96ac83e617'),
    thumbnailUrl: getThumbnailUrl('78d709b309d4b9294143fe96ac83e617'),
  },
];

export function getVideoById(id: string): Video | undefined {
  return videos.find(v => v.id === id);
}

export function getVideosByFolder(folderId: string): Video[] {
  if (folderId === 'all') return videos;
  return videos.filter(v => v.folder === folderId);
}
