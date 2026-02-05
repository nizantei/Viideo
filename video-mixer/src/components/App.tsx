import { useRef, useEffect } from 'react';
import { useMixer } from '../context/MixerContext';
import { useLandscapeLock } from '../hooks/useLandscapeLock';
import { useGlobalCrossfaderGesture } from '../hooks/useGlobalCrossfaderGesture';
import { VideoMixer } from './VideoMixer';
import { MiniControls } from './MiniControls';
import { TapToLoad } from './TapToLoad';
import { LibraryOverlay } from './LibraryOverlay';
import { BlendModeIndicator } from './BlendModeIndicator';
import { BlendModeSelector } from './BlendModeSelector';
import { FullScreenButton } from './FullScreenButton';
import styles from '../styles/App.module.css';

export default function App() {
  const { state, dispatch } = useMixer();
  const { isLandscape } = useLandscapeLock();
  const containerRef = useRef<HTMLDivElement>(null);
  const fullScreenActivatedTimeRef = useRef<number>(0);

  // Enable global crossfader gesture
  useGlobalCrossfaderGesture();

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

  // Track when full-screen mode is activated to prevent immediate exit
  useEffect(() => {
    if (state.isFullScreenMode) {
      fullScreenActivatedTimeRef.current = Date.now();
    }
  }, [state.isFullScreenMode]);

  // Handle tap on video area - exit full-screen mode or enable interaction
  const handleVideoAreaTap = () => {
    // Exit full-screen mode if active (but only if it's been active for at least 200ms)
    if (state.isFullScreenMode) {
      const timeSinceActivation = Date.now() - fullScreenActivatedTimeRef.current;
      if (timeSinceActivation > 200) {
        dispatch({ type: 'EXIT_FULLSCREEN_MODE' });
      }
      return;
    }

    // Enable interaction for video playback
    if (!state.isInteractionEnabled) {
      dispatch({ type: 'ENABLE_INTERACTION' });
    }
  };

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
      {/* Video mixer */}
      <div className={styles.canvas}>
        <VideoMixer />
      </div>

      {/* UI Controls overlay */}
      <div className={styles.controls}>
        <MiniControls />
        <TapToLoad />
        <FullScreenButton />
      </div>

      {/* Blend mode indicator (only shows in edit mode) */}
      <BlendModeIndicator />

      {/* Library modal */}
      <LibraryOverlay />

      {/* Blend mode selector modal */}
      <BlendModeSelector />
    </div>
  );
}
