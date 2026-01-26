export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  uniform vec2 u_resolution;
  uniform float u_zoom;
  uniform float u_panX;

  varying vec2 v_texCoord;

  void main() {
    // Convert from pixel coordinates to clip space
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    // Apply zoom and pan to texture coordinates
    vec2 center = vec2(0.5, 0.5);
    vec2 texCoord = a_texCoord;

    // Zoom from center
    texCoord = center + (texCoord - center) / u_zoom;

    // Apply horizontal pan (scaled by zoom)
    float maxPan = (1.0 - 1.0 / u_zoom) / 2.0;
    texCoord.x += u_panX * maxPan;

    v_texCoord = texCoord;
  }
`;

export const fragmentShaderSource = `
  precision mediump float;

  uniform sampler2D u_textureA;
  uniform sampler2D u_textureB;
  uniform float u_blend;
  uniform bool u_hasTextureA;
  uniform bool u_hasTextureB;
  uniform vec2 u_resolution;
  uniform vec2 u_videoSizeA;
  uniform vec2 u_videoSizeB;

  varying vec2 v_texCoord;

  vec4 sampleWithFit(sampler2D tex, vec2 texCoord, vec2 videoSize, vec2 resolution) {
    // Calculate aspect ratios
    float videoAspect = videoSize.x / videoSize.y;
    float screenAspect = resolution.x / resolution.y;

    vec2 scale;
    if (videoAspect > screenAspect) {
      // Video is wider - fit to width, letterbox top/bottom
      scale = vec2(1.0, screenAspect / videoAspect);
    } else {
      // Video is taller - fit to height, pillarbox left/right
      scale = vec2(videoAspect / screenAspect, 1.0);
    }

    // Center the video
    vec2 offset = (vec2(1.0) - scale) / 2.0;
    vec2 adjustedCoord = (texCoord - offset) / scale;

    // Check if outside video bounds
    if (adjustedCoord.x < 0.0 || adjustedCoord.x > 1.0 ||
        adjustedCoord.y < 0.0 || adjustedCoord.y > 1.0) {
      return vec4(0.04, 0.04, 0.06, 1.0); // Dark background
    }

    return texture2D(tex, adjustedCoord);
  }

  void main() {
    vec4 colorA = vec4(0.04, 0.04, 0.06, 1.0);
    vec4 colorB = vec4(0.04, 0.04, 0.06, 1.0);

    // Sample textures with fit scaling
    if (u_hasTextureA && u_videoSizeA.x > 0.0) {
      colorA = sampleWithFit(u_textureA, v_texCoord, u_videoSizeA, u_resolution);
    }

    if (u_hasTextureB && u_videoSizeB.x > 0.0) {
      colorB = sampleWithFit(u_textureB, v_texCoord, u_videoSizeB, u_resolution);
    }

    // Handle edge cases for single video
    if (!u_hasTextureA && !u_hasTextureB) {
      gl_FragColor = vec4(0.04, 0.04, 0.06, 1.0);
      return;
    }

    if (!u_hasTextureA) {
      gl_FragColor = colorB;
      return;
    }

    if (!u_hasTextureB) {
      gl_FragColor = colorA;
      return;
    }

    // Linear crossfade blend
    gl_FragColor = mix(colorA, colorB, u_blend);
  }
`;
