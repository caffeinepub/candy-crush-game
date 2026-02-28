import React, { useRef, useEffect } from 'react';
import { GameState, WORLD_SIZE } from './spaceSnakeLogic';

interface Props {
  gameState: GameState;
}

const MAP_SIZE = 110;

const SpaceSnakeMinimap: React.FC<Props> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = MAP_SIZE * dpr;
    canvas.height = MAP_SIZE * dpr;
    ctx.scale(dpr, dpr);

    const scale = MAP_SIZE / WORLD_SIZE;

    // Background
    ctx.fillStyle = 'rgba(5,15,40,0.75)';
    ctx.beginPath();
    ctx.arc(MAP_SIZE / 2, MAP_SIZE / 2, MAP_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(0,200,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(MAP_SIZE / 2, MAP_SIZE / 2, MAP_SIZE / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(MAP_SIZE / 2, MAP_SIZE / 2, MAP_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.clip();

    // Coins
    for (const coin of gameState.coins) {
      const mx = coin.x * scale;
      const my = coin.y * scale;
      ctx.beginPath();
      ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
    }

    // Bots
    for (const bot of gameState.bots) {
      if (!bot.alive || bot.segments.length === 0) continue;
      const head = bot.segments[0];
      const mx = head.x * scale;
      const my = head.y * scale;
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fillStyle = bot.color;
      ctx.fill();
    }

    // Player
    if (gameState.player.alive && gameState.player.segments.length > 0) {
      const head = gameState.player.segments[0];
      const mx = head.x * scale;
      const my = head.y * scale;
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }

    ctx.restore();
  });

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: MAP_SIZE,
        height: MAP_SIZE,
        borderRadius: '50%',
        display: 'block',
      }}
    />
  );
};

export default SpaceSnakeMinimap;
