import { useEffect, useRef, useState } from 'react';
import { SteeringFilter } from './joystickSteeringFilter';

interface JoystickProps {
  onAngleChange: (angle: number | null) => void;
  disabled?: boolean;
}

const JOYSTICK_SIZE = 140;
const THUMB_SIZE = 60;
const MAX_DISTANCE = (JOYSTICK_SIZE - THUMB_SIZE) / 2;

export default function Joystick({ onAngleChange, disabled = false }: JoystickProps) {
  const [thumbPosition, setThumbPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const steeringFilterRef = useRef(new SteeringFilter());
  const pointerIdRef = useRef<number | null>(null);

  const handleStart = (clientX: number, clientY: number, pointerId: number) => {
    if (disabled) return;
    isDraggingRef.current = true;
    pointerIdRef.current = pointerId;
    setIsActive(true);
    
    // Capture pointer to continue tracking even if it leaves the element
    if (containerRef.current) {
      containerRef.current.setPointerCapture(pointerId);
    }
    
    updateThumbPosition(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || disabled) return;
    updateThumbPosition(clientX, clientY);
  };

  const handleEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    pointerIdRef.current = null;
    setIsActive(false);
    setThumbPosition({ x: 0, y: 0 });
    steeringFilterRef.current.reset();
    onAngleChange(null);
  };

  const updateThumbPosition = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Clamp to max distance
    if (distance > MAX_DISTANCE) {
      const ratio = MAX_DISTANCE / distance;
      dx *= ratio;
      dy *= ratio;
    }

    setThumbPosition({ x: dx, y: dy });

    // Normalize to -1 to 1 range for filter
    const normalizedDx = dx / MAX_DISTANCE;
    const normalizedDy = dy / MAX_DISTANCE;

    // Apply steering filter
    const filteredAngle = steeringFilterRef.current.process(normalizedDx, normalizedDy);
    
    // Only emit angle change if filter returned a new value
    if (filteredAngle !== null && !disabled) {
      onAngleChange(filteredAngle);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY, e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerIdRef.current === e.pointerId) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerIdRef.current === e.pointerId) {
        e.preventDefault();
        handleEnd();
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (pointerIdRef.current === e.pointerId) {
        handleEnd();
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);

    return () => {
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className={`joystick-container ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      style={{
        width: JOYSTICK_SIZE,
        height: JOYSTICK_SIZE,
        position: 'relative',
        touchAction: 'none',
      }}
    >
      <div className="joystick-base" />
      <div
        className="joystick-thumb"
        style={{
          transform: `translate(${thumbPosition.x}px, ${thumbPosition.y}px)`,
        }}
      />
    </div>
  );
}
