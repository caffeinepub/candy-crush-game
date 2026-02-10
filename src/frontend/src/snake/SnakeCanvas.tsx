import { useEffect, useRef } from 'react';
import { SnakeGameState } from './types';
import { GRID_SIZE } from './logic';

interface SnakeCanvasProps {
  gameState: SnakeGameState;
}

const CELL_SIZE = 24;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

export default function SnakeCanvas({ gameState }: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = '#16213e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#ff4757';
    ctx.shadowColor = '#ff4757';
    ctx.shadowBlur = 10;
    const foodX = gameState.food.x * CELL_SIZE;
    const foodY = gameState.food.y * CELL_SIZE;
    ctx.beginPath();
    ctx.arc(
      foodX + CELL_SIZE / 2,
      foodY + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;
      
      if (index === 0) {
        // Head
        ctx.fillStyle = '#2ed573';
        ctx.shadowColor = '#2ed573';
        ctx.shadowBlur = 15;
      } else {
        // Body
        const opacity = 1 - (index / gameState.snake.length) * 0.3;
        ctx.fillStyle = `rgba(46, 213, 115, ${opacity})`;
        ctx.shadowBlur = 5;
      }
      
      ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      ctx.shadowBlur = 0;
    });
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="snake-canvas"
    />
  );
}
