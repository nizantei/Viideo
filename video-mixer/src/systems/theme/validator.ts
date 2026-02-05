/**
 * Theme configuration validation
 * Ensures theme config files are well-formed
 */

import type { ThemeConfig, ColorPalette, Gradient, Effects, Borders } from './types';

export class ThemeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThemeValidationError';
  }
}

function isValidColor(color: string): boolean {
  // Check for hex, rgb, rgba, hsl, hsla, or named colors
  return typeof color === 'string' && color.length > 0;
}

function validateColorPalette(colors: ColorPalette): void {
  const requiredColors: (keyof ColorPalette)[] = [
    'background',
    'backgroundVideo',
    'deckA',
    'deckB',
    'textPrimary',
    'textMuted',
    'textLabel',
    'borderActive',
    'borderInactive',
    'borderEdit',
    'surfaceBase',
    'surfaceHover',
    'overlayDark',
    'overlayBlack',
  ];

  for (const colorName of requiredColors) {
    if (!colors[colorName] || !isValidColor(colors[colorName])) {
      throw new ThemeValidationError(`Invalid or missing color: ${colorName}`);
    }
  }
}

function validateGradient(name: string, gradient: Gradient): void {
  if (!gradient.type || !['linear', 'radial'].includes(gradient.type)) {
    throw new ThemeValidationError(`Gradient "${name}": type must be "linear" or "radial"`);
  }

  if (gradient.type === 'linear' && gradient.angle !== undefined) {
    if (typeof gradient.angle !== 'number') {
      throw new ThemeValidationError(`Gradient "${name}": angle must be a number`);
    }
  }

  if (!Array.isArray(gradient.stops) || gradient.stops.length < 2) {
    throw new ThemeValidationError(`Gradient "${name}": must have at least 2 stops`);
  }

  for (let i = 0; i < gradient.stops.length; i++) {
    const stop = gradient.stops[i];
    if (!isValidColor(stop.color)) {
      throw new ThemeValidationError(`Gradient "${name}": stop ${i} has invalid color`);
    }
    if (typeof stop.position !== 'number' || stop.position < 0 || stop.position > 100) {
      throw new ThemeValidationError(`Gradient "${name}": stop ${i} position must be 0-100`);
    }
  }
}

function validateEffects(effects: Effects): void {
  // Validate border radius
  if (!effects.borderRadius) {
    throw new ThemeValidationError('effects.borderRadius is required');
  }
  const radiusKeys: (keyof Effects['borderRadius'])[] = ['small', 'medium', 'large', 'xlarge', 'round'];
  for (const key of radiusKeys) {
    const value = effects.borderRadius[key];
    if (value === undefined) {
      throw new ThemeValidationError(`effects.borderRadius.${key} is required`);
    }
    if (key === 'round') {
      if (typeof value !== 'string') {
        throw new ThemeValidationError(`effects.borderRadius.${key} must be a string`);
      }
    } else {
      if (typeof value !== 'number' || value < 0) {
        throw new ThemeValidationError(`effects.borderRadius.${key} must be a non-negative number`);
      }
    }
  }

  // Validate blur
  if (!effects.blur) {
    throw new ThemeValidationError('effects.blur is required');
  }
  const blurKeys: (keyof Effects['blur'])[] = ['small', 'medium'];
  for (const key of blurKeys) {
    if (typeof effects.blur[key] !== 'number' || effects.blur[key] < 0) {
      throw new ThemeValidationError(`effects.blur.${key} must be a non-negative number`);
    }
  }

  // Validate shadow
  if (!effects.shadow || typeof effects.shadow.button !== 'string') {
    throw new ThemeValidationError('effects.shadow.button must be a string');
  }

  // Validate opacity
  if (!effects.opacity) {
    throw new ThemeValidationError('effects.opacity is required');
  }
  const opacityKeys: (keyof Effects['opacity'])[] = ['inactive', 'active', 'muted', 'fill'];
  for (const key of opacityKeys) {
    const value = effects.opacity[key];
    if (typeof value !== 'number' || value < 0 || value > 1) {
      throw new ThemeValidationError(`effects.opacity.${key} must be between 0 and 1`);
    }
  }
}

function validateBorders(borders: Borders): void {
  const borderKeys: (keyof Borders)[] = ['thin', 'normal', 'thick'];
  for (const key of borderKeys) {
    if (typeof borders[key] !== 'number' || borders[key] < 0) {
      throw new ThemeValidationError(`borders.${key} must be a non-negative number`);
    }
  }
}

export function validateThemeConfig(config: ThemeConfig): void {
  if (!config || typeof config !== 'object') {
    throw new ThemeValidationError('Theme config must be an object');
  }

  if (!config.version || typeof config.version !== 'string') {
    throw new ThemeValidationError('Theme config version is required and must be a string');
  }

  validateColorPalette(config.colors);

  if (!config.gradients || typeof config.gradients !== 'object') {
    throw new ThemeValidationError('Theme config gradients must be an object');
  }

  for (const [name, gradient] of Object.entries(config.gradients)) {
    // Skip comment fields (starting with underscore)
    if (name.startsWith('_')) continue;
    validateGradient(name, gradient);
  }

  validateEffects(config.effects);
  validateBorders(config.borders);
}
