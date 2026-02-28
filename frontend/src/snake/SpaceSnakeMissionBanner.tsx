import React from 'react';
import { MissionState } from './spaceSnakeLogic';

interface Props {
  mission: MissionState;
}

const SpaceSnakeMissionBanner: React.FC<Props> = ({ mission }) => {
  return (
    <div
      className="absolute top-2 z-20"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(5,15,40,0.8)',
        border: '1.5px solid rgba(0,200,255,0.4)',
        borderRadius: 10,
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        backdropFilter: 'blur(6px)',
        boxShadow: '0 0 16px rgba(0,200,255,0.2)',
      }}
    >
      {/* Coin icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #ffe066, #f5a623, #c47d00)',
          border: '2px solid #ffd700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
          boxShadow: '0 0 8px rgba(255,200,0,0.6)',
        }}
      >
        <span style={{ color: '#7a4a00', fontWeight: 'bold', fontSize: 16 }}>$</span>
      </div>

      {/* Text */}
      <div>
        <div
          style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 13,
            letterSpacing: 1,
          }}
        >
          COLLECT COINS
        </div>
        <div
          style={{
            color: '#4ade80',
            fontWeight: 'bold',
            fontSize: 15,
          }}
        >
          {mission.current}/{mission.target}
        </div>
      </div>

      {/* Timer badge */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)',
          border: '2px solid rgba(200,200,200,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>
          {mission.timeRemaining}s
        </span>
      </div>
    </div>
  );
};

export default SpaceSnakeMissionBanner;
