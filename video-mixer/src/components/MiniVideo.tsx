import { useRef, useEffect } from 'react';
import { MiniState, MiniIndex } from '../types';
import { useMixer } from '../context/MixerContext';
import { calculateFinalOpacity } from '../utils/opacity';
import { buildTransformString, calculateSwingTranslateX } from '../utils/transforms';
import { blendModeToCSSMixBlendMode } from '../utils/blendModeMapping';
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
    video.addEventListener('loadeddata', handleCanPlay); // Alternative event for HLS

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
          console.error('HLS fatal error for mini', miniIndex, data);
          dispatch({ type: 'SET_MINI_LOADING', miniIndex, isLoading: false });
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error - trying to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error - trying to recover');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error - cannot recover');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', handleCanPlay);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, miniIndex, dispatch, miniState.isPlaying]);

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
  const mixBlendMode = blendModeToCSSMixBlendMode(miniState.blendMode);

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
        mixBlendMode,
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
