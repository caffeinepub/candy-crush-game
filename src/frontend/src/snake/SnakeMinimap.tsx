import { useEffect, useRef } from 'react';
import { SnakeGameState } from './types';
import { WORLD_WIDTH, WORLD_HEIGHT } from './logic';
import { WZ_ASSETS } from './wzAssets';

interface SnakeMinimapProps {
  gameState: SnakeGameState;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
}

const MINIMAP_SIZE = 160;

export default function SnakeMinimap({ gameState, viewportWidth, viewportHeight, zoom }: SnakeMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = MINIMAP_SIZE / WORLD_WIDTH;
    const scaleY = MINIMAP_SIZE / WORLD_HEIGHT;

    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw background (no hard boundaries)
    ctx.fillStyle = 'rgba(10, 20, 40, 0.8)';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw player
    const playerX = gameState.player.segments[0].x * scaleX;
    const playerY = gameState.player.segments[0].y * scaleY;
    
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw AI snakes
    gameState.aiSnakes.forEach(snake => {
      if (!snake.alive) return;
      const x = snake.segments[0].x * scaleX;
      const y = snake.segments[0].y * scaleY;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw viewport indicator (subtle, no hard edges)
    const viewWidth = viewportWidth / zoom;
    const viewHeight = viewportHeight / zoom;
    const viewX = (gameState.camera.x - viewWidth / 2) * scaleX;
    const viewY = (gameState.camera.y - viewHeight / 2) * scaleY;
    const viewW = viewWidth * scaleX;
    const viewH = viewHeight * scaleY;

    ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(viewX, viewY, viewW, viewH);
  }, [gameState, viewportWidth, viewportHeight, zoom]);

  return (
    <div className="snake-minimap">
      <div className="snake-minimap-frame" style={{ backgroundImage: `url(${WZ_ASSETS.minimapFrame})` }}>
        <canvas
          ref={canvasRef}
          width={MINIMAP_SIZE}
          height={MINIMAP_SIZE}
          className="snake-minimap-canvas"
        />
      </div>
    </div>
  );
}
