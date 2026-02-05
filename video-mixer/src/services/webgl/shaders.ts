export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  uniform vec2 u_resolution;

  varying vec2 v_texCoord;

  void main() {
    // Convert from pixel coordinates to clip space
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    v_texCoord = a_texCoord;
  }
`;

export const fragmentShaderSource = `
  precision mediump float;

  uniform sampler2D u_texture0;
  uniform sampler2D u_texture1;
  uniform sampler2D u_texture2;
  uniform sampler2D u_texture3;

  uniform bool u_hasTexture0;
  uniform bool u_hasTexture1;
  uniform bool u_hasTexture2;
  uniform bool u_hasTexture3;

  uniform vec2 u_videoSize0;
  uniform vec2 u_videoSize1;
  uniform vec2 u_videoSize2;
  uniform vec2 u_videoSize3;

  uniform float u_opacity0;
  uniform float u_opacity1;
  uniform float u_opacity2;
  uniform float u_opacity3;

  uniform int u_blendMode0;
  uniform int u_blendMode1;
  uniform int u_blendMode2;
  uniform int u_blendMode3;

  uniform float u_zoom0;
  uniform float u_zoom1;
  uniform float u_zoom2;
  uniform float u_zoom3;

  uniform float u_panX0;
  uniform float u_panX1;
  uniform float u_panX2;
  uniform float u_panX3;

  uniform float u_panY0;
  uniform float u_panY1;
  uniform float u_panY2;
  uniform float u_panY3;

  uniform vec2 u_resolution;

  varying vec2 v_texCoord;

  // Blend mode functions
  vec3 blendNormal(vec3 base, vec3 blend) {
    return blend;
  }

  vec3 blendScreen(vec3 base, vec3 blend) {
    return 1.0 - (1.0 - base) * (1.0 - blend);
  }

  vec3 blendAdd(vec3 base, vec3 blend) {
    return min(base + blend, 1.0);
  }

  vec3 blendMultiply(vec3 base, vec3 blend) {
    return base * blend;
  }

  vec3 blendOverlay(vec3 base, vec3 blend) {
    vec3 result;
    result.r = base.r < 0.5 ? 2.0 * base.r * blend.r : 1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r);
    result.g = base.g < 0.5 ? 2.0 * base.g * blend.g : 1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g);
    result.b = base.b < 0.5 ? 2.0 * base.b * blend.b : 1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b);
    return result;
  }

  vec3 blendSoftLight(vec3 base, vec3 blend) {
    vec3 result;
    result.r = blend.r < 0.5 ? 2.0 * base.r * blend.r + base.r * base.r * (1.0 - 2.0 * blend.r) : sqrt(base.r) * (2.0 * blend.r - 1.0) + 2.0 * base.r * (1.0 - blend.r);
    result.g = blend.g < 0.5 ? 2.0 * base.g * blend.g + base.g * base.g * (1.0 - 2.0 * blend.g) : sqrt(base.g) * (2.0 * blend.g - 1.0) + 2.0 * base.g * (1.0 - blend.g);
    result.b = blend.b < 0.5 ? 2.0 * base.b * blend.b + base.b * base.b * (1.0 - 2.0 * blend.b) : sqrt(base.b) * (2.0 * blend.b - 1.0) + 2.0 * base.b * (1.0 - blend.b);
    return result;
  }

  vec3 blendDifference(vec3 base, vec3 blend) {
    return abs(base - blend);
  }

  vec3 blendExclusion(vec3 base, vec3 blend) {
    return base + blend - 2.0 * base * blend;
  }

  vec3 blendColorDodge(vec3 base, vec3 blend) {
    vec3 result;
    result.r = blend.r >= 1.0 ? 1.0 : min(base.r / (1.0 - blend.r), 1.0);
    result.g = blend.g >= 1.0 ? 1.0 : min(base.g / (1.0 - blend.g), 1.0);
    result.b = blend.b >= 1.0 ? 1.0 : min(base.b / (1.0 - blend.b), 1.0);
    return result;
  }

  vec3 blendColorBurn(vec3 base, vec3 blend) {
    vec3 result;
    result.r = blend.r <= 0.0 ? 0.0 : max(1.0 - (1.0 - base.r) / blend.r, 0.0);
    result.g = blend.g <= 0.0 ? 0.0 : max(1.0 - (1.0 - base.g) / blend.g, 0.0);
    result.b = blend.b <= 0.0 ? 0.0 : max(1.0 - (1.0 - base.b) / blend.b, 0.0);
    return result;
  }

  vec3 blendHardMix(vec3 base, vec3 blend) {
    vec3 result;
    result.r = (base.r + blend.r) < 1.0 ? 0.0 : 1.0;
    result.g = (base.g + blend.g) < 1.0 ? 0.0 : 1.0;
    result.b = (base.b + blend.b) < 1.0 ? 0.0 : 1.0;
    return result;
  }

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
    return blend;
  }

  vec4 sampleWithFit(sampler2D tex, vec2 baseTexCoord, vec2 videoSize, float zoom, float panX, float panY) {
    // Apply zoom and pan to texture coordinates
    vec2 center = vec2(0.5, 0.5);
    vec2 texCoord = baseTexCoord;

    // Zoom from center
    texCoord = center + (texCoord - center) / zoom;

    // Apply pan (scaled by zoom)
    float maxPanX = (1.0 - 1.0 / zoom) / 2.0;
    float maxPanY = (1.0 - 1.0 / zoom) / 2.0;
    texCoord.x += panX * maxPanX;
    texCoord.y += panY * maxPanY;

    // Calculate aspect ratios
    float videoAspect = videoSize.x / videoSize.y;
    float screenAspect = u_resolution.x / u_resolution.y;

    vec2 scale;
    if (videoAspect > screenAspect) {
      scale = vec2(1.0, screenAspect / videoAspect);
    } else {
      scale = vec2(videoAspect / screenAspect, 1.0);
    }

    vec2 offset = (vec2(1.0) - scale) / 2.0;
    vec2 adjustedCoord = (texCoord - offset) / scale;

    if (adjustedCoord.x < 0.0 || adjustedCoord.x > 1.0 ||
        adjustedCoord.y < 0.0 || adjustedCoord.y > 1.0) {
      return vec4(0.0);
    }

    return texture2D(tex, adjustedCoord);
  }

  void main() {
    vec4 result = vec4(0.04, 0.04, 0.06, 1.0); // Dark background

    // Composite mini 0 (bottom layer)
    if (u_hasTexture0 && u_videoSize0.x > 0.0) {
      vec4 layerColor = sampleWithFit(u_texture0, v_texCoord, u_videoSize0, u_zoom0, u_panX0, u_panY0);
      vec3 blended = applyBlendMode(result.rgb, layerColor.rgb, u_blendMode0);
      result.rgb = mix(result.rgb, blended, u_opacity0 * layerColor.a);
    }

    // Composite mini 1
    if (u_hasTexture1 && u_videoSize1.x > 0.0) {
      vec4 layerColor = sampleWithFit(u_texture1, v_texCoord, u_videoSize1, u_zoom1, u_panX1, u_panY1);
      vec3 blended = applyBlendMode(result.rgb, layerColor.rgb, u_blendMode1);
      result.rgb = mix(result.rgb, blended, u_opacity1 * layerColor.a);
    }

    // Composite mini 2
    if (u_hasTexture2 && u_videoSize2.x > 0.0) {
      vec4 layerColor = sampleWithFit(u_texture2, v_texCoord, u_videoSize2, u_zoom2, u_panX2, u_panY2);
      vec3 blended = applyBlendMode(result.rgb, layerColor.rgb, u_blendMode2);
      result.rgb = mix(result.rgb, blended, u_opacity2 * layerColor.a);
    }

    // Composite mini 3 (top layer)
    if (u_hasTexture3 && u_videoSize3.x > 0.0) {
      vec4 layerColor = sampleWithFit(u_texture3, v_texCoord, u_videoSize3, u_zoom3, u_panX3, u_panY3);
      vec3 blended = applyBlendMode(result.rgb, layerColor.rgb, u_blendMode3);
      result.rgb = mix(result.rgb, blended, u_opacity3 * layerColor.a);
    }

    gl_FragColor = result;
  }
`;
