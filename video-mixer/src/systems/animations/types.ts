/**
 * Animation System Types
 * Defines transitions, transforms, and keyframe animations
 */

export interface Transition {
  duration: number;
  easing: string;
}

export interface Transitions {
  fast: Transition;
  normal: Transition;
  slow: Transition;
}

export interface Transforms {
  scaleDown: string;
  shiftUp: string;
}

export interface KeyframeDefinition {
  duration: number;
  timing: string;
  iterations: string | number;
  frames: Record<string, Record<string, string>>;
}

export interface GestureConfig {
  longPressDelay: number;
  longPressThreshold: number;
  dampeningFactor: number;
}

export interface AnimationConfig {
  version: string;
  transitions: Transitions;
  transforms: Transforms;
  keyframes: Record<string, KeyframeDefinition>;
  gestures: GestureConfig;
}
