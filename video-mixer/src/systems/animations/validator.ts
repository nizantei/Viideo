/**
 * Animation configuration validation
 */

import type { AnimationConfig } from './types';

export class AnimationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnimationValidationError';
  }
}

export function validateAnimationConfig(config: AnimationConfig): void {
  if (!config || typeof config !== 'object') {
    throw new AnimationValidationError('Animation config must be an object');
  }

  if (!config.version || typeof config.version !== 'string') {
    throw new AnimationValidationError('Animation config version is required and must be a string');
  }

  // Validate transitions
  const transitionKeys: (keyof typeof config.transitions)[] = ['fast', 'normal', 'slow'];
  for (const key of transitionKeys) {
    const transition = config.transitions[key];
    if (!transition) {
      throw new AnimationValidationError(`transitions.${key} is required`);
    }
    if (typeof transition.duration !== 'number' || transition.duration < 0) {
      throw new AnimationValidationError(`transitions.${key}.duration must be a non-negative number`);
    }
    if (typeof transition.easing !== 'string') {
      throw new AnimationValidationError(`transitions.${key}.easing must be a string`);
    }
  }

  // Validate transforms
  if (!config.transforms || typeof config.transforms !== 'object') {
    throw new AnimationValidationError('transforms must be an object');
  }

  // Validate keyframes
  if (!config.keyframes || typeof config.keyframes !== 'object') {
    throw new AnimationValidationError('keyframes must be an object');
  }

  for (const [name, keyframe] of Object.entries(config.keyframes)) {
    // Skip comment fields (starting with underscore)
    if (name.startsWith('_')) continue;
    if (typeof keyframe.duration !== 'number' || keyframe.duration < 0) {
      throw new AnimationValidationError(`keyframe "${name}".duration must be a non-negative number`);
    }
    if (typeof keyframe.timing !== 'string') {
      throw new AnimationValidationError(`keyframe "${name}".timing must be a string`);
    }
    if (!keyframe.frames || typeof keyframe.frames !== 'object') {
      throw new AnimationValidationError(`keyframe "${name}".frames must be an object`);
    }
  }

  // Validate gestures
  if (!config.gestures || typeof config.gestures !== 'object') {
    throw new AnimationValidationError('gestures must be an object');
  }
  if (typeof config.gestures.longPressDelay !== 'number' || config.gestures.longPressDelay < 0) {
    throw new AnimationValidationError('gestures.longPressDelay must be a non-negative number');
  }
  if (typeof config.gestures.longPressThreshold !== 'number' || config.gestures.longPressThreshold < 0) {
    throw new AnimationValidationError('gestures.longPressThreshold must be a non-negative number');
  }
  if (typeof config.gestures.dampeningFactor !== 'number' || config.gestures.dampeningFactor <= 0) {
    throw new AnimationValidationError('gestures.dampeningFactor must be a positive number');
  }
}
