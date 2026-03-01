import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SpaceSnakeMainMenuProps {
  nickname: string;
  onNicknameChange: (name: string) => void;
  onPlay: () => void;
}

export default function SpaceSnakeMainMenu({
  nickname,
  onNicknameChange,
  onPlay,
}: SpaceSnakeMainMenuProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);

  // Animated starfield background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.5 + Math.random() * 1.5,
      speed: 0.1 + Math.random() * 0.3,
      brightness: 0.3 + Math.random() * 0.7,
    }));

    const animate = () => {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.brightness})`;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && nickname.trim()) onPlay();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        {/* Title */}
        <div className="text-center">
          <h1
            className="text-5xl md:text-7xl font-black tracking-widest uppercase"
            style={{
              color: '#00e5ff',
              textShadow: '0 0 30px #00e5ff, 0 0 60px #00e5ff88',
              letterSpacing: '0.12em',
            }}
          >
            Snake Game
          </h1>
          <div
            className="text-2xl md:text-3xl font-bold tracking-[0.3em] uppercase mt-1"
            style={{
              color: '#7c3aed',
              textShadow: '0 0 20px #7c3aed',
            }}
          >
            3D
          </div>
          <p className="mt-3 text-white/50 text-sm tracking-widest uppercase">
            Slither · Grow · Dominate
          </p>
        </div>

        {/* Input + Play */}
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <Input
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your name..."
            maxLength={20}
            className="text-center text-white bg-white/10 border-white/20 placeholder:text-white/30 focus:border-cyan-400 focus:ring-cyan-400/30 text-base py-3"
          />
          <Button
            onClick={onPlay}
            disabled={!nickname.trim()}
            className="w-full py-4 text-lg font-black tracking-widest uppercase"
            style={{
              background: nickname.trim()
                ? 'linear-gradient(135deg, #00e5ff, #7c3aed)'
                : undefined,
              boxShadow: nickname.trim() ? '0 0 30px #00e5ff44' : undefined,
            }}
          >
            PLAY
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center text-white/30 text-xs space-y-1">
          <p>🖱️ Mouse / Joystick to steer</p>
          <p>🐍 Eat coins &amp; orbs to grow</p>
          <p>💀 Avoid other snakes' bodies</p>
          <p>⚡ Kill snakes to collect their drops!</p>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs mt-4">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.hostname : 'snake-game-3d'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/50"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
