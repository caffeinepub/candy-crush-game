import { useRef, useEffect } from 'react';
import { SnakeGameState } from './types';
import { WZ_ASSETS } from './wzAssets';

interface SnakeMinimapProps {
  gameState: SnakeGameState;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
}

export default function SnakeMinimap({ gameState, viewportWidth, viewportHeight, zoom }: SnakeMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 120;
    canvas.width = size;
    canvas.height = size;

    const worldWidth = gameState.worldSize.width;
    const worldHeight = gameState.worldSize.height;
    const scale = size / Math.max(worldWidth, worldHeight);

    // Clear
    ctx.fillStyle = 'rgba(20, 30, 60, 0.8)';
    ctx.fillRect(0, 0, size, size);

    // Draw AI snakes
    ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
    gameState.aiSnakes.forEach((snake) => {
      const x = (snake.segments[0].x / worldWidth) * size;
      const y = (snake.segments[0].y / worldHeight) * size;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player
    ctx.fillStyle = 'rgba(100, 255, 100, 1)';
    const px = (gameState.player.segments[0].x / worldWidth) * size;
    const py = (gameState.player.segments[0].y / worldHeight) * size;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw viewport indicator (subtle)
    const viewWidth = viewportWidth / zoom;
    const viewHeight = viewportHeight / zoom;
    const vw = (viewWidth / worldWidth) * size;
    const vh = (viewHeight / worldHeight) * size;
    const vx = px - vw / 2;
    const vy = py - vh / 2;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(vx, vy, vw, vh);
  }, [gameState, viewportWidth, viewportHeight, zoom]);

  return (
    <div className="snake-minimap">
      <div className="snake-minimap-frame" style={{ backgroundImage: `url(${WZ_ASSETS.minimapFrame})` }}>
        <canvas ref={canvasRef} className="snake-minimap-canvas" />
      </div>
    </div>
  );
}
