import React, { useState } from 'react';

interface Props {
  onPlay: (nickname: string) => void;
}

const SpaceSnakeMainMenu: React.FC<Props> = ({ onPlay }) => {
  const [nickname, setNickname] = useState('Player');

  const handlePlay = () => {
    const name = nickname.trim() || 'Player';
    onPlay(name);
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center"
      style={{
        background: '#0a1a3a',
        overflow: 'hidden',
      }}
    >
      {/* Starfield */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        {Array.from({ length: 200 }).map((_, i) => {
          const x = (Math.sin(i * 7.3) * 0.5 + 0.5) * 100;
          const y = (Math.sin(i * 13.7) * 0.5 + 0.5) * 100;
          const size = (Math.sin(i * 3.1) * 0.5 + 0.5) * 3 + 1;
          const isCyan = i % 5 === 0;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size * 0.6,
                borderRadius: '50%',
                background: isCyan ? 'rgba(100,220,255,0.85)' : 'rgba(255,255,255,0.9)',
              }}
            />
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: '#4dd0c4',
              textShadow: '0 0 30px rgba(77,208,196,0.8), 0 0 60px rgba(77,208,196,0.4)',
              letterSpacing: 4,
              lineHeight: 1,
            }}
          >
            SPACE
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 0 20px rgba(255,255,255,0.5)',
              letterSpacing: 4,
              lineHeight: 1,
            }}
          >
            SNAKE
          </div>
          <div
            style={{
              color: '#64748b',
              fontSize: 13,
              marginTop: 8,
              letterSpacing: 2,
            }}
          >
            SLITHER THROUGH THE COSMOS
          </div>
        </div>

        {/* Snake preview */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === 0 ? 22 : 16,
                height: i === 0 ? 22 : 16,
                borderRadius: '50%',
                background: i === 0 ? '#a0f0e8' : '#4dd0c4',
                border: `2px solid ${i === 0 ? '#4dd0c4' : '#2a9d8f'}`,
                boxShadow: i === 0 ? '0 0 12px rgba(77,208,196,0.8)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Nickname input */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <label
            style={{ color: '#94a3b8', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}
          >
            Your Name
          </label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={20}
            onKeyDown={e => e.key === 'Enter' && handlePlay()}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(0,200,255,0.4)',
              borderRadius: 8,
              padding: '10px 20px',
              color: '#fff',
              fontSize: 16,
              textAlign: 'center',
              outline: 'none',
              width: 220,
            }}
          />
        </div>

        {/* Play button */}
        <button
          onClick={handlePlay}
          style={{
            background: 'linear-gradient(135deg, #4dd0c4, #0ea5e9)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '14px 56px',
            fontSize: 20,
            fontWeight: 'bold',
            cursor: 'pointer',
            letterSpacing: 3,
            boxShadow: '0 0 24px rgba(77,208,196,0.6)',
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          PLAY
        </button>

        {/* Instructions */}
        <div
          style={{
            color: '#475569',
            fontSize: 12,
            textAlign: 'center',
            lineHeight: 1.8,
          }}
        >
          🖱️ Move mouse to steer &nbsp;|&nbsp; 📱 Use joystick on mobile
          <br />
          Collect coins to grow • Avoid other snakes
        </div>
      </div>
    </div>
  );
};

export default SpaceSnakeMainMenu;
