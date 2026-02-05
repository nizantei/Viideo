/**
 * Typography System Types
 * Defines font families, sizes, weights, and text styling
 */

export interface FontFamily {
  primary: string;
  monospace: string;
}

export interface FontSize {
  xs: number;
  sm: number;
  base: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface FontWeight {
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
}

export interface LineHeight {
  tight: number;
  normal: number;
  relaxed: number;
}

export interface LetterSpacing {
  tight: string;
  normal: string;
  wide: string;
  wider: string;
}

export interface TypographyConfig {
  version: string;
  fontFamily: FontFamily;
  fontSize: FontSize;
  fontWeight: FontWeight;
  lineHeight: LineHeight;
  letterSpacing: LetterSpacing;
}
