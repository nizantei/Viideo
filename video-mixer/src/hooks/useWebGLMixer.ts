import { useRef, useEffect, useCallback } from 'react';
import { WebGLMixer } from '../services/webgl/WebGLMixer';

interface UseWebGLMixerOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoA: HTMLVideoElement | null;
  videoB: HTMLVideoElement | null;
  blend: number;
  zoom: number;
  panX: number;
}

export function useWebGLMixer({
  canvasRef,
  videoA,
  videoB,
  blend,
  zoom,
  panX,
}: UseWebGLMixerOptions) {
  const mixerRef = useRef<WebGLMixer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastRenderRef = useRef<number>(0);
  const targetFPS = 60;
  const frameInterval = 1000 / targetFPS;

  // Initialize WebGL mixer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      mixerRef.current = new WebGLMixer(canvas);

      // Handle resize
      const handleResize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        mixerRef.current?.resize(canvas.width, canvas.height);
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        mixerRef.current?.dispose();
        mixerRef.current = null;
      };
    } catch (err) {
      console.error('WebGL initialization failed:', err);
    }
  }, [canvasRef]);

  // Render loop
  useEffect(() => {
    const mixer = mixerRef.current;
    if (!mixer) return;

    const render = (timestamp: number) => {
      const elapsed = timestamp - lastRenderRef.current;

      if (elapsed >= frameInterval) {
        lastRenderRef.current = timestamp - (elapsed % frameInterval);

        // Update textures from video elements
        if (videoA && videoA.readyState >= 2) {
          mixer.updateTextureA(videoA);
        }

        if (videoB && videoB.readyState >= 2) {
          mixer.updateTextureB(videoB);
        }

        // Render blended frame
        mixer.render(blend, zoom, panX);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoA, videoB, blend, zoom, panX, frameInterval]);

  const clearDeck = useCallback((deck: 'A' | 'B') => {
    if (deck === 'A') {
      mixerRef.current?.clearTextureA();
    } else {
      mixerRef.current?.clearTextureB();
    }
  }, []);

  return { clearDeck };
}
