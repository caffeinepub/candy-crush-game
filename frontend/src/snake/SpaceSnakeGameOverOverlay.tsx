import React from 'react';

interface Props {
  score: number;
  rank: number;
  onPlayAgain: () => void;
}

const SpaceSnakeGameOverOverlay: React.FC<Props> = ({ score, rank, onPlayAgain }) => {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        style={{
          background: 'rgba(5,15,40,0.95)',
          border: '2px solid rgba(0,200,255,0.6)',
          borderRadius: 16,
          padding: '32px 48px',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(0,200,255,0.3)',
        }}
      >
        <div
          style={{
            color: '#f87171',
            fontSize: 32,
            fontWeight: 'bold',
            marginBottom: 8,
            textShadow: '0 0 16px rgba(248,113,113,0.8)',
          }}
        >
          GAME OVER
        </div>
        <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
          You were eliminated!
        </div>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ color: '#64748b', fontSize: 12 }}>SCORE</div>
            <div style={{ color: '#ffd700', fontSize: 28, fontWeight: 'bold' }}>{score}</div>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: 12 }}>RANK</div>
            <div style={{ color: '#f97316', fontSize: 28, fontWeight: 'bold' }}>#{rank}</div>
          </div>
        </div>
        <button
          onClick={onPlayAgain}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 32px',
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
            letterSpacing: 1,
            boxShadow: '0 0 16px rgba(14,165,233,0.5)',
          }}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

export default SpaceSnakeGameOverOverlay;
