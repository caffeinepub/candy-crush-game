import React, { useRef, useEffect, useCallback } from 'react';
import {
  SpaceSnake,
  SpaceSnakeCoin,
  SpaceSnakeColorPoint,
  SPAWN_RADIUS,
} from './spaceSnakeLogic';

interface SpaceSnakeCanvasProps {
  player: SpaceSnake | null;
  bots: SpaceSnake[];
  coins: SpaceSnakeCoin[];
  points: SpaceSnakeColorPoint[];
  width: number;
  height: number;
}

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

// Starfield (generated once)
interface Star {
  x: number;
  y: number;
  r: number;
  brightness: number;
}
const STAR_COUNT = 300;
const STAR_FIELD_SIZE = 4000;
let cachedStars: Star[] | null = null;
function getStars(): Star[] {
  if (!cachedStars) {
    cachedStars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      cachedStars.push({
        x: Math.random() * STAR_FIELD_SIZE,
        y: Math.random() * STAR_FIELD_SIZE,
        r: 0.5 + Math.random() * 1.5,
        brightness: 0.4 + Math.random() * 0.6,
      });
    }
  }
  return cachedStars;
}

export default function SpaceSnakeCanvas({
  player,
  bots,
  coins,
  points,
  width,
  height,
}: SpaceSnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Camera follows player head
    const camX = player ? player.segments[0].x : 0;
    const camY = player ? player.segments[0].y : 0;
    const offsetX = width / 2 - camX;
    const offsetY = height / 2 - camY;

    // ── Background ──────────────────────────────────────────────────────────
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, width, height);

    // Tiling starfield
    const stars = getStars();
    for (const star of stars) {
      // Tile the star field
      const sx = ((star.x + offsetX * 0.3) % STAR_FIELD_SIZE + STAR_FIELD_SIZE) % STAR_FIELD_SIZE;
      const sy = ((star.y + offsetY * 0.3) % STAR_FIELD_SIZE + STAR_FIELD_SIZE) % STAR_FIELD_SIZE;
      ctx.beginPath();
      ctx.arc(sx, sy, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${star.brightness})`;
      ctx.fill();
    }

    // Subtle grid
    ctx.save();
    ctx.strokeStyle = 'rgba(100,120,255,0.04)';
    ctx.lineWidth = 1;
    const gridSize = 200;
    const startX = ((offsetX % gridSize) + gridSize) % gridSize;
    const startY = ((offsetY % gridSize) + gridSize) % gridSize;
    for (let x = startX - gridSize; x < width + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = startY - gridSize; y < height + gridSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // ── Coins ───────────────────────────────────────────────────────────────
    for (const coin of coins) {
      const cx = coin.x + offsetX;
      const cy = coin.y + offsetY;
      if (cx < -30 || cx > width + 30 || cy < -30 || cy > height + 30) continue;

      // Glow
      const grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, 14);
      grd.addColorStop(0, 'rgba(255,220,50,0.9)');
      grd.addColorStop(1, 'rgba(255,180,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Coin body
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Value label for multi-value coins
      if (coin.value > 1) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(coin.value), cx, cy);
      }
    }

    // ── Colored Points ──────────────────────────────────────────────────────
    for (const pt of points) {
      const px = pt.x + offsetX;
      const py = pt.y + offsetY;
      if (px < -30 || px > width + 30 || py < -30 || py > height + 30) continue;

      const color = POINT_COLOR_MAP[pt.color] || '#ffffff';

      // Glow
      const grd = ctx.createRadialGradient(px, py, 2, px, py, 16);
      grd.addColorStop(0, color.replace(')', ',0.9)').replace('rgb', 'rgba'));
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Point orb
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Value label for high-value points
      if (pt.value > 3) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(pt.value), px, py);
      }
    }

    // ── Draw snakes ─────────────────────────────────────────────────────────
    const allSnakes: SpaceSnake[] = [];
    if (player) allSnakes.push(player);
    allSnakes.push(...bots);

    for (const snake of allSnakes) {
      if (snake.segments.length === 0) continue;
      drawSnake(ctx, snake, offsetX, offsetY, width, height);
    }
  }, [player, bots, coins, points, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', width, height }}
    />
  );
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: SpaceSnake,
  offsetX: number,
  offsetY: number,
  canvasW: number,
  canvasH: number
) {
  const segs = snake.segments;
  if (segs.length === 0) return;

  const baseRadius = snake.isPlayer ? 12 : 10;

  // Draw body
  for (let i = segs.length - 1; i >= 1; i--) {
    const seg = segs[i];
    const sx = seg.x + offsetX;
    const sy = seg.y + offsetY;
    if (sx < -20 || sx > canvasW + 20 || sy < -20 || sy > canvasH + 20) continue;

    const t = i / segs.length;
    const radius = baseRadius * (0.5 + 0.5 * (1 - t));
    const alpha = 0.7 + 0.3 * (1 - t);

    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(snake.color, alpha);
    ctx.fill();
  }

  // Draw head
  const head = segs[0];
  const hx = head.x + offsetX;
  const hy = head.y + offsetY;

  // Head glow
  const grd = ctx.createRadialGradient(hx, hy, 2, hx, hy, baseRadius * 2);
  grd.addColorStop(0, hexToRgba(snake.color, 0.6));
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(hx, hy, baseRadius * 2, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();

  // Head body
  ctx.beginPath();
  ctx.arc(hx, hy, baseRadius, 0, Math.PI * 2);
  ctx.fillStyle = snake.color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  const eyeOffset = baseRadius * 0.5;
  const eyeAngle1 = snake.angle - 0.5;
  const eyeAngle2 = snake.angle + 0.5;
  const eyeRadius = baseRadius * 0.28;

  for (const ea of [eyeAngle1, eyeAngle2]) {
    const ex = hx + Math.cos(ea) * eyeOffset;
    const ey = hy + Math.sin(ea) * eyeOffset;
    ctx.beginPath();
    ctx.arc(ex, ey, eyeRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
      ex + Math.cos(snake.angle) * eyeRadius * 0.4,
      ey + Math.sin(snake.angle) * eyeRadius * 0.4,
      eyeRadius * 0.5,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#111';
    ctx.fill();
  }

  // Name label
  if (snake.isPlayer || segs.length > 15) {
    ctx.fillStyle = snake.isPlayer ? '#00e5ff' : 'rgba(255,255,255,0.8)';
    ctx.font = `bold ${snake.isPlayer ? 11 : 9}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(snake.name, hx, hy - baseRadius - 3);
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
