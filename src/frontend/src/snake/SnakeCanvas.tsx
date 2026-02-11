import { useEffect, useRef } from 'react';
import { SnakeGameState, Snake, Pickup } from './types';
import { HEAD_RADIUS, SEGMENT_SPACING } from './logic';

interface SnakeCanvasProps {
  gameState: SnakeGameState;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const ZOOM = 1.2;

export default function SnakeCanvas({ gameState }: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/assets/generated/snake-arena-bg.dim_1920x1080.png';
    img.onload = () => {
      bgImageRef.current = img;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const camera = gameState.camera;
      const viewWidth = CANVAS_WIDTH / ZOOM;
      const viewHeight = CANVAS_HEIGHT / ZOOM;

      ctx.save();
      ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      ctx.scale(ZOOM, ZOOM);
      ctx.translate(-camera.x, -camera.y);

      if (bgImageRef.current) {
        const tileSize = 512;
        const startX = Math.floor((camera.x - viewWidth / 2) / tileSize) * tileSize;
        const startY = Math.floor((camera.y - viewHeight / 2) / tileSize) * tileSize;
        const endX = Math.ceil((camera.x + viewWidth / 2) / tileSize) * tileSize;
        const endY = Math.ceil((camera.y + viewHeight / 2) / tileSize) * tileSize;

        for (let x = startX; x <= endX; x += tileSize) {
          for (let y = startY; y <= endY; y += tileSize) {
            ctx.drawImage(bgImageRef.current, x, y, tileSize, tileSize);
          }
        }
      }

      const gridSize = 100;
      const startX = Math.floor((camera.x - viewWidth / 2) / gridSize) * gridSize;
      const startY = Math.floor((camera.y - viewHeight / 2) / gridSize) * gridSize;
      const endX = Math.ceil((camera.x + viewWidth / 2) / gridSize) * gridSize;
      const endY = Math.ceil((camera.y + viewHeight / 2) / gridSize) * gridSize;

      ctx.strokeStyle = 'rgba(21, 184, 122, 0.1)';
      ctx.lineWidth = 1;
      for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }

      gameState.pickups.forEach((pickup) => {
        const radius = pickup.type === 'small' ? 6 : pickup.type === 'medium' ? 10 : 14;
        const color = pickup.type === 'small' ? '#4ade80' : pickup.type === 'medium' ? '#fbbf24' : '#f87171';

        ctx.beginPath();
        ctx.arc(pickup.position.x, pickup.position.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pickup.position.x, pickup.position.y, radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });

      const renderSnake = (snake: Snake, isPlayer: boolean) => {
        if (!snake.alive) return;

        const baseColor = isPlayer ? '#15b87a' : '#6366f1';
        const glowColor = isPlayer ? 'rgba(21, 184, 122, 0.4)' : 'rgba(99, 102, 241, 0.4)';

        for (let i = snake.segments.length - 1; i >= 0; i--) {
          const segment = snake.segments[i];
          const radius = i === 0 ? HEAD_RADIUS : HEAD_RADIUS * 0.85;

          ctx.beginPath();
          ctx.arc(segment.x, segment.y, radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = glowColor;
          ctx.fill();

          const gradient = ctx.createRadialGradient(
            segment.x - radius * 0.3,
            segment.y - radius * 0.3,
            0,
            segment.x,
            segment.y,
            radius
          );
          gradient.addColorStop(0, isPlayer ? '#22d3a0' : '#818cf8');
          gradient.addColorStop(1, baseColor);

          ctx.beginPath();
          ctx.arc(segment.x, segment.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.strokeStyle = isPlayer ? '#0d9668' : '#4338ca';
          ctx.lineWidth = 2;
          ctx.stroke();

          if (i === 0) {
            const eyeOffsetX = Math.cos(snake.angle) * (HEAD_RADIUS * 0.4);
            const eyeOffsetY = Math.sin(snake.angle) * (HEAD_RADIUS * 0.4);
            const eyeSpread = HEAD_RADIUS * 0.35;
            const perpX = -Math.sin(snake.angle) * eyeSpread;
            const perpY = Math.cos(snake.angle) * eyeSpread;

            [
              { x: segment.x + eyeOffsetX + perpX, y: segment.y + eyeOffsetY + perpY },
              { x: segment.x + eyeOffsetX - perpX, y: segment.y + eyeOffsetY - perpY },
            ].forEach((eye) => {
              ctx.beginPath();
              ctx.arc(eye.x, eye.y, HEAD_RADIUS * 0.2, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();

              ctx.beginPath();
              ctx.arc(eye.x, eye.y, HEAD_RADIUS * 0.1, 0, Math.PI * 2);
              ctx.fillStyle = '#000000';
              ctx.fill();
            });
          }
        }
      };

      gameState.aiSnakes.forEach((snake) => renderSnake(snake, false));
      renderSnake(gameState.player, true);

      ctx.restore();
    };

    render();
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="snake-canvas"
    />
  );
}
