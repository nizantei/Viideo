import { useRef, useEffect } from 'react';
import { MiniState, MiniIndex } from '../types';
import { useMixer } from '../context/MixerContext';
import { calculateFinalOpacity } from '../utils/opacity';
import { buildTransformString, calculateSwingTranslateX } from '../utils/transforms';
import Hls from 'hls.js';

interface MiniVideoProps {
  miniIndex: MiniIndex;
  miniState: MiniState;
  groupOpacity: number;
  videoUrl?: string;
}

export function MiniVideo({ miniIndex, miniState, groupOpacity, videoUrl }: MiniVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { dispatch } = useMixer();

  // Load HLS video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const handleCanPlay = () => {
      dispatch({ type: 'SET_MINI_LOADING', miniIndex, isLoading: false });
      if (miniState.isPlaying) {
        video.play().catch(console.error);
      }
    };

    const handleError = () => {
      console.error('Video error for mini', miniIndex);
      dispatch({ type: 'SET_MINI_LOADING', miniIndex, isLoading: false });
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Check for native HLS support
    const canPlayHLS = video.canPlayType('application/vnd.apple.mpegurl');

    if (canPlayHLS) {
      video.src = videoUrl;
      video.load();
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
        }
      });

      hlsRef.current = hls;
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, miniIndex, dispatch]);

  // Handle play/pause
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (miniState.isPlaying) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    }
  }, [miniState.isPlaying]);

  const finalOpacity = calculateFinalOpacity(miniState, { opacity: groupOpacity });

  const video = videoRef.current;
  const swingTranslateX = containerRef.current && video
    ? calculateSwingTranslateX(
        miniState.swinging,
        video.videoWidth,
        containerRef.current.clientWidth,
        miniState.zoom
      )
    : 0;

  const transform = buildTransformString(
    miniState.zoom,
    miniState.panX,
    miniState.panY,
    swingTranslateX
  );

  const zIndex = miniIndex + 1;

  return (
    <div
      ref={containerRef}
      className="miniVideo"
      data-mini-index={miniIndex}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        opacity: finalOpacity,
        zIndex,
        overflow: 'hidden',
        pointerEvents: finalOpacity > 0.01 ? 'auto' : 'none',
      }}
    >
      {videoUrl && (
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transform,
            willChange: 'transform, opacity',
          }}
          muted
          playsInline
          loop
        />
      )}
    </div>
  );
}
