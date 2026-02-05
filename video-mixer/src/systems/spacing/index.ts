/**
 * Spacing System - Public API
 */

// Export types
export type {
  SpacingConfig,
  SpacingScale,
  ComponentSpacing,
} from './types';

// Export context and hooks
export {
  SpacingProvider,
  useSpacing,
  useSpace,
} from './context';

// Export validator
export { validateSpacingConfig } from './validator';
