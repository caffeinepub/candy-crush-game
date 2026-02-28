import React from 'react';
import { Smartphone } from 'lucide-react';

interface SpaceSnakeTiltToggleProps {
  tiltEnabled: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

/**
 * Small toggle button for enabling/disabling tilt (gyroscope) controls.
 * Only visible on mobile devices. Shows active/inactive state visually.
 */
const SpaceSnakeTiltToggle: React.FC<SpaceSnakeTiltToggleProps> = ({
  tiltEnabled,
  onToggle,
  isMobile,
}) => {
  if (!isMobile) return null;

  return (
    <button
      onClick={onToggle}
      title={tiltEnabled ? 'Tilt controls ON – tap to disable' : 'Tilt controls OFF – tap to enable'}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: tiltEnabled
          ? '2px solid rgba(100, 220, 255, 0.9)'
          : '2px solid rgba(150, 200, 255, 0.3)',
        background: tiltEnabled
          ? 'rgba(0, 180, 255, 0.25)'
          : 'rgba(20, 40, 80, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: tiltEnabled
          ? '0 0 12px rgba(0, 180, 255, 0.5)'
          : 'none',
        flexShrink: 0,
      }}
    >
      <Smartphone
        size={20}
        style={{
          color: tiltEnabled ? 'rgba(100, 220, 255, 1)' : 'rgba(150, 200, 255, 0.45)',
          transition: 'color 0.2s ease',
          transform: 'rotate(90deg)', // landscape orientation hint
        }}
      />
    </button>
  );
};

export default SpaceSnakeTiltToggle;
