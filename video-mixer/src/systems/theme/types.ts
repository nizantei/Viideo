/**
 * Theme System Types
 * Defines color palette, gradients, visual effects, and borders
 */

export interface ColorPalette {
  background: string;
  backgroundVideo: string;
  deckA: string;
  deckB: string;
  textPrimary: string;
  textMuted: string;
  textLabel: string;
  borderActive: string;
  borderInactive: string;
  borderEdit: string;
  surfaceBase: string;
  surfaceHover: string;
  overlayDark: string;
  overlayBlack: string;
}

export interface GradientStop {
  color: string;
  position: number;
}

export interface Gradient {
  type: 'linear' | 'radial';
  angle?: number;
  stops: GradientStop[];
}

export interface BorderRadius {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
  round: string;
}

export interface Blur {
  small: number;
  medium: number;
}

export interface Shadow {
  button: string;
}

export interface Opacity {
  inactive: number;
  active: number;
  muted: number;
  fill: number;
}

export interface Effects {
  borderRadius: BorderRadius;
  blur: Blur;
  shadow: Shadow;
  opacity: Opacity;
}

export interface Borders {
  thin: number;
  normal: number;
  thick: number;
}

export interface ThemeConfig {
  version: string;
  colors: ColorPalette;
  gradients: Record<string, Gradient>;
  effects: Effects;
  borders: Borders;
}
