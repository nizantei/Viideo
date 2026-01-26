import { vertexShaderSource, fragmentShaderSource } from './shaders';

export class WebGLMixer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram | null = null;
  private textureA: WebGLTexture | null = null;
  private textureB: WebGLTexture | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private texCoordBuffer: WebGLBuffer | null = null;

  // Uniform locations
  private u_resolution: WebGLUniformLocation | null = null;
  private u_blend: WebGLUniformLocation | null = null;
  private u_zoom: WebGLUniformLocation | null = null;
  private u_panX: WebGLUniformLocation | null = null;
  private u_textureA: WebGLUniformLocation | null = null;
  private u_textureB: WebGLUniformLocation | null = null;
  private u_hasTextureA: WebGLUniformLocation | null = null;
  private u_hasTextureB: WebGLUniformLocation | null = null;
  private u_videoSizeA: WebGLUniformLocation | null = null;
  private u_videoSizeB: WebGLUniformLocation | null = null;

  // Attribute locations
  private a_position: number = -1;
  private a_texCoord: number = -1;

  private hasTextureA = false;
  private hasTextureB = false;
  private videoSizeA = { width: 0, height: 0 };
  private videoSizeB = { width: 0, height: 0 };

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
    this.u_blend = gl.getUniformLocation(this.program, 'u_blend');
    this.u_zoom = gl.getUniformLocation(this.program, 'u_zoom');
    this.u_panX = gl.getUniformLocation(this.program, 'u_panX');
    this.u_textureA = gl.getUniformLocation(this.program, 'u_textureA');
    this.u_textureB = gl.getUniformLocation(this.program, 'u_textureB');
    this.u_hasTextureA = gl.getUniformLocation(this.program, 'u_hasTextureA');
    this.u_hasTextureB = gl.getUniformLocation(this.program, 'u_hasTextureB');
    this.u_videoSizeA = gl.getUniformLocation(this.program, 'u_videoSizeA');
    this.u_videoSizeB = gl.getUniformLocation(this.program, 'u_videoSizeB');

    // Create buffers
    this.positionBuffer = gl.createBuffer();
    this.texCoordBuffer = gl.createBuffer();

    // Create textures
    this.textureA = this.createTexture();
    this.textureB = this.createTexture();

    // Set up texture units
    gl.uniform1i(this.u_textureA, 0);
    gl.uniform1i(this.u_textureB, 1);

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

  updateTextureA(video: HTMLVideoElement) {
    this.updateTexture(this.textureA, video, 0);
    this.hasTextureA = true;
    this.videoSizeA = { width: video.videoWidth, height: video.videoHeight };
  }

  updateTextureB(video: HTMLVideoElement) {
    this.updateTexture(this.textureB, video, 1);
    this.hasTextureB = true;
    this.videoSizeB = { width: video.videoWidth, height: video.videoHeight };
  }

  private updateTexture(texture: WebGLTexture | null, video: HTMLVideoElement, unit: number) {
    if (!texture || video.readyState < 2) return;

    const { gl } = this;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  }

  render(blend: number, zoom: number, panX: number) {
    const { gl } = this;

    if (!this.program) return;

    gl.useProgram(this.program);

    // Set uniforms
    gl.uniform2f(this.u_resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(this.u_blend, blend);
    gl.uniform1f(this.u_zoom, zoom);
    gl.uniform1f(this.u_panX, panX);
    gl.uniform1i(this.u_hasTextureA, this.hasTextureA ? 1 : 0);
    gl.uniform1i(this.u_hasTextureB, this.hasTextureB ? 1 : 0);
    gl.uniform2f(this.u_videoSizeA, this.videoSizeA.width, this.videoSizeA.height);
    gl.uniform2f(this.u_videoSizeB, this.videoSizeB.width, this.videoSizeB.height);

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

  clearTextureA() {
    this.hasTextureA = false;
    this.videoSizeA = { width: 0, height: 0 };
  }

  clearTextureB() {
    this.hasTextureB = false;
    this.videoSizeB = { width: 0, height: 0 };
  }

  dispose() {
    const { gl } = this;

    if (this.textureA) gl.deleteTexture(this.textureA);
    if (this.textureB) gl.deleteTexture(this.textureB);
    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
    if (this.texCoordBuffer) gl.deleteBuffer(this.texCoordBuffer);
    if (this.program) gl.deleteProgram(this.program);
  }
}
