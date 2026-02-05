import { useRef, useEffect, useCallback } from 'react';
import { WebGLMixer } from '../services/webgl/WebGLMixer';
import { MiniState } from '../types';

interface UseWebGLMixerOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  minis: [MiniState, MiniState, MiniState, MiniState];
  videoRefs: [
    React.RefObject<HTMLVideoElement | null>,
    React.RefObject<HTMLVideoElement | null>,
    React.RefObject<HTMLVideoElement | null>,
    React.RefObject<HTMLVideoElement | null>
  ];
  groupOpacities: {
    left: number;
    right: number;
  };
}

export function useWebGLMixer({
  canvasRef,
  minis,
  videoRefs,
  groupOpacities,
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
        for (let i = 0; i < 4; i++) {
          const video = videoRefs[i].current;
          if (video && video.readyState >= 2) {
            mixer.updateTexture(i, video);
          }
        }

        // Render composited frame
        mixer.render(minis, groupOpacities);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [minis, videoRefs, groupOpacities, frameInterval]);

  const clearMini = useCallback((miniIndex: number) => {
    mixerRef.current?.clearTexture(miniIndex);
  }, []);

  return { clearMini };
}
