import React, { useRef, useEffect, useCallback } from 'react';
import {
  GameState,
  WORLD_SIZE,
  SEGMENT_RADIUS,
  HEAD_RADIUS,
  COIN_RADIUS,
  SnakeEntity,
  CoinEntity,
} from './spaceSnakeLogic';

interface Props {
  gameState: GameState;
  onMouseMove?: (x: number, y: number) => void;
}

// Draw starfield background
function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camX: number,
  camY: number
) {
  ctx.fillStyle = '#0a1a3a';
  ctx.fillRect(0, 0, width, height);

  // Use seeded random for stable stars
  const seed = 42;
  const starCount = 400;
  for (let i = 0; i < starCount; i++) {
    const sx = pseudoRand(seed + i * 3) * WORLD_SIZE;
    const sy = pseudoRand(seed + i * 3 + 1) * WORLD_SIZE;
    const sr = pseudoRand(seed + i * 3 + 2) * 4 + 1;
    const isCyan = i % 5 === 0;

    const screenX = sx - camX + width / 2;
    const screenY = sy - camY + height / 2;

    if (screenX < -10 || screenX > width + 10 || screenY < -10 || screenY > height + 10) continue;

    ctx.beginPath();
    ctx.ellipse(screenX, screenY, sr, sr * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = isCyan ? 'rgba(100,220,255,0.85)' : 'rgba(255,255,255,0.9)';
    ctx.fill();
  }
}

function pseudoRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: SnakeEntity,
  camX: number,
  camY: number,
  width: number,
  height: number
) {
  if (!snake.alive) return;
  const segments = snake.segments;

  // Draw body segments from tail to head
  for (let i = segments.length - 1; i >= 1; i--) {
    const seg = segments[i];
    const sx = seg.x - camX + width / 2;
    const sy = seg.y - camY + height / 2;

    if (sx < -30 || sx > width + 30 || sy < -30 || sy > height + 30) continue;

    const r = SEGMENT_RADIUS;

    // Outer ring
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = snake.color;
    ctx.fill();

    // Inner ring (darker)
    ctx.beginPath();
    ctx.arc(sx, sy, r * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = darkenColor(snake.color, 0.4);
    ctx.fill();

    // Center dot
    ctx.beginPath();
    ctx.arc(sx, sy, r * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = snake.color;
    ctx.fill();
  }

  // Draw head
  if (segments.length > 0) {
    const head = segments[0];
    const hx = head.x - camX + width / 2;
    const hy = head.y - camY + height / 2;

    if (hx >= -30 && hx <= width + 30 && hy >= -30 && hy <= height + 30) {
      const r = HEAD_RADIUS;

      // Glow
      const grd = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 1.5);
      grd.addColorStop(0, snake.headColor + 'aa');
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(hx, hy, r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Head circle
      ctx.beginPath();
      ctx.arc(hx, hy, r, 0, Math.PI * 2);
      ctx.fillStyle = snake.headColor;
      ctx.fill();

      // Eyes
      const eyeOffset = r * 0.4;
      const eyeAngle = snake.angle;
      const perpAngle = eyeAngle + Math.PI / 2;
      const eyeForward = r * 0.3;

      for (const side of [-1, 1]) {
        const ex = hx + Math.cos(eyeAngle) * eyeForward + Math.cos(perpAngle) * eyeOffset * side;
        const ey = hy + Math.sin(eyeAngle) * eyeForward + Math.sin(perpAngle) * eyeOffset * side;
        ctx.beginPath();
        ctx.arc(ex, ey, r * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex + 1, ey - 1, r * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }

      // Name label
      if (!snake.isPlayer) {
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(snake.name, hx, hy - r - 5);
      }
    }
  }
}

function darkenColor(hex: string, factor: number): string {
  // Simple darkening
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.floor(r * factor)},${Math.floor(g * factor)},${Math.floor(b * factor)})`;
}

function drawCoin(
  ctx: CanvasRenderingContext2D,
  coin: CoinEntity,
  camX: number,
  camY: number,
  width: number,
  height: number,
  time: number
) {
  const cx = coin.x - camX + width / 2;
  const cy = coin.y - camY + height / 2;

  if (cx < -20 || cx > width + 20 || cy < -20 || cy > height + 20) return;

  const r = COIN_RADIUS;
  const pulse = 1 + Math.sin(time * 0.003 + coin.x) * 0.1;

  // Glow
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2);
  grd.addColorStop(0, 'rgba(255,200,0,0.4)');
  grd.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();

  // Coin body
  ctx.beginPath();
  ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
  const coinGrd = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
  coinGrd.addColorStop(0, '#ffe066');
  coinGrd.addColorStop(0.5, '#f5a623');
  coinGrd.addColorStop(1, '#c47d00');
  ctx.fillStyle = coinGrd;
  ctx.fill();

  // Coin border
  ctx.beginPath();
  ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Lion face symbol
  ctx.font = `bold ${Math.floor(r * 1.1)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#7a4a00';
  ctx.fillText('$', cx, cy);
  ctx.textBaseline = 'alphabetic';
}

function drawWorldBorder(
  ctx: CanvasRenderingContext2D,
  camX: number,
  camY: number,
  width: number,
  height: number
) {
  const left = 0 - camX + width / 2;
  const top = 0 - camY + height / 2;
  const right = WORLD_SIZE - camX + width / 2;
  const bottom = WORLD_SIZE - camY + height / 2;

  ctx.strokeStyle = 'rgba(0,200,255,0.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(left, top, right - left, bottom - top);
}

const SpaceSnakeCanvas: React.FC<Props> = ({ gameState, onMouseMove }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (onMouseMove) {
        const rect = e.currentTarget.getBoundingClientRect();
        onMouseMove(e.clientX - rect.left, e.clientY - rect.top);
      }
    },
    [onMouseMove]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    timeRef.current += 16;
    const time = timeRef.current;

    const { cameraX, cameraY, player, bots, coins } = gameState;

    ctx.clearRect(0, 0, w, h);

    // Background
    drawBackground(ctx, w, h, cameraX, cameraY);

    // World border
    drawWorldBorder(ctx, cameraX, cameraY, w, h);

    // Coins
    for (const coin of coins) {
      drawCoin(ctx, coin, cameraX, cameraY, w, h, time);
    }

    // Bots
    for (const bot of bots) {
      drawSnake(ctx, bot, cameraX, cameraY, w, h);
    }

    // Player
    drawSnake(ctx, player, cameraX, cameraY, w, h);
  });

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
      onMouseMove={handleMouseMove}
    />
  );
};

export default SpaceSnakeCanvas;
