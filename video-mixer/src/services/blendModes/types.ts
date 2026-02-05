export enum BlendMode {
  NORMAL = 'normal',
  SCREEN = 'screen',
  ADD = 'add',
  MULTIPLY = 'multiply',
  OVERLAY = 'overlay',
  SOFT_LIGHT = 'softLight',
  DIFFERENCE = 'difference',
  EXCLUSION = 'exclusion',
  COLOR_DODGE = 'colorDodge',
  COLOR_BURN = 'colorBurn',
  HARD_MIX = 'hardMix',
}

export interface BlendModeMetadata {
  id: BlendMode;
  displayName: string;
  description: string;
  category: 'lighten' | 'darken' | 'contrast' | 'inversion' | 'component';
}
