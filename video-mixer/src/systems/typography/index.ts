/**
 * Typography System - Public API
 */

// Export types
export type {
  TypographyConfig,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  LetterSpacing,
} from './types';

// Export context and hooks
export {
  TypographyProvider,
  useTypography,
  useFont,
  useFontSize,
  useFontWeight,
  useLineHeight,
  useLetterSpacing,
} from './context';

// Export validator
export { validateTypographyConfig } from './validator';
