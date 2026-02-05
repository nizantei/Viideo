import { BlendMode } from '../services/blendModes';
import { CSSProperties } from 'react';

/**
 * Maps BlendMode enum values to CSS mix-blend-mode property values
 * Note: CSS mix-blend-mode has good support for most blend modes
 */
export function blendModeToCSSMixBlendMode(blendMode: BlendMode): CSSProperties['mixBlendMode'] {
  switch (blendMode) {
    case BlendMode.NORMAL:
      return 'normal';
    case BlendMode.SCREEN:
      return 'screen';
    case BlendMode.ADD:
      return 'lighten'; // CSS doesn't have 'add', 'lighten' is closest
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
      return 'hard-light'; // CSS doesn't have 'hard-mix', 'hard-light' is similar
    default:
      return 'normal';
  }
}
