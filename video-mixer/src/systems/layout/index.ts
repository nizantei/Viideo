/**
 * Layout System - Public API
 *
 * Provides config-driven layout system with viewport-relative positioning
 */

// Export types
export type {
  LayoutConfig,
  LayoutElement,
  ViewportDimensions,
  SafeAreaInsets,
  PixelRect,
  NormalizedRect,
  AnchorPoint,
  HitSlop,
} from './types';

// Export context and hooks
export { LayoutProvider, useLayout, useLayoutElement } from './context';

// Export validator (for advanced use cases)
export { validateLayoutConfig } from './validator';
