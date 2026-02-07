import { useRef, useEffect } from 'react';
import { MiniState, MiniIndex } from '../types';
import { useMixer } from '../context/MixerContext';
import { useBlendConfig } from '../systems/blendConfig';
import { calculateFinalOpacity } from '../utils/opacity';
import { buildTransformString, calculateSwingTranslateX } from '../utils/transforms';
import { blendModeToCSSMixBlendMode, isDarkSensitiveBlendMode, getBlendModeConfigKey } from '../utils/blendModeMapping';
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
  const { bind: gestureBind } = useGestures(miniIndex);
  const isEditTarget = state.editMode.active && state.editMode.targetMini === miniIndex;

  // --- Blend config calculations ---
  const protection = blendConfig.protection;
  const modeKey = getBlendModeConfigKey(miniState.blendMode);
  const modeIntensity = blendConfig.modes[modeKey]?.intensity ?? 1.0;
  const isDarkSensitive = protection.enabled
    && isDarkSensitiveBlendMode(miniState.blendMode, protection.darkSensitiveModes);

  // blendStrength: how much of the blended (vs normal) layer to show
  // Ramps from minBlendStrength (when nothing below) to 1.0 (when full content below)
  let blendStrength = 1.0;
  if (isDarkSensitive && miniState.blendMode !== BlendMode.NORMAL) {
    const ramped = Math.pow(belowAlpha, protection.rampPower);
    blendStrength = protection.minBlendStrength + (1 - protection.minBlendStrength) * ramped;
  }

  // Apply per-mode intensity (scales up/down the blend portion)
  const effectiveBlend = Math.min(1.0, blendStrength * modeIntensity);
  const needsNormalBacking = isDarkSensitive && effectiveBlend < 1 && miniState.blendMode !== BlendMode.NORMAL;

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
      });

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

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

  const baseZIndex = miniIndex + 1;
  const zIndex = baseZIndex;

  // CSS mix-blend-mode must be on the CONTAINER div (not the video element)
  // so it blends with other MiniVideo layers in the parent stacking context.
  const mixBlendMode = blendModeToCSSMixBlendMode(miniState.blendMode);

  // Cross-fade opacities for protection system:
  // - normalOpacity: the "safe" normal-mode canvas (prevents black-on-black)
  // - blendedOpacity: the video with the actual blend mode
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
      {/* Normal-mode backing container: renders video copy without blend mode
          (prevents dark-sensitive modes from going black against empty background) */}
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
              objectPosition: 'center',
              opacity: normalOpacity,
              transform,
              willChange: 'transform, opacity',
            }}
          />
        </div>
      )}

      {/* Main video container — blend mode is on this container div
          so it composites with other video layers below */}
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
              objectPosition: 'center',
              opacity: blendedOpacity,
              transform,
              willChange: 'transform, opacity',
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
