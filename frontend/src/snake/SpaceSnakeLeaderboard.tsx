import React from 'react';
import { LeaderboardEntry } from './spaceSnakeLogic';

interface Props {
  entries: LeaderboardEntry[];
}

const SpaceSnakeLeaderboard: React.FC<Props> = ({ entries }) => {
  return (
    <div
      className="absolute top-2 left-2 z-20"
      style={{
        background: 'rgba(5,15,40,0.75)',
        border: '1.5px solid rgba(0,200,255,0.5)',
        borderRadius: 8,
        padding: '8px 14px',
        minWidth: 200,
        backdropFilter: 'blur(6px)',
        boxShadow: '0 0 16px rgba(0,200,255,0.2)',
      }}
    >
      {/* Circuit board decorative lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 8,
          overflow: 'hidden',
          pointerEvents: 'none',
          opacity: 0.15,
        }}
      >
        <svg width="100%" height="100%">
          <line x1="0" y1="20" x2="30" y2="20" stroke="#00cfff" strokeWidth="1" />
          <line x1="30" y1="20" x2="30" y2="5" stroke="#00cfff" strokeWidth="1" />
          <line x1="30" y1="5" x2="80" y2="5" stroke="#00cfff" strokeWidth="1" />
          <line x1="0" y1="40" x2="20" y2="40" stroke="#ff00ff" strokeWidth="1" />
          <line x1="20" y1="40" x2="20" y2="55" stroke="#ff00ff" strokeWidth="1" />
        </svg>
      </div>

      <div
        style={{
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 13,
          letterSpacing: 1,
          marginBottom: 6,
          textShadow: '0 0 8px rgba(0,200,255,0.8)',
        }}
      >
        TOP PLAYERS
      </div>

      {entries.map((entry, i) => (
        <div
          key={entry.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 3,
            background: entry.isPlayer ? 'rgba(0,200,255,0.1)' : 'transparent',
            borderRadius: 4,
            padding: '1px 4px',
          }}
        >
          <span
            style={{
              color: '#f97316',
              fontWeight: 'bold',
              fontSize: 14,
              width: 16,
              textAlign: 'center',
            }}
          >
            {i + 1}
          </span>
          <span
            style={{
              color: entry.isPlayer ? '#7dd3fc' : '#e2e8f0',
              fontSize: 13,
              flex: 1,
              fontWeight: entry.isPlayer ? 'bold' : 'normal',
            }}
          >
            {entry.name}
          </span>
          <span
            style={{
              color: '#f97316',
              fontWeight: 'bold',
              fontSize: 13,
            }}
          >
            {entry.score}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SpaceSnakeLeaderboard;
