import { BlendMode } from '../services/blendModes';
import { CSSProperties } from 'react';

/**
 * Maps BlendMode enum values to CSS mix-blend-mode property values.
 * Some modes (Linear Burn, Subtract, Divide, Vivid Light, Pin Light) don't have
 * exact CSS equivalents — closest approximations are used.
 */
export function blendModeToCSSMixBlendMode(blendMode: BlendMode): CSSProperties['mixBlendMode'] {
  switch (blendMode) {
    case BlendMode.NORMAL:
      return 'normal';
    case BlendMode.SCREEN:
      return 'screen';
    case BlendMode.ADD:
      return 'lighten';
    case BlendMode.MULTIPLY:
      return 'multiply';
    case BlendMode.OVERLAY:
      return 'overlay';
    case BlendMode.SOFT_LIGHT:
      return 'soft-light';
    case BlendMode.DIFFERENCE:
      return 'difference';
    case BlendMode.EXCLUSION:
      return 'exclusion';
    case BlendMode.COLOR_DODGE:
      return 'color-dodge';
    case BlendMode.COLOR_BURN:
      return 'color-burn';
    case BlendMode.HARD_MIX:
      return 'hard-light';
    case BlendMode.LINEAR_BURN:
      return 'darken';
    case BlendMode.SUBTRACT:
      return 'exclusion';
    case BlendMode.LINEAR_DODGE:
      return 'lighten';
    case BlendMode.DIVIDE:
      return 'color-dodge';
    case BlendMode.VIVID_LIGHT:
      return 'hard-light';
    case BlendMode.PIN_LIGHT:
      return 'luminosity';
    default:
      return 'normal';
  }
}

/**
 * Maps BlendMode enum to config key name (used in blend-modes.json)
 */
const BLEND_MODE_TO_CONFIG_KEY: Record<string, string> = {
  [BlendMode.NORMAL]: 'NORMAL',
  [BlendMode.SCREEN]: 'SCREEN',
  [BlendMode.ADD]: 'ADD',
  [BlendMode.MULTIPLY]: 'MULTIPLY',
  [BlendMode.OVERLAY]: 'OVERLAY',
  [BlendMode.SOFT_LIGHT]: 'SOFT_LIGHT',
  [BlendMode.DIFFERENCE]: 'DIFFERENCE',
  [BlendMode.EXCLUSION]: 'EXCLUSION',
  [BlendMode.COLOR_DODGE]: 'COLOR_DODGE',
  [BlendMode.COLOR_BURN]: 'COLOR_BURN',
  [BlendMode.HARD_MIX]: 'HARD_MIX',
  [BlendMode.LINEAR_BURN]: 'LINEAR_BURN',
  [BlendMode.SUBTRACT]: 'SUBTRACT',
  [BlendMode.LINEAR_DODGE]: 'LINEAR_DODGE',
  [BlendMode.DIVIDE]: 'DIVIDE',
  [BlendMode.VIVID_LIGHT]: 'VIVID_LIGHT',
  [BlendMode.PIN_LIGHT]: 'PIN_LIGHT',
};

export function getBlendModeConfigKey(mode: BlendMode): string {
  return BLEND_MODE_TO_CONFIG_KEY[mode] || 'NORMAL';
}

/**
 * Returns true for blend modes that produce black/dark results when blending against a black backdrop.
 * Uses configurable list of mode names.
 */
export function isDarkSensitiveBlendMode(mode: BlendMode, darkSensitiveModes?: string[]): boolean {
  const configKey = getBlendModeConfigKey(mode);
  if (darkSensitiveModes) {
    return darkSensitiveModes.includes(configKey);
  }
  // Default fallback
  return (
    mode === BlendMode.MULTIPLY ||
    mode === BlendMode.COLOR_BURN ||
    mode === BlendMode.HARD_MIX ||
    mode === BlendMode.OVERLAY ||
    mode === BlendMode.SOFT_LIGHT ||
    mode === BlendMode.LINEAR_BURN ||
    mode === BlendMode.SUBTRACT
  );
}
