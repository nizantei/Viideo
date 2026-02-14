import { MiniState } from '../types';

export function calculateSwingTranslateX(
  swingingState: MiniState['swinging'],
  videoWidth: number,
  visibleWidth: number,
  zoom: number
): number {
  const zoomedWidth = videoWidth * zoom;
  const scrollableWidth = zoomedWidth - visibleWidth;

  if (scrollableWidth <= 0) {
    return 0;
  }

  return -swingingState.position * scrollableWidth;
}

export function calculateScrollableWidth(
  videoWidth: number,
  visibleWidth: number,
  zoom: number
): number {
  const zoomedWidth = videoWidth * zoom;
  return Math.max(0, zoomedWidth - visibleWidth);
}

export function shouldEnableSwinging(
  videoWidth: number,
  visibleWidth: number,
  zoom: number
): boolean {
  return videoWidth * zoom > visibleWidth;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert a swing position (0-1) to a CSS object-position value.
 * 0 = left edge of video aligned with left edge of container
 * 1 = right edge of video aligned with right edge of container
 * CSS object-position with cover guarantees no black gaps.
 */
export function swingPositionToObjectPosition(position: number): string {
  return `${position * 100}% center`;
}

export function buildTransformString(
  zoom: number,
  panX: number,
  panY: number,
  swingX: number
): string {
  const parts: string[] = [];

  if (zoom !== 1) {
    parts.push(`scale(${zoom})`);
  }

  const totalX = panX + swingX;
  if (totalX !== 0 || panY !== 0) {
    parts.push(`translate(${totalX}px, ${panY}px)`);
  }

  return parts.join(' ') || 'none';
}
