/**
 * Layout configuration validation
 * Ensures config files are well-formed and use valid values
 */

import type { LayoutConfig, LayoutElement, NormalizedRect, SafeAreaInsets, HitSlop } from './types';

export class LayoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LayoutValidationError';
  }
}

function isInRange(value: number, min: number = 0, max: number = 1): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}

function validateNormalizedRect(rect: NormalizedRect, elementId: string): void {
  if (!rect || typeof rect !== 'object') {
    throw new LayoutValidationError(`Element "${elementId}": rect is required and must be an object`);
  }

  const { x, y, w, h } = rect;

  if (!isInRange(x)) {
    throw new LayoutValidationError(`Element "${elementId}": rect.x must be between 0 and 1, got ${x}`);
  }
  if (!isInRange(y)) {
    throw new LayoutValidationError(`Element "${elementId}": rect.y must be between 0 and 1, got ${y}`);
  }
  if (!isInRange(w)) {
    throw new LayoutValidationError(`Element "${elementId}": rect.w must be between 0 and 1, got ${w}`);
  }
  if (!isInRange(h)) {
    throw new LayoutValidationError(`Element "${elementId}": rect.h must be between 0 and 1, got ${h}`);
  }

  // Note: We don't check if x+w or y+h exceed 1.0 because:
  // - Anchor points mean elements can extend beyond their x,y position
  // - CSS naturally clips elements that go offscreen
  // - This gives you freedom to position elements anywhere
}

function validateSafeAreaInsets(insets: SafeAreaInsets): void {
  if (!insets || typeof insets !== 'object') {
    throw new LayoutValidationError('safeArea is required and must be an object');
  }

  const { top, right, bottom, left } = insets;

  if (!isInRange(top)) {
    throw new LayoutValidationError(`safeArea.top must be between 0 and 1, got ${top}`);
  }
  if (!isInRange(right)) {
    throw new LayoutValidationError(`safeArea.right must be between 0 and 1, got ${right}`);
  }
  if (!isInRange(bottom)) {
    throw new LayoutValidationError(`safeArea.bottom must be between 0 and 1, got ${bottom}`);
  }
  if (!isInRange(left)) {
    throw new LayoutValidationError(`safeArea.left must be between 0 and 1, got ${left}`);
  }
}

function validateHitSlop(hitSlop: HitSlop, elementId: string): void {
  const { top, right, bottom, left } = hitSlop;

  if (!isInRange(top)) {
    throw new LayoutValidationError(`Element "${elementId}": hitSlop.top must be between 0 and 1, got ${top}`);
  }
  if (!isInRange(right)) {
    throw new LayoutValidationError(`Element "${elementId}": hitSlop.right must be between 0 and 1, got ${right}`);
  }
  if (!isInRange(bottom)) {
    throw new LayoutValidationError(`Element "${elementId}": hitSlop.bottom must be between 0 and 1, got ${bottom}`);
  }
  if (!isInRange(left)) {
    throw new LayoutValidationError(`Element "${elementId}": hitSlop.left must be between 0 and 1, got ${left}`);
  }
}

function validateElement(element: LayoutElement): void {
  if (!element.id || typeof element.id !== 'string') {
    throw new LayoutValidationError('Element id is required and must be a string');
  }

  validateNormalizedRect(element.rect, element.id);

  if (element.zIndex !== undefined && typeof element.zIndex !== 'number') {
    throw new LayoutValidationError(`Element "${element.id}": zIndex must be a number`);
  }

  if (element.hitSlop !== undefined) {
    validateHitSlop(element.hitSlop, element.id);
  }

  if (element.minSize) {
    if (element.minSize.w !== undefined && !isInRange(element.minSize.w)) {
      throw new LayoutValidationError(`Element "${element.id}": minSize.w must be between 0 and 1`);
    }
    if (element.minSize.h !== undefined && !isInRange(element.minSize.h)) {
      throw new LayoutValidationError(`Element "${element.id}": minSize.h must be between 0 and 1`);
    }
  }

  if (element.maxSize) {
    if (element.maxSize.w !== undefined && !isInRange(element.maxSize.w)) {
      throw new LayoutValidationError(`Element "${element.id}": maxSize.w must be between 0 and 1`);
    }
    if (element.maxSize.h !== undefined && !isInRange(element.maxSize.h)) {
      throw new LayoutValidationError(`Element "${element.id}": maxSize.h must be between 0 and 1`);
    }
  }

  if (element.aspectRatio !== undefined) {
    if (typeof element.aspectRatio !== 'number' || element.aspectRatio <= 0) {
      throw new LayoutValidationError(`Element "${element.id}": aspectRatio must be a positive number`);
    }
  }
}

export function validateLayoutConfig(config: LayoutConfig): void {
  if (!config || typeof config !== 'object') {
    throw new LayoutValidationError('Layout config must be an object');
  }

  if (!config.version || typeof config.version !== 'string') {
    throw new LayoutValidationError('Layout config version is required and must be a string');
  }

  validateSafeAreaInsets(config.safeArea);

  if (!Array.isArray(config.elements)) {
    throw new LayoutValidationError('Layout config elements must be an array');
  }

  const elementIds = new Set<string>();
  for (const element of config.elements) {
    validateElement(element);

    if (elementIds.has(element.id)) {
      throw new LayoutValidationError(`Duplicate element id: "${element.id}"`);
    }
    elementIds.add(element.id);
  }
}
