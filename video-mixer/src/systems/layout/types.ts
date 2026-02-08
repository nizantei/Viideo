/**
 * Layout system type definitions
 * All coordinates use normalized 0..1 range relative to viewport
 */

export interface NormalizedRect {
  x: number;  // 0..1 horizontal position
  y: number;  // 0..1 vertical position
  w: number;  // 0..1 width
  h: number;  // 0..1 height
}

export interface PixelRect {
  x: number;  // pixels from left
  y: number;  // pixels from top
  w: number;  // width in pixels
  h: number;  // height in pixels
}

export interface SafeAreaInsets {
  top: number;     // 0..1 normalized
  right: number;   // 0..1 normalized
  bottom: number;  // 0..1 normalized
  left: number;    // 0..1 normalized
}

export interface HitSlop {
  top: number;     // 0..1 normalized
  right: number;   // 0..1 normalized
  bottom: number;  // 0..1 normalized
  left: number;    // 0..1 normalized
}

export type AnchorPoint =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface LayoutElement {
  id: string;
  rect: NormalizedRect;
  panelRect?: NormalizedRect;  // alternate position when side panels are open
  zIndex?: number;
  useSafeArea?: boolean;
  anchor?: AnchorPoint;
  hitSlop?: HitSlop;
  minSize?: { w?: number; h?: number };  // normalized
  maxSize?: { w?: number; h?: number };  // normalized
  aspectRatio?: number;  // w/h ratio
  visible?: boolean;
}

export interface LayoutConfig {
  version: string;
  safeArea: SafeAreaInsets;
  elements: LayoutElement[];
}

export interface ViewportDimensions {
  width: number;   // pixels
  height: number;  // pixels
}
