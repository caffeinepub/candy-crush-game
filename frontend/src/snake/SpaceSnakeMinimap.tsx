import React, { useRef, useEffect } from 'react';
import { SpaceSnake, SpaceSnakeCoin, SpaceSnakeColorPoint, SPAWN_RADIUS } from './spaceSnakeLogic';

interface SpaceSnakeMinimapProps {
  player: SpaceSnake | null;
  bots: SpaceSnake[];
  coins: SpaceSnakeCoin[];
  points: SpaceSnakeColorPoint[];
}

const MINIMAP_SIZE = 120;
const VIEW_RADIUS = SPAWN_RADIUS * 1.2;

const POINT_COLOR_MAP: Record<string, string> = {
  red: '#ff4444',
  green: '#44ff88',
  blue: '#4488ff',
  yellow: '#ffee44',
  purple: '#cc44ff',
  cyan: '#44ffee',
  orange: '#ff8844',
  pink: '#ff44aa',
};

export default function SpaceSnakeMinimap({
  player,
  bots,
  coins,
  points,
}: SpaceSnakeMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = MINIMAP_SIZE;
    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = 'rgba(5,5,20,0.85)';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = 'rgba(0,229,255,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();

    if (!player || player.segments.length === 0) return;

    const cx = player.segments[0].x;
    const cy = player.segments[0].y;
    const scale = (size / 2) / VIEW_RADIUS;

    const toMinimap = (wx: number, wy: number) => ({
      mx: size / 2 + (wx - cx) * scale,
      my: size / 2 + (wy - cy) * scale,
    });

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
    ctx.clip();

    // Draw coins
    for (const coin of coins) {
      const { mx, my } = toMinimap(coin.x, coin.y);
      ctx.beginPath();
      ctx.arc(mx, my, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
    }

    // Draw colored points
    for (const pt of points) {
      const { mx, my } = toMinimap(pt.x, pt.y);
      ctx.beginPath();
      ctx.arc(mx, my, 2, 0, Math.PI * 2);
      ctx.fillStyle = POINT_COLOR_MAP[pt.color] || '#fff';
      ctx.fill();
    }

    // Draw bots
    for (const bot of bots) {
      if (bot.segments.length === 0) continue;
      const { mx, my } = toMinimap(bot.segments[0].x, bot.segments[0].y);
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fillStyle = bot.color;
      ctx.fill();
    }

    // Draw player
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Direction indicator
    const dirLen = 8;
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2);
    ctx.lineTo(
      size / 2 + Math.cos(player.angle) * dirLen,
      size / 2 + Math.sin(player.angle) * dirLen
    );
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }, [player, bots, coins, points]);

  return (
    <div className="absolute top-4 left-4 z-20">
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
      />
    </div>
  );
}
