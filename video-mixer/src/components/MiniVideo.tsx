import { useRef, useEffect, useCallback } from 'react';
import { MiniState, MiniIndex } from '../types';
import { useMixer } from '../context/MixerContext';
import { useBlendConfig } from '../systems/blendConfig';
import { calculateFinalOpacity } from '../utils/opacity';
import { buildTransformString, swingPositionToObjectPosition } from '../utils/transforms';
import { blendModeToCSSMixBlendMode, getBlendModeConfigKey } from '../utils/blendModeMapping';
import { BlendMode } from '../services/blendModes';
import { useGestures } from '../hooks/useGestures';
import { CachingLoader } from '../services/hls/CachingLoader';
import Hls from 'hls.js';

interface MiniVideoProps {
  miniIndex: MiniIndex;
  miniState: MiniState;
  groupOpacity: number;
  videoUrl?: string;
  belowAlpha: number;
}

export function MiniVideo({ miniIndex, miniState, groupOpacity, videoUrl, belowAlpha }: MiniVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const rafRef = useRef<number>(0);
  const { state, dispatch } = useMixer();
  const blendConfig = useBlendConfig();
  const { bind: gestureBind } = useGestures(miniIndex, containerRef);
  const isEditTarget = state.editMode.active && state.editMode.targetMini === miniIndex;

  // --- Blend config calculations ---
  const protection = blendConfig.protection;
  const modeKey = getBlendModeConfigKey(miniState.blendMode);
  const modeIntensity = blendConfig.modes[modeKey]?.intensity ?? 1.0;
  const isBlended = miniState.blendMode !== BlendMode.NORMAL;
  const useProtection = protection.enabled && isBlended;

  let blendStrength = 1.0;
  if (useProtection) {
    blendStrength = belowAlpha;
  }

  const effectiveBlend = Math.min(1.0, blendStrength * modeIntensity);
  const needsNormalBacking = useProtection && effectiveBlend < 1;

  // --- HLS video loading ---
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
    video.addEventListener('loadeddata', handleCanPlay);

    const canPlayHLS = video.canPlayType('application/vnd.apple.mpegurl');

    if (canPlayHLS) {
      video.src = videoUrl;
      video.load();
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 600,
        maxMaxBufferLength: 600,
        fLoader: CachingLoader as any,
        abrEwmaDefaultEstimate: 100_000_000,
        startLevel: -1,
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const highestLevel = data.levels.length - 1;
        hls.currentLevel = highestLevel;
        hls.nextLevel = highestLevel;
        hls.loadLevel = highestLevel;
        hls.nextAutoLevel = highestLevel;
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error for mini', miniIndex, data);
          dispatch({ type: 'SET_MINI_LOADING', miniIndex, isLoading: false });
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
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

  // Ref tracks autoSwinging so the loadeddata handler reads the value at load time
  // without re-subscribing the effect when the toggle changes
  const autoSwingingRef = useRef(state.settings.autoSwinging);
  autoSwingingRef.current = state.settings.autoSwinging;

  // Auto-enable swinging when video loads (only at load time, not on toggle change)
  const handleAutoSwing = useCallback(() => {
    const video = videoRef.current;
    if (!video || !autoSwingingRef.current) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const videoAspect = video.videoWidth / video.videoHeight;
    const canvasAspect = 3; // 3:1
    if (videoAspect > canvasAspect) {
      dispatch({
        type: 'UPDATE_MINI_SWINGING',
        miniIndex,
        swinging: { enabled: true },
      });
    }
  }, [dispatch, miniIndex]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    video.addEventListener('loadeddata', handleAutoSwing);
    return () => {
      video.removeEventListener('loadeddata', handleAutoSwing);
    };
  }, [videoUrl, handleAutoSwing]);

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

  // Copy video frames to canvas for normal-mode backing layer
  useEffect(() => {
    if (!needsNormalBacking) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const copyFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
        }
      }
      rafRef.current = requestAnimationFrame(copyFrame);
    };

    rafRef.current = requestAnimationFrame(copyFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [needsNormalBacking]);

  // --- Layout calculations ---
  const finalOpacity = calculateFinalOpacity(miniState, { opacity: groupOpacity });

  // Always use swinging.position for object-position.
  // When swinging is enabled, the animation loop updates position.
  // When disabled, position holds the last value (manual drag or default 0.5 center).
  const objectPosition = swingPositionToObjectPosition(miniState.swinging.position);

  // Build transform without swing translate (zoom/pan only, pan frozen at 0)
  const transform = buildTransformString(
    miniState.zoom,
    miniState.panX,
    miniState.panY,
    0 // no swing translate — using object-position instead
  );

  const baseZIndex = miniIndex + 1;
  const zIndex = baseZIndex;

  const mixBlendMode = blendModeToCSSMixBlendMode(miniState.blendMode);

  const normalOpacity = needsNormalBacking ? finalOpacity * (1 - effectiveBlend) : 0;
  const blendedOpacity = needsNormalBacking
    ? finalOpacity * effectiveBlend
    : finalOpacity * Math.min(1.0, modeIntensity);

  const sharedContainerStyle: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    overflow: 'hidden',
  };

  return (
    <>
      {/* Normal-mode backing container */}
      {needsNormalBacking && videoUrl && (
        <div
          style={{
            ...sharedContainerStyle,
            zIndex: baseZIndex,
            mixBlendMode: 'normal',
            pointerEvents: 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition,
              opacity: normalOpacity,
              transform,
              willChange: 'transform, opacity, object-position',
            }}
          />
        </div>
      )}

      {/* Main video container */}
      <div
        ref={containerRef}
        {...(isEditTarget ? gestureBind() : {})}
        className="miniVideo"
        data-mini-index={miniIndex}
        style={{
          ...sharedContainerStyle,
          zIndex,
          mixBlendMode: miniState.blendMode === BlendMode.NORMAL ? undefined : mixBlendMode,
          pointerEvents: state.editMode.active
            ? (isEditTarget ? 'auto' : 'none')
            : (finalOpacity > 0.01 ? 'auto' : 'none'),
          touchAction: isEditTarget ? 'none' : undefined,
        }}
      >
        {videoUrl && (
          <video
            ref={videoRef}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition,
              opacity: blendedOpacity,
              transform,
              willChange: 'transform, opacity, object-position',
            }}
            muted
            playsInline
            loop
          />
        )}
      </div>
    </>
  );
}
