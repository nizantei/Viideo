import { BlendMode } from './types';

// GLSL blend mode function implementations
export const BLEND_FUNCTIONS_GLSL = `
// Normal blend (no blending)
vec3 blendNormal(vec3 base, vec3 blend) {
  return blend;
}

// Screen blend
vec3 blendScreen(vec3 base, vec3 blend) {
  return 1.0 - (1.0 - base) * (1.0 - blend);
}

// Add blend
vec3 blendAdd(vec3 base, vec3 blend) {
  return min(base + blend, 1.0);
}

// Multiply blend
vec3 blendMultiply(vec3 base, vec3 blend) {
  return base * blend;
}

// Overlay blend
vec3 blendOverlay(vec3 base, vec3 blend) {
  vec3 result;
  result.r = base.r < 0.5 ? 2.0 * base.r * blend.r : 1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r);
  result.g = base.g < 0.5 ? 2.0 * base.g * blend.g : 1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g);
  result.b = base.b < 0.5 ? 2.0 * base.b * blend.b : 1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b);
  return result;
}

// Soft Light blend
vec3 blendSoftLight(vec3 base, vec3 blend) {
  vec3 result;
  result.r = blend.r < 0.5 ? 2.0 * base.r * blend.r + base.r * base.r * (1.0 - 2.0 * blend.r) : sqrt(base.r) * (2.0 * blend.r - 1.0) + 2.0 * base.r * (1.0 - blend.r);
  result.g = blend.g < 0.5 ? 2.0 * base.g * blend.g + base.g * base.g * (1.0 - 2.0 * blend.g) : sqrt(base.g) * (2.0 * blend.g - 1.0) + 2.0 * base.g * (1.0 - blend.g);
  result.b = blend.b < 0.5 ? 2.0 * base.b * blend.b + base.b * base.b * (1.0 - 2.0 * blend.b) : sqrt(base.b) * (2.0 * blend.b - 1.0) + 2.0 * base.b * (1.0 - blend.b);
  return result;
}

// Difference blend
vec3 blendDifference(vec3 base, vec3 blend) {
  return abs(base - blend);
}

// Exclusion blend
vec3 blendExclusion(vec3 base, vec3 blend) {
  return base + blend - 2.0 * base * blend;
}

// Color Dodge blend
vec3 blendColorDodge(vec3 base, vec3 blend) {
  vec3 result;
  result.r = blend.r >= 1.0 ? 1.0 : min(base.r / (1.0 - blend.r), 1.0);
  result.g = blend.g >= 1.0 ? 1.0 : min(base.g / (1.0 - blend.g), 1.0);
  result.b = blend.b >= 1.0 ? 1.0 : min(base.b / (1.0 - blend.b), 1.0);
  return result;
}

// Color Burn blend
vec3 blendColorBurn(vec3 base, vec3 blend) {
  vec3 result;
  result.r = blend.r <= 0.0 ? 0.0 : max(1.0 - (1.0 - base.r) / blend.r, 0.0);
  result.g = blend.g <= 0.0 ? 0.0 : max(1.0 - (1.0 - base.g) / blend.g, 0.0);
  result.b = blend.b <= 0.0 ? 0.0 : max(1.0 - (1.0 - base.b) / blend.b, 0.0);
  return result;
}

// Hard Mix blend
vec3 blendHardMix(vec3 base, vec3 blend) {
  vec3 result;
  result.r = (base.r + blend.r) < 1.0 ? 0.0 : 1.0;
  result.g = (base.g + blend.g) < 1.0 ? 0.0 : 1.0;
  result.b = (base.b + blend.b) < 1.0 ? 0.0 : 1.0;
  return result;
}

// Apply blend mode based on integer mode
vec3 applyBlendMode(vec3 base, vec3 blend, int mode) {
  if (mode == 0) return blendNormal(base, blend);
  if (mode == 1) return blendScreen(base, blend);
  if (mode == 2) return blendAdd(base, blend);
  if (mode == 3) return blendMultiply(base, blend);
  if (mode == 4) return blendOverlay(base, blend);
  if (mode == 5) return blendSoftLight(base, blend);
  if (mode == 6) return blendDifference(base, blend);
  if (mode == 7) return blendExclusion(base, blend);
  if (mode == 8) return blendColorDodge(base, blend);
  if (mode == 9) return blendColorBurn(base, blend);
  if (mode == 10) return blendHardMix(base, blend);
  return blend; // fallback to normal
}
`;

// Mapping from BlendMode enum to shader function integer
export const BLEND_MODE_TO_SHADER_INT: Record<BlendMode, number> = {
  [BlendMode.NORMAL]: 0,
  [BlendMode.SCREEN]: 1,
  [BlendMode.ADD]: 2,
  [BlendMode.MULTIPLY]: 3,
  [BlendMode.OVERLAY]: 4,
  [BlendMode.SOFT_LIGHT]: 5,
  [BlendMode.DIFFERENCE]: 6,
  [BlendMode.EXCLUSION]: 7,
  [BlendMode.COLOR_DODGE]: 8,
  [BlendMode.COLOR_BURN]: 9,
  [BlendMode.HARD_MIX]: 10,
};
