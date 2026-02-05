/**
 * Typography configuration validation
 */

import type { TypographyConfig } from './types';

export class TypographyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TypographyValidationError';
  }
}

export function validateTypographyConfig(config: TypographyConfig): void {
  if (!config || typeof config !== 'object') {
    throw new TypographyValidationError('Typography config must be an object');
  }

  if (!config.version || typeof config.version !== 'string') {
    throw new TypographyValidationError('Typography config version is required and must be a string');
  }

  // Validate font family
  if (!config.fontFamily || typeof config.fontFamily.primary !== 'string') {
    throw new TypographyValidationError('fontFamily.primary is required and must be a string');
  }
  if (typeof config.fontFamily.monospace !== 'string') {
    throw new TypographyValidationError('fontFamily.monospace is required and must be a string');
  }

  // Validate font sizes
  const sizeKeys: (keyof typeof config.fontSize)[] = ['xs', 'sm', 'base', 'md', 'lg', 'xl', 'xxl'];
  for (const key of sizeKeys) {
    if (typeof config.fontSize[key] !== 'number' || config.fontSize[key] <= 0) {
      throw new TypographyValidationError(`fontSize.${key} must be a positive number`);
    }
  }

  // Validate font weights
  const weightKeys: (keyof typeof config.fontWeight)[] = ['normal', 'medium', 'semibold', 'bold'];
  for (const key of weightKeys) {
    if (typeof config.fontWeight[key] !== 'number' || config.fontWeight[key] <= 0) {
      throw new TypographyValidationError(`fontWeight.${key} must be a positive number`);
    }
  }

  // Validate line heights
  const lineHeightKeys: (keyof typeof config.lineHeight)[] = ['tight', 'normal', 'relaxed'];
  for (const key of lineHeightKeys) {
    if (typeof config.lineHeight[key] !== 'number' || config.lineHeight[key] <= 0) {
      throw new TypographyValidationError(`lineHeight.${key} must be a positive number`);
    }
  }

  // Validate letter spacing
  const spacingKeys: (keyof typeof config.letterSpacing)[] = ['tight', 'normal', 'wide', 'wider'];
  for (const key of spacingKeys) {
    if (typeof config.letterSpacing[key] !== 'string') {
      throw new TypographyValidationError(`letterSpacing.${key} must be a string`);
    }
  }
}
