/**
 * Spacing System Types
 * Defines padding, margins, and gaps using a consistent scale
 */

export interface SpacingScale {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  8: number;
  10: number;
  12: number;
}

export interface ComponentSpacing {
  padding?: number | { x?: number; y?: number };
}

export interface SpacingConfig {
  version: string;
  scale: SpacingScale;
  components: Record<string, ComponentSpacing>;
}
