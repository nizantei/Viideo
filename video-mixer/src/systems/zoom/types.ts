export interface ZoomLimits {
  minZoom: number;
  maxZoom: number;
  speed: number;
}

export interface ZoomConfig {
  canvas: ZoomLimits;
  video: ZoomLimits;
}
