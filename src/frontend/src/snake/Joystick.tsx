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

  const handleStart = (clientX: number, clientY: number) => {
    if (disabled) return;
    isDraggingRef.current = true;
    setIsActive(true);
    updateThumbPosition(clientX, clientY);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDraggingRef.current || disabled) return;
    updateThumbPosition(clientX, clientY);
  };

  const handleEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
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
    if (filteredAngle !== null) {
      onAngleChange(filteredAngle);
    }
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
        handleEnd();
      }
    };

    const handlePointerCancel = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault();
        handleEnd();
      }
    };

    // Add listeners to window for tracking outside the element
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [disabled]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    
    // Capture pointer for reliable tracking
    if (containerRef.current) {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
    
    handleStart(e.clientX, e.clientY);
  };

  return (
    <div className="joystick-container">
      <div
        ref={containerRef}
        className={`joystick-base ${isActive ? 'joystick-active' : ''} ${disabled ? 'joystick-disabled' : ''}`}
        onPointerDown={handlePointerDown}
        style={{ touchAction: 'none' }} // Prevent default touch behaviors
      >
        <div
          className="joystick-thumb"
          style={{
            transform: `translate(${thumbPosition.x}px, ${thumbPosition.y}px)`,
          }}
        />
      </div>
    </div>
  );
}
