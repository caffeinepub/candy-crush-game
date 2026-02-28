import { useState, useEffect } from 'react';

/**
 * Hook that tracks whether the device is in landscape orientation.
 * Updates live on orientation changes without requiring a reload.
 */
export function useLandscapeOrientation(): boolean {
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > window.innerHeight;
  });

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    // Check on mount
    checkOrientation();

    // Listen to resize and orientation change events
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return isLandscape;
}
