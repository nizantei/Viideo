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
  {
    id: 'clip-11',
    title: 'Clip 11',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('996b6a635c2d287796edb65fddb2d048'),
    thumbnailUrl: getThumbnailUrl('996b6a635c2d287796edb65fddb2d048'),
  },
  {
    id: 'clip-12',
    title: 'Clip 12',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('7596d0f732586ab36a62dfa85370067a'),
    thumbnailUrl: getThumbnailUrl('7596d0f732586ab36a62dfa85370067a'),
  },
  {
    id: 'clip-13',
    title: 'Clip 13',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('e66d08aa958441fc3645283b122e622e'),
    thumbnailUrl: getThumbnailUrl('e66d08aa958441fc3645283b122e622e'),
  },
  {
    id: 'clip-14',
    title: 'Clip 14',
    folder: 'ratio-4-1',
    hlsUrl: getHlsUrl('3cedd0701cba67f9c040fe63f5beeb6c'),
    thumbnailUrl: getThumbnailUrl('3cedd0701cba67f9c040fe63f5beeb6c'),
  },
  {
    id: 'clip-15',
    title: 'Clip 15',
    folder: 'ratio-4-1',
    hlsUrl: getHlsUrl('ab30dee2d0e890ecab05e57f7398b8e8'),
    thumbnailUrl: getThumbnailUrl('ab30dee2d0e890ecab05e57f7398b8e8'),
  },
  {
    id: 'clip-16',
    title: 'Clip 16',
    folder: 'ratio-4-1',
    hlsUrl: getHlsUrl('3653f341488761cce72df188c58baa1e'),
    thumbnailUrl: getThumbnailUrl('3653f341488761cce72df188c58baa1e'),
  },
  {
    id: 'clip-17',
    title: 'Clip 17',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('596ff3b1449086b1103bf2edb7935c67'),
    thumbnailUrl: getThumbnailUrl('596ff3b1449086b1103bf2edb7935c67'),
  },
  {
    id: 'clip-18',
    title: 'Clip 18',
    folder: 'ratio-3-1',
    hlsUrl: getHlsUrl('7437002010a06728ac87c603d6a843ed'),
    thumbnailUrl: getThumbnailUrl('7437002010a06728ac87c603d6a843ed'),
  },
];

export function getVideoById(id: string): Video | undefined {
  return videos.find(v => v.id === id);
}

export function getVideosByFolder(folderId: string): Video[] {
  if (folderId === 'all') return videos;
  return videos.filter(v => v.folder === folderId);
}
