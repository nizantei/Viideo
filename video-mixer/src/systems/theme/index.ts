/**
 * Theme System - Public API
 *
 * Provides config-driven theme system for colors, gradients, and effects
 */

// Export types
export type {
  ThemeConfig,
  ColorPalette,
  Gradient,
  GradientStop,
  BorderRadius,
  Blur,
  Shadow,
  Opacity,
  Effects,
  Borders,
} from './types';

// Export context and hooks
export {
  ThemeProvider,
  useTheme,
  useColor,
  useColors,
  useGradient,
  useBorderRadius,
  useBlur,
  useShadow,
  useOpacity,
  useBorder,
} from './context';

// Export validator (for advanced use cases)
export { validateThemeConfig } from './validator';
