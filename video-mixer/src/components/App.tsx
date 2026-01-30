import { useRef, useState, useCallback, useEffect } from 'react';
import { useMixer } from '../context/MixerContext';
import { useLandscapeLock } from '../hooks/useLandscapeLock';
import { VideoCanvas, VideoCanvasRef } from './VideoCanvas';
import { DeckLabel } from './DeckLabel';
import { TapToLoad } from './TapToLoad';
import { Crossfader } from './Crossfader';
import { LibraryOverlay } from './LibraryOverlay';
import { PlayButton } from './PlayButton';
import styles from '../styles/App.module.css';

export default function App() {
  const { state, dispatch } = useMixer();
  const { isLandscape } = useLandscapeLock();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoCanvasRef = useRef<VideoCanvasRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Detect if device is Android
  const isAndroid = /Android/i.test(navigator.userAgent);

  // Try to enter fullscreen on initial load (works on any orientation)
  useEffect(() => {
    const enterFullscreenOnLoad = async () => {
      try {
        if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
          const elem = document.documentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            mozRequestFullScreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
          };

          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            await elem.mozRequestFullScreen();
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
          }
        }
      } catch (err) {
        // Will fail if no user interaction yet
      }
    };

    // Set up handler to trigger fullscreen on first user interaction
    const handleFirstInteraction = () => {
      enterFullscreenOnLoad();
    };

    // Try immediately (will likely fail, but worth trying)
    enterFullscreenOnLoad();

    // Set up listeners for first interaction
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('click', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('click', handleFirstInteraction);
    };
  }, []);

  // Auto-fullscreen on Android when landscape is detected
  useEffect(() => {
    if (!isAndroid) return;

    const enterFullscreen = async () => {
      try {
        // Check if not already in fullscreen
        if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
          const elem = document.documentElement as HTMLElement & {
            webkitRequestFullscreen?: () => Promise<void>;
            mozRequestFullScreen?: () => Promise<void>;
            msRequestFullscreen?: () => Promise<void>;
          };

          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            await elem.mozRequestFullScreen();
          } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
          }
        }
      } catch (err) {
        // Silently fail
      }
    };

    // Listen for orientation changes to trigger fullscreen
    const handleOrientationChange = () => {
      // Small delay to let orientation settle
      setTimeout(() => {
        if (window.innerWidth > window.innerHeight) {
          enterFullscreen();
        }
      }, 100);
    };

    // Listen for screen orientation changes
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }

    // Also listen for window orientation change (fallback)
    window.addEventListener('orientationchange', handleOrientationChange);

    // Set up universal interaction handler to trigger fullscreen
    const handleInteraction = () => {
      if (window.innerWidth > window.innerHeight) {
        enterFullscreen();
      }
    };

    // Try on any user interaction
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('touchend', handleInteraction);
    document.addEventListener('click', handleInteraction);

    // Try immediately when landscape is detected
    if (isLandscape) {
      enterFullscreen();
    }

    return () => {
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('touchend', handleInteraction);
      document.removeEventListener('click', handleInteraction);
    };
  }, [isLandscape, isAndroid]);

  // Auto-play when videos are loaded and interaction is enabled
  useEffect(() => {
    if (state.isInteractionEnabled && videoCanvasRef.current) {
      videoCanvasRef.current.play();
      setIsPlaying(true);
    }
  }, [state.isInteractionEnabled, state.deckA.videoId, state.deckB.videoId]);

  const handlePlayPause = useCallback(() => {
    if (!state.isInteractionEnabled) {
      dispatch({ type: 'ENABLE_INTERACTION' });
    }

    if (videoCanvasRef.current) {
      if (isPlaying) {
        videoCanvasRef.current.pause();
        setIsPlaying(false);
      } else {
        videoCanvasRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying, state.isInteractionEnabled, dispatch]);

  // Handle tap on video area
  const handleVideoAreaTap = useCallback(() => {
    if (!state.isInteractionEnabled) {
      dispatch({ type: 'ENABLE_INTERACTION' });
      // Auto-play on first interaction
      if (videoCanvasRef.current) {
        videoCanvasRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [state.isInteractionEnabled, dispatch]);

  const hasVideos = state.deckA.videoId || state.deckB.videoId;

  // Show rotate device overlay on portrait
  if (!isLandscape) {
    return (
      <div className={styles.rotateOverlay}>
        <div className={styles.rotateIcon}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" />
          </svg>
        </div>
        <p className={styles.rotateText}>Please rotate your device to landscape</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onClick={handleVideoAreaTap}
    >
      {/* Video canvas (WebGL) */}
      <div className={styles.canvas}>
        <VideoCanvas ref={videoCanvasRef} />
      </div>

      {/* UI Controls overlay */}
      <div className={styles.controls}>
        <DeckLabel deck="A" />
        <DeckLabel deck="B" />
        <TapToLoad />
        <Crossfader />
        {/* Fullscreen button removed - auto-fullscreen on Android landscape */}
        {hasVideos && (
          <PlayButton isPlaying={isPlaying} onToggle={handlePlayPause} />
        )}
      </div>

      {/* Library modal */}
      <LibraryOverlay />
    </div>
  );
}
