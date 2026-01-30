import { useState, useEffect } from 'react';
import styles from '../styles/FullscreenButton.module.css';

// Detect iOS devices
const isIOS = () => {
  return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIOSDevice] = useState(isIOS());

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    // iOS Safari workaround - scroll to hide address bar
    if (isIOSDevice) {
      if (!isFullscreen) {
        // Scroll to top to hide Safari UI
        window.scrollTo(0, 1);

        // Add fullscreen class to body for CSS-based fullscreen
        document.body.classList.add('ios-fullscreen');
        setIsFullscreen(true);

        // Request screen orientation lock if available
        try {
          const screen = window.screen as any;
          if (screen.orientation?.lock) {
            await screen.orientation.lock('landscape').catch(() => {});
          }
        } catch (err) {
          // Orientation lock not supported
        }
      } else {
        document.body.classList.remove('ios-fullscreen');
        setIsFullscreen(false);

        // Unlock orientation
        try {
          const screen = window.screen as any;
          if (screen.orientation?.unlock) {
            screen.orientation.unlock();
          }
        } catch (err) {
          // Orientation unlock not supported
        }
      }
      return;
    }

    // Standard fullscreen for non-iOS devices
    try {
      if (!document.fullscreenElement) {
        const elem = document.documentElement as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void>;
        };

        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        }
      } else {
        const doc = document as Document & {
          webkitExitFullscreen?: () => Promise<void>;
        };

        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  return (
    <button className={styles.button} onClick={toggleFullscreen}>
      {isFullscreen ? (
        // Exit fullscreen icon
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
      ) : (
        // Enter fullscreen icon
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      )}
    </button>
  );
}
