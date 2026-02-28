import React from 'react';

interface Props {
  score: number;
}

const SpaceSnakeScoreCounter: React.FC<Props> = ({ score }) => {
  const display = String(score).padStart(3, '0');
  return (
    <div
      className="absolute bottom-6 z-20"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.65)',
        border: '1px solid rgba(100,100,100,0.4)',
        borderRadius: 8,
        padding: '4px 18px',
        color: '#e2e8f0',
        fontFamily: 'monospace',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 4,
      }}
    >
      {display}
    </div>
  );
};

export default SpaceSnakeScoreCounter;
