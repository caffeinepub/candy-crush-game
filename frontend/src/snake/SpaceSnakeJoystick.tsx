import React, { useRef, useCallback, useState } from 'react';

interface Props {
  onAngleChange: (angle: number | null) => void;
}

const JOYSTICK_SIZE = 110;
const KNOB_SIZE = 44;
const MAX_DIST = JOYSTICK_SIZE / 2 - KNOB_SIZE / 2;

const SpaceSnakeJoystick: React.FC<Props> = ({ onAngleChange }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const activePointerRef = useRef<number | null>(null);

  const getCenter = useCallback(() => {
    const el = baseRef.current;
    if (!el) return { cx: 0, cy: 0 };
    const rect = el.getBoundingClientRect();
    return { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      if (activePointerRef.current !== null) return;
      activePointerRef.current = e.pointerId;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const { cx, cy } = getCenter();
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(d, MAX_DIST);
      const angle = Math.atan2(dy, dx);
      setKnobPos({ x: Math.cos(angle) * clamped, y: Math.sin(angle) * clamped });
      if (d > 8) onAngleChange(angle);
    },
    [getCenter, onAngleChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (activePointerRef.current !== e.pointerId) return;
      e.preventDefault();
      const { cx, cy } = getCenter();
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const clamped = Math.min(d, MAX_DIST);
      const angle = Math.atan2(dy, dx);
      setKnobPos({ x: Math.cos(angle) * clamped, y: Math.sin(angle) * clamped });
      if (d > 8) onAngleChange(angle);
    },
    [getCenter, onAngleChange]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (activePointerRef.current !== e.pointerId) return;
      activePointerRef.current = null;
      setKnobPos({ x: 0, y: 0 });
      onAngleChange(null);
    },
    [onAngleChange]
  );

  return (
    <div
      ref={baseRef}
      className="relative select-none touch-none"
      style={{
        width: JOYSTICK_SIZE,
        height: JOYSTICK_SIZE,
        borderRadius: '50%',
        background: 'rgba(150,200,255,0.12)',
        border: '2px solid rgba(150,200,255,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Knob */}
      <div
        style={{
          position: 'absolute',
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: '50%',
          background: 'rgba(200,230,255,0.55)',
          border: '2px solid rgba(200,230,255,0.8)',
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          transition: activePointerRef.current !== null ? 'none' : 'transform 0.15s ease',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default SpaceSnakeJoystick;
