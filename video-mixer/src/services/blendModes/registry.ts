import { BlendMode, BlendModeMetadata } from './types';

export const BLEND_MODE_REGISTRY: BlendModeMetadata[] = [
  {
    id: BlendMode.NORMAL,
    displayName: 'Normal',
    description: 'No blending applied',
    category: 'component',
  },
  {
    id: BlendMode.SCREEN,
    displayName: 'Screen',
    description: 'Lightens the image by inverting, multiplying, and inverting again',
    category: 'lighten',
  },
  {
    id: BlendMode.ADD,
    displayName: 'Add',
    description: 'Adds color values together',
    category: 'lighten',
  },
  {
    id: BlendMode.MULTIPLY,
    displayName: 'Multiply',
    description: 'Multiplies colors, resulting in darker image',
    category: 'darken',
  },
  {
    id: BlendMode.OVERLAY,
    displayName: 'Overlay',
    description: 'Combines multiply and screen based on base color',
    category: 'contrast',
  },
  {
    id: BlendMode.SOFT_LIGHT,
    displayName: 'Soft Light',
    description: 'Softer version of overlay',
    category: 'contrast',
  },
  {
    id: BlendMode.DIFFERENCE,
    displayName: 'Difference',
    description: 'Subtracts darker from lighter color',
    category: 'inversion',
  },
  {
    id: BlendMode.EXCLUSION,
    displayName: 'Exclusion',
    description: 'Similar to difference but with lower contrast',
    category: 'inversion',
  },
  {
    id: BlendMode.COLOR_DODGE,
    displayName: 'Color Dodge',
    description: 'Brightens the base color by decreasing contrast',
    category: 'lighten',
  },
  {
    id: BlendMode.COLOR_BURN,
    displayName: 'Color Burn',
    description: 'Darkens the base color by increasing contrast',
    category: 'darken',
  },
  {
    id: BlendMode.HARD_MIX,
    displayName: 'Hard Mix',
    description: 'Creates posterized result with limited colors',
    category: 'contrast',
  },
];

export function getBlendModeMetadata(mode: BlendMode): BlendModeMetadata {
  const metadata = BLEND_MODE_REGISTRY.find((m) => m.id === mode);
  if (!metadata) {
    throw new Error(`Unknown blend mode: ${mode}`);
  }
  return metadata;
}

export function getBlendModeIndex(mode: BlendMode): number {
  const index = Object.values(BlendMode).indexOf(mode);
  if (index === -1) {
    throw new Error(`Unknown blend mode: ${mode}`);
  }
  return index;
}
