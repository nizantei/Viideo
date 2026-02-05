/**
 * Animation System - Public API
 */

// Export types
export type {
  AnimationConfig,
  Transition,
  Transitions,
  Transforms,
  KeyframeDefinition,
} from './types';

// Export context and hooks
export {
  AnimationProvider,
  useAnimation,
  useTransition,
  useTransform,
} from './context';

// Export validator
export { validateAnimationConfig } from './validator';
