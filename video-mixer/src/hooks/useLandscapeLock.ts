import { useState, useEffect } from 'react';

export function useLandscapeLock() {
  const [isLandscape, setIsLandscape] = useState(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      return window.innerWidth >= window.innerHeight;
    }
    return true;
  });

  useEffect(() => {
    const checkOrientation = () => {
      // Use multiple methods to detect orientation
      let landscape = window.innerWidth >= window.innerHeight;

      // Also check screen.orientation if available
      if (screen.orientation) {
        landscape = screen.orientation.type.includes('landscape');
      }

      console.log('Orientation check:', {
        width: window.innerWidth,
        height: window.innerHeight,
        landscape
      });

      setIsLandscape(landscape);
    };

    // Check immediately
    checkOrientation();

    // Check on resize and orientation change
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Also check after a short delay (some browsers report wrong values initially)
    const timeout = setTimeout(checkOrientation, 100);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      clearTimeout(timeout);
    };
  }, []);

  return { isLandscape };
}
