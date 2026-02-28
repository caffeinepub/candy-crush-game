import { useState, useEffect, useRef, useCallback } from 'react';

const TILT_DEADZONE = 5; // degrees

interface TiltControlsResult {
  tiltAngle: number | null;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
}

/**
 * Hook that reads DeviceOrientation gamma axis (left/right tilt in landscape)
 * and maps it to a steering angle for the snake.
 * Handles iOS 13+ permission requests gracefully.
 */
export function useTiltControls(enabled: boolean): TiltControlsResult {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const tiltAngleRef = useRef<number | null>(null);
  const [tiltAngle, setTiltAngle] = useState<number | null>(null);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (!enabled) {
      tiltAngleRef.current = null;
      setTiltAngle(null);
      return;
    }

    // In landscape mode, gamma is the left/right tilt axis
    // gamma ranges from -90 to 90 degrees
    const gamma = event.gamma;
    if (gamma === null || gamma === undefined) return;

    // Apply deadzone
    if (Math.abs(gamma) < TILT_DEADZONE) {
      tiltAngleRef.current = null;
      setTiltAngle(null);
      return;
    }

    // Map gamma to a steering angle (radians)
    // In landscape, tilting right (positive gamma) → steer right (angle = 0)
    // Tilting left (negative gamma) → steer left (angle = π)
    // We clamp gamma to ±45 degrees for reasonable sensitivity
    const clampedGamma = Math.max(-45, Math.min(45, gamma));
    // Map -45..45 to -π/2..π/2 (left to right)
    const angle = (clampedGamma / 45) * (Math.PI / 2);

    tiltAngleRef.current = angle;
    setTiltAngle(angle);
  }, [enabled]);

  const requestPermission = useCallback(async () => {
    // iOS 13+ requires explicit permission
    const DevOrientEvent = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof DevOrientEvent.requestPermission === 'function') {
      try {
        const result = await DevOrientEvent.requestPermission();
        if (result === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        }
      } catch (err) {
        // Permission denied or not available
        console.warn('DeviceOrientation permission denied:', err);
      }
    } else {
      // Non-iOS: permission not needed
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  }, [handleOrientation]);

  useEffect(() => {
    if (!enabled) {
      tiltAngleRef.current = null;
      setTiltAngle(null);
      return;
    }

    // Check if DeviceOrientationEvent is available
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      return;
    }

    const DevOrientEvent = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    // If iOS 13+ permission API exists, we need explicit permission
    if (typeof DevOrientEvent.requestPermission === 'function') {
      // Don't auto-request; wait for user interaction via requestPermission()
      return;
    }

    // Non-iOS: just add listener
    setPermissionGranted(true);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [enabled, handleOrientation]);

  // Clean up listener when disabled
  useEffect(() => {
    if (!enabled) {
      window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [enabled, handleOrientation]);

  return { tiltAngle, permissionGranted, requestPermission };
}
