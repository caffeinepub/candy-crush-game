import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ASSETS } from '../assets';

interface DriveControlsProps {
  onThrottle: (pressed: boolean) => void;
  onBrake: (pressed: boolean) => void;
}

export default function DriveControls({ onThrottle, onBrake }: DriveControlsProps) {
  const throttleRef = useRef<HTMLButtonElement>(null);
  const brakeRef = useRef<HTMLButtonElement>(null);
  const throttlePressedRef = useRef(false);
  const brakePressedRef = useRef(false);

  const handleThrottleDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (throttlePressedRef.current) return;
    throttlePressedRef.current = true;
    onThrottle(true);
    if (throttleRef.current) {
      throttleRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handleThrottleUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!throttlePressedRef.current) return;
    throttlePressedRef.current = false;
    onThrottle(false);
    if (throttleRef.current) {
      try {
        throttleRef.current.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleBrakeDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (brakePressedRef.current) return;
    brakePressedRef.current = true;
    onBrake(true);
    if (brakeRef.current) {
      brakeRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handleBrakeUp = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!brakePressedRef.current) return;
    brakePressedRef.current = false;
    onBrake(false);
    if (brakeRef.current) {
      try {
        brakeRef.current.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleThrottleCancel = () => {
    if (throttlePressedRef.current) {
      throttlePressedRef.current = false;
      onThrottle(false);
    }
  };

  const handleBrakeCancel = () => {
    if (brakePressedRef.current) {
      brakePressedRef.current = false;
      onBrake(false);
    }
  };

  // Safety: release all inputs on unmount or visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleThrottleCancel();
        handleBrakeCancel();
      }
    };

    const handleBlur = () => {
      handleThrottleCancel();
      handleBrakeCancel();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      handleThrottleCancel();
      handleBrakeCancel();
    };
  }, []);

  return (
    <div className="hillclimb-pedal-controls">
      {/* Brake Pedal - Left */}
      <Button
        ref={brakeRef}
        className="hillclimb-pedal-btn hillclimb-pedal-brake"
        onPointerDown={handleBrakeDown}
        onPointerUp={handleBrakeUp}
        onPointerCancel={handleBrakeCancel}
        onLostPointerCapture={handleBrakeCancel}
        asChild
      >
        <div>
          <img src={ASSETS.pedalBrake} alt="" className="hillclimb-pedal-img" />
          <span className="hillclimb-pedal-label">BRAKE</span>
        </div>
      </Button>

      {/* Gas Pedal - Right */}
      <Button
        ref={throttleRef}
        className="hillclimb-pedal-btn hillclimb-pedal-gas"
        onPointerDown={handleThrottleDown}
        onPointerUp={handleThrottleUp}
        onPointerCancel={handleThrottleCancel}
        onLostPointerCapture={handleThrottleCancel}
        asChild
      >
        <div>
          <img src={ASSETS.pedalGas} alt="" className="hillclimb-pedal-img" />
          <span className="hillclimb-pedal-label">GAS</span>
        </div>
      </Button>
    </div>
  );
}
