import { useRef, useEffect } from 'react';
import { MultiplayerGameState } from './types';
import { WZ_ASSETS } from '../wzAssets';
import { getFoodSprite, getPickupRenderSize } from '../pickupSprites';

interface MultiplayerSnakeCanvasProps {
  gameState: MultiplayerGameState;
  localPlayerId: string;
  viewportWidth: number;
  viewportHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  dpr: number;
  zoom: number;
}

const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): HTMLImageElement {
  if (!imageCache.has(src)) {
    const img = new Image();
    img.src = src;
    imageCache.set(src, img);
  }
  return imageCache.get(src)!;
}

export default function MultiplayerSnakeCanvas({
  gameState,
  localPlayerId,
  viewportWidth,
  viewportHeight,
  canvasWidth,
  canvasHeight,
  dpr,
  zoom,
}: MultiplayerSnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(gameState);
  const viewportRef = useRef({ viewportWidth, viewportHeight, canvasWidth, canvasHeight, dpr, zoom });
  const rafRef = useRef<number | null>(null);

  stateRef.current = gameState;
  viewportRef.current = { viewportWidth, viewportHeight, canvasWidth, canvasHeight, dpr, zoom };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgImage = loadImage(WZ_ASSETS.arenaBgTile);
    const foodSpritesImage = loadImage(WZ_ASSETS.foodSprites);
    const coinImage = loadImage(WZ_ASSETS.coinIcon);

    const render = () => {
      const state = stateRef.current;
      const { viewportWidth, viewportHeight, canvasWidth, canvasHeight, dpr, zoom } = viewportRef.current;

      if (!ctx || !canvas) return;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      // Find local player for camera
      const localPlayer = state.snakes.find(s => s.id === localPlayerId);
      const camera = localPlayer && localPlayer.segments.length > 0
        ? { x: localPlayer.segments[0].x, y: localPlayer.segments[0].y }
        : { x: state.worldSize.width / 2, y: state.worldSize.height / 2 };

      const worldWidth = state.worldSize.width;
      const worldHeight = state.worldSize.height;
      const viewWidth = viewportWidth / zoom;
      const viewHeight = viewportHeight / zoom;

      const wrapX = (x: number) => ((x % worldWidth) + worldWidth) % worldWidth;
      const wrapY = (y: number) => ((y % worldHeight) + worldHeight) % worldHeight;

      const worldToScreen = (wx: number, wy: number) => {
        let dx = wx - camera.x;
        let dy = wy - camera.y;

        if (dx > worldWidth / 2) dx -= worldWidth;
        if (dx < -worldWidth / 2) dx += worldWidth;
        if (dy > worldHeight / 2) dy -= worldHeight;
        if (dy < -worldHeight / 2) dy += worldHeight;

        return {
          x: viewportWidth / 2 + dx * zoom,
          y: viewportHeight / 2 + dy * zoom,
        };
      };

      // Draw background
      if (bgImage.complete) {
        const tileSize = 512;
        const tilesX = Math.ceil(viewWidth / tileSize) + 2;
        const tilesY = Math.ceil(viewHeight / tileSize) + 2;
        const offsetX = wrapX(camera.x - viewWidth / 2);
        const offsetY = wrapY(camera.y - viewHeight / 2);
        const startTileX = Math.floor(offsetX / tileSize);
        const startTileY = Math.floor(offsetY / tileSize);

        for (let ty = 0; ty < tilesY; ty++) {
          for (let tx = 0; tx < tilesX; tx++) {
            const tileWorldX = (startTileX + tx) * tileSize;
            const tileWorldY = (startTileY + ty) * tileSize;
            const screen = worldToScreen(tileWorldX, tileWorldY);
            ctx.drawImage(bgImage, screen.x, screen.y, tileSize * zoom, tileSize * zoom);
          }
        }
      }

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      const gridStartX = Math.floor((camera.x - viewWidth / 2) / gridSize) * gridSize;
      const gridStartY = Math.floor((camera.y - viewHeight / 2) / gridSize) * gridSize;
      const gridCountX = Math.ceil(viewWidth / gridSize) + 2;
      const gridCountY = Math.ceil(viewHeight / gridSize) + 2;

      for (let i = 0; i <= gridCountX; i++) {
        const wx = gridStartX + i * gridSize;
        const screen = worldToScreen(wx, camera.y);
        ctx.beginPath();
        ctx.moveTo(screen.x, 0);
        ctx.lineTo(screen.x, viewportHeight);
        ctx.stroke();
      }

      for (let i = 0; i <= gridCountY; i++) {
        const wy = gridStartY + i * gridSize;
        const screen = worldToScreen(camera.x, wy);
        ctx.beginPath();
        ctx.moveTo(0, screen.y);
        ctx.lineTo(viewportWidth, screen.y);
        ctx.stroke();
      }

      const getHueFromColor = (color: string): number => {
        const hash = color.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (hash * 137.5) % 360;
      };

      const getSnakeRadius = (segmentCount: number): number => {
        return 8 + Math.min(segmentCount * 0.3, 20);
      };

      const drawWormSegment = (x: number, y: number, radius: number, hue: number, isHead = false) => {
        const screen = worldToScreen(x, y);
        const gradient = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, radius * zoom);
        gradient.addColorStop(0, `hsl(${hue}, 80%, 70%)`);
        gradient.addColorStop(0.7, `hsl(${hue}, 70%, 50%)`);
        gradient.addColorStop(1, `hsl(${hue}, 60%, 30%)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius * zoom, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `hsl(${hue}, 50%, 20%)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (isHead) {
          const eyeOffset = radius * 0.4;
          const eyeSize = radius * 0.25;

          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(screen.x - eyeOffset * zoom, screen.y - eyeOffset * zoom, eyeSize * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(screen.x + eyeOffset * zoom, screen.y - eyeOffset * zoom, eyeSize * zoom, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.arc(screen.x - eyeOffset * zoom, screen.y - eyeOffset * zoom, eyeSize * zoom * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(screen.x + eyeOffset * zoom, screen.y - eyeOffset * zoom, eyeSize * zoom * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      // Draw all snakes
      state.snakes.forEach((snake) => {
        const radius = getSnakeRadius(snake.segments.length);
        const hue = getHueFromColor(snake.color);
        snake.segments.forEach((seg, i) => {
          drawWormSegment(seg.x, seg.y, radius, hue, i === 0);
        });
      });

      // Draw pickups
      state.pickups.forEach((pickup) => {
        const screen = worldToScreen(pickup.position.x, pickup.position.y);
        const size = pickup.radius * 2;

        if (pickup.type === 'coin') {
          if (coinImage.complete) {
            ctx.drawImage(
              coinImage,
              screen.x - (size * zoom) / 2,
              screen.y - (size * zoom) / 2,
              size * zoom,
              size * zoom
            );
          }
        } else {
          const sprite = getFoodSprite(pickup.type as any);
          if (foodSpritesImage.complete) {
            ctx.drawImage(
              foodSpritesImage,
              sprite.x,
              sprite.y,
              sprite.width,
              sprite.height,
              screen.x - (size * zoom) / 2,
              screen.y - (size * zoom) / 2,
              size * zoom,
              size * zoom
            );
          }
        }
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [localPlayerId]);

  return <canvas ref={canvasRef} className="snake-canvas" />;
}
