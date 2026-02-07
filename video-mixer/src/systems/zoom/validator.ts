import type { ZoomConfig } from './types';

export class ZoomValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ZoomValidationError';
  }
}

export function validateZoomConfig(config: ZoomConfig): void {
  if (!config || typeof config !== 'object') {
    throw new ZoomValidationError('Zoom config must be an object');
  }

  for (const key of ['canvas', 'video'] as const) {
    const limits = config[key];
    if (!limits || typeof limits !== 'object') {
      throw new ZoomValidationError(`${key} must be an object`);
    }
    if (typeof limits.minZoom !== 'number' || limits.minZoom < 0) {
      throw new ZoomValidationError(`${key}.minZoom must be a non-negative number`);
    }
    if (typeof limits.maxZoom !== 'number' || limits.maxZoom < limits.minZoom) {
      throw new ZoomValidationError(`${key}.maxZoom must be >= minZoom`);
    }
    if (typeof limits.speed !== 'number' || limits.speed <= 0) {
      throw new ZoomValidationError(`${key}.speed must be a positive number`);
    }
  }
}
