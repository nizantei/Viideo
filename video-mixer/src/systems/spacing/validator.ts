/**
 * Spacing configuration validation
 */

import type { SpacingConfig } from './types';

export class SpacingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SpacingValidationError';
  }
}

export function validateSpacingConfig(config: SpacingConfig): void {
  if (!config || typeof config !== 'object') {
    throw new SpacingValidationError('Spacing config must be an object');
  }

  if (!config.version || typeof config.version !== 'string') {
    throw new SpacingValidationError('Spacing config version is required and must be a string');
  }

  // Validate scale
  const scaleKeys: (keyof typeof config.scale)[] = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12];
  for (const key of scaleKeys) {
    if (typeof config.scale[key] !== 'number' || config.scale[key] < 0) {
      throw new SpacingValidationError(`scale.${key} must be a non-negative number`);
    }
  }

  // Validate components
  if (!config.components || typeof config.components !== 'object') {
    throw new SpacingValidationError('components must be an object');
  }
}
