/**
 * Coordinate conversion engine
 * Converts normalized 0..1 coordinates to pixel positions
 */

import type {
  NormalizedRect,
  PixelRect,
  SafeAreaInsets,
  ViewportDimensions,
  LayoutElement,
  AnchorPoint,
} from './types';

export function calculateSafeAreaPixels(
  safeArea: SafeAreaInsets,
  viewport: ViewportDimensions
): { top: number; right: number; bottom: number; left: number } {
  return {
    top: Math.round(safeArea.top * viewport.height),
    right: Math.round(safeArea.right * viewport.width),
    bottom: Math.round(safeArea.bottom * viewport.height),
    left: Math.round(safeArea.left * viewport.width),
  };
}

export function normalizedToPixels(
  rect: NormalizedRect,
  viewport: ViewportDimensions,
  safeAreaPx?: { top: number; right: number; bottom: number; left: number },
  useSafeArea: boolean = false
): PixelRect {
  const safeLeft = useSafeArea && safeAreaPx ? safeAreaPx.left : 0;
  const safeTop = useSafeArea && safeAreaPx ? safeAreaPx.top : 0;

  const availableWidth = useSafeArea && safeAreaPx
    ? viewport.width - safeAreaPx.left - safeAreaPx.right
    : viewport.width;
  const availableHeight = useSafeArea && safeAreaPx
    ? viewport.height - safeAreaPx.top - safeAreaPx.bottom
    : viewport.height;

  return {
    x: Math.round(safeLeft + rect.x * availableWidth),
    y: Math.round(safeTop + rect.y * availableHeight),
    w: Math.round(rect.w * availableWidth),
    h: Math.round(rect.h * availableHeight),
  };
}

export function applyConstraints(
  rect: PixelRect,
  element: LayoutElement,
  viewport: ViewportDimensions
): PixelRect {
  let { w, h } = rect;

  // Apply min/max size constraints
  if (element.minSize?.w !== undefined) {
    const minW = Math.round(element.minSize.w * viewport.width);
    w = Math.max(w, minW);
  }
  if (element.minSize?.h !== undefined) {
    const minH = Math.round(element.minSize.h * viewport.height);
    h = Math.max(h, minH);
  }
  if (element.maxSize?.w !== undefined) {
    const maxW = Math.round(element.maxSize.w * viewport.width);
    w = Math.min(w, maxW);
  }
  if (element.maxSize?.h !== undefined) {
    const maxH = Math.round(element.maxSize.h * viewport.height);
    h = Math.min(h, maxH);
  }

  // Apply aspect ratio constraint
  if (element.aspectRatio !== undefined) {
    const targetW = h * element.aspectRatio;
    const targetH = w / element.aspectRatio;

    // Choose dimension that fits better
    if (targetW <= w) {
      w = Math.round(targetW);
    } else {
      h = Math.round(targetH);
    }
  }

  return { ...rect, w, h };
}

export function applyAnchor(
  rect: PixelRect,
  anchor: AnchorPoint = 'top-left'
): PixelRect {
  let { x, y } = rect;
  const { w, h } = rect;

  // Horizontal anchor adjustment
  if (anchor.includes('center')) {
    x = x - w / 2;
  } else if (anchor.includes('right')) {
    x = x - w;
  }

  // Vertical anchor adjustment
  if (anchor.startsWith('center')) {
    y = y - h / 2;
  } else if (anchor.startsWith('bottom')) {
    y = y - h;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    w,
    h,
  };
}

export function calculateHitSlopPixels(
  element: LayoutElement,
  viewport: ViewportDimensions
): { top: number; right: number; bottom: number; left: number } | undefined {
  if (!element.hitSlop) {
    return undefined;
  }

  return {
    top: Math.round(element.hitSlop.top * viewport.height),
    right: Math.round(element.hitSlop.right * viewport.width),
    bottom: Math.round(element.hitSlop.bottom * viewport.height),
    left: Math.round(element.hitSlop.left * viewport.width),
  };
}

export function calculateElementStyle(
  element: LayoutElement,
  viewport: ViewportDimensions,
  safeAreaPx?: { top: number; right: number; bottom: number; left: number }
): React.CSSProperties {
  // Convert normalized rect to pixels
  let pixelRect = normalizedToPixels(
    element.rect,
    viewport,
    safeAreaPx,
    element.useSafeArea
  );

  // Apply constraints (min/max/aspect)
  pixelRect = applyConstraints(pixelRect, element, viewport);

  // Apply anchor point adjustment
  pixelRect = applyAnchor(pixelRect, element.anchor);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${pixelRect.x}px`,
    top: `${pixelRect.y}px`,
    width: `${pixelRect.w}px`,
    height: `${pixelRect.h}px`,
  };

  if (element.zIndex !== undefined) {
    style.zIndex = element.zIndex;
  }

  if (element.visible === false) {
    style.display = 'none';
  }

  return style;
}

export function calculateElementRect(
  element: LayoutElement,
  viewport: ViewportDimensions,
  safeAreaPx?: { top: number; right: number; bottom: number; left: number }
): PixelRect {
  let pixelRect = normalizedToPixels(
    element.rect,
    viewport,
    safeAreaPx,
    element.useSafeArea
  );

  pixelRect = applyConstraints(pixelRect, element, viewport);
  pixelRect = applyAnchor(pixelRect, element.anchor);

  return pixelRect;
}
