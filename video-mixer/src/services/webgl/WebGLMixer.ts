import { vertexShaderSource, fragmentShaderSource } from './shaders';
import { MiniState } from '../../types';
import { BLEND_MODE_TO_SHADER_INT } from '../blendModes';

export class WebGLMixer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private textures: (WebGLTexture | null)[] = [null, null, null, null];
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;

  // Uniform locations
  private u_resolution: WebGLUniformLocation | null = null;
  private u_texture: (WebGLUniformLocation | null)[] = [];
  private u_hasTexture: (WebGLUniformLocation | null)[] = [];
  private u_videoSize: (WebGLUniformLocation | null)[] = [];
  private u_opacity: (WebGLUniformLocation | null)[] = [];
  private u_blendMode: (WebGLUniformLocation | null)[] = [];
  private u_zoom: (WebGLUniformLocation | null)[] = [];
  private u_panX: (WebGLUniformLocation | null)[] = [];
  private u_panY: (WebGLUniformLocation | null)[] = [];

  // Attribute locations
  private a_position: number = -1;
  private a_texCoord: number = -1;

  private hasTexture = [false, false, false, false];
  private videoSizes = [
    { width: 0, height: 0 },
    { width: 0, height: 0 },
    { width: 0, height: 0 },
    { width: 0, height: 0 },
  ];

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    this.gl = gl;
    this.init();
  }

  private init() {
    const { gl } = this;

    // Create shader program
    const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shaders');
    }

    this.program = this.createProgram(vertexShader, fragmentShader);

    if (!this.program) {
      throw new Error('Failed to create program');
    }

    gl.useProgram(this.program);

    // Get attribute locations
    this.a_position = gl.getAttribLocation(this.program, 'a_position');
    this.a_texCoord = gl.getAttribLocation(this.program, 'a_texCoord');

    // Get uniform locations
    this.u_resolution = gl.getUniformLocation(this.program, 'u_resolution');

    for (let i = 0; i < 4; i++) {
      this.u_texture[i] = gl.getUniformLocation(this.program, `u_texture${i}`);
      this.u_hasTexture[i] = gl.getUniformLocation(this.program, `u_hasTexture${i}`);
      this.u_videoSize[i] = gl.getUniformLocation(this.program, `u_videoSize${i}`);
      this.u_opacity[i] = gl.getUniformLocation(this.program, `u_opacity${i}`);
      this.u_blendMode[i] = gl.getUniformLocation(this.program, `u_blendMode${i}`);
      this.u_zoom[i] = gl.getUniformLocation(this.program, `u_zoom${i}`);
      this.u_panX[i] = gl.getUniformLocation(this.program, `u_panX${i}`);
      this.u_panY[i] = gl.getUniformLocation(this.program, `u_panY${i}`);
    }

    // Create buffers
    this.positionBuffer = gl.createBuffer();
    this.texCoordBuffer = gl.createBuffer();

    // Create textures
    for (let i = 0; i < 4; i++) {
      this.textures[i] = this.createTexture();
      gl.uniform1i(this.u_texture[i], i);
    }

    // Set up geometry (fullscreen quad)
    this.setupGeometry();
  }

  private createShader(type: number, source: string): WebGLShader | null {
    const { gl } = this;
    const shader = gl.createShader(type);

    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
    const { gl } = this;
    const program = gl.createProgram();

    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  private createTexture(): WebGLTexture | null {
    const { gl } = this;
    const texture = gl.createTexture();

    if (!texture) return null;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    return texture;
  }

  private setupGeometry() {
    const { gl } = this;
    const width = gl.canvas.width;
    const height = gl.canvas.height;

    // Position buffer (fullscreen quad)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    const positions = new Float32Array([
      0, 0,
      width, 0,
      0, height,
      0, height,
      width, 0,
      width, height,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Texture coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    const texCoords = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  }

  resize(width: number, height: number) {
    const { gl } = this;
    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.viewport(0, 0, width, height);
    this.setupGeometry();
  }

  updateTexture(miniIndex: number, video: HTMLVideoElement) {
    if (miniIndex < 0 || miniIndex > 3) return;

    const texture = this.textures[miniIndex];
    if (!texture || video.readyState < 2) return;

    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0 + miniIndex);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    this.hasTexture[miniIndex] = true;
    this.videoSizes[miniIndex] = { width: video.videoWidth, height: video.videoHeight };
  }

  render(
    minis: [MiniState, MiniState, MiniState, MiniState],
    groupOpacities: { left: number; right: number }
  ) {
    const { gl } = this;

    if (!this.program) return;

    gl.useProgram(this.program);

    // Set resolution uniform
    gl.uniform2f(this.u_resolution, gl.canvas.width, gl.canvas.height);

    // Set uniforms for each mini
    for (let i = 0; i < 4; i++) {
      const mini = minis[i];
      const groupOpacity = i < 2 ? groupOpacities.left : groupOpacities.right;
      const effectiveOpacity = mini.opacity * groupOpacity;
      const blendModeInt = BLEND_MODE_TO_SHADER_INT[mini.blendMode];

      gl.uniform1i(this.u_hasTexture[i], this.hasTexture[i] ? 1 : 0);
      gl.uniform2f(this.u_videoSize[i], this.videoSizes[i].width, this.videoSizes[i].height);
      gl.uniform1f(this.u_opacity[i], effectiveOpacity);
      gl.uniform1i(this.u_blendMode[i], blendModeInt);
      gl.uniform1f(this.u_zoom[i], mini.zoom);
      gl.uniform1f(this.u_panX[i], mini.panX);
      gl.uniform1f(this.u_panY[i], mini.panY);
    }

    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.enableVertexAttribArray(this.a_position);
    gl.vertexAttribPointer(this.a_position, 2, gl.FLOAT, false, 0, 0);

    // Bind texture coordinate buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
    gl.enableVertexAttribArray(this.a_texCoord);
    gl.vertexAttribPointer(this.a_texCoord, 2, gl.FLOAT, false, 0, 0);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  clearTexture(miniIndex: number) {
    if (miniIndex < 0 || miniIndex > 3) return;

    this.hasTexture[miniIndex] = false;
    this.videoSizes[miniIndex] = { width: 0, height: 0 };
  }

  dispose() {
    const { gl } = this;

    for (const texture of this.textures) {
      if (texture) gl.deleteTexture(texture);
    }

    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
    if (this.texCoordBuffer) gl.deleteBuffer(this.texCoordBuffer);
    if (this.program) gl.deleteProgram(this.program);
  }
}
