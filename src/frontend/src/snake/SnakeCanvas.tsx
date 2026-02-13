import { useRef, useEffect } from 'react';
import { SnakeGameState } from './types';
import { WZ_ASSETS } from './wzAssets';
import { getFoodSprite, getPickupRenderSize } from './pickupSprites';

interface SnakeCanvasProps {
  gameState: SnakeGameState;
  viewportWidth: number;
  viewportHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  dpr: number;
  zoom: number;
}

// Helper to load and cache images
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): HTMLImageElement {
  if (!imageCache.has(src)) {
    const img = new Image();
    img.src = src;
    imageCache.set(src, img);
  }
  return imageCache.get(src)!;
}

export default function SnakeCanvas({
  gameState,
  viewportWidth,
  viewportHeight,
  canvasWidth,
  canvasHeight,
  dpr,
  zoom,
}: SnakeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(gameState);
  const viewportRef = useRef({ viewportWidth, viewportHeight, canvasWidth, canvasHeight, dpr, zoom });
  const rafRef = useRef<number | null>(null);

  // Update refs on every render
  stateRef.current = gameState;
  viewportRef.current = { viewportWidth, viewportHeight, canvasWidth, canvasHeight, dpr, zoom };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Load images
    const bgImage = loadImage(WZ_ASSETS.arenaBgTile);
    const foodSpritesImage = loadImage(WZ_ASSETS.foodSprites);
    const coinImage = loadImage(WZ_ASSETS.coinIcon);

    const render = () => {
      const state = stateRef.current;
      const { viewportWidth, viewportHeight, canvasWidth, canvasHeight, dpr, zoom } = viewportRef.current;

      if (!ctx || !canvas) return;

      // Set canvas backing store size for DPR-crisp rendering
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Scale context for DPR
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);

      // Camera follows player (head segment)
      const camera = {
        x: state.player.segments[0].x,
        y: state.player.segments[0].y,
      };

      const worldWidth = state.worldSize.width;
      const worldHeight = state.worldSize.height;

      // Viewport in world units
      const viewWidth = viewportWidth / zoom;
      const viewHeight = viewportHeight / zoom;

      // Helper: wrap coordinate for toroidal rendering
      const wrapX = (x: number) => ((x % worldWidth) + worldWidth) % worldWidth;
      const wrapY = (y: number) => ((y % worldHeight) + worldHeight) % worldHeight;

      // Helper: convert world position to screen position with wrapping
      const worldToScreen = (wx: number, wy: number) => {
        let dx = wx - camera.x;
        let dy = wy - camera.y;

        // Wrap around for shortest distance
        if (dx > worldWidth / 2) dx -= worldWidth;
        if (dx < -worldWidth / 2) dx += worldWidth;
        if (dy > worldHeight / 2) dy -= worldHeight;
        if (dy < -worldHeight / 2) dy += worldHeight;

        return {
          x: (viewportWidth / 2 + dx * zoom),
          y: (viewportHeight / 2 + dy * zoom),
        };
      };

      // Draw tiled background with seamless wrapping
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

      // Draw very subtle grid overlay (minimal visual clutter)
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

      // Helper: parse color to hue (for gradient generation)
      const getHueFromColor = (color: string): number => {
        // Simple hash-based hue generation from color string
        const hash = color.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (hash * 137.5) % 360;
      };

      // Helper: calculate radius based on snake length
      const getSnakeRadius = (segmentCount: number): number => {
        return 8 + Math.min(segmentCount * 0.3, 20);
      };

      // Helper: draw worm segment with wrapping
      const drawWormSegment = (
        x: number,
        y: number,
        radius: number,
        hue: number,
        isHead = false
      ) => {
        // Draw main segment
        const screen = worldToScreen(x, y);
        const gradient = ctx.createRadialGradient(screen.x, screen.y, 0, screen.x, screen.y, radius * zoom);
        gradient.addColorStop(0, `hsl(${hue}, 80%, 70%)`);
        gradient.addColorStop(0.7, `hsl(${hue}, 70%, 50%)`);
        gradient.addColorStop(1, `hsl(${hue}, 60%, 30%)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, radius * zoom, 0, Math.PI * 2);
        ctx.fill();

        // Outline
        ctx.strokeStyle = `hsl(${hue}, 50%, 20%)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Eyes for head
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

        // Handle wrapping: draw duplicates near edges
        const margin = radius * 2;
        if (x < margin) {
          const wrapScreen = worldToScreen(x + worldWidth, y);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(wrapScreen.x, wrapScreen.y, radius * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `hsl(${hue}, 50%, 20%)`;
          ctx.stroke();
        }
        if (x > worldWidth - margin) {
          const wrapScreen = worldToScreen(x - worldWidth, y);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(wrapScreen.x, wrapScreen.y, radius * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `hsl(${hue}, 50%, 20%)`;
          ctx.stroke();
        }
        if (y < margin) {
          const wrapScreen = worldToScreen(x, y + worldHeight);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(wrapScreen.x, wrapScreen.y, radius * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `hsl(${hue}, 50%, 20%)`;
          ctx.stroke();
        }
        if (y > worldHeight - margin) {
          const wrapScreen = worldToScreen(x, y - worldHeight);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(wrapScreen.x, wrapScreen.y, radius * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `hsl(${hue}, 50%, 20%)`;
          ctx.stroke();
        }
      };

      // Draw AI snakes
      state.aiSnakes.forEach((snake) => {
        const radius = getSnakeRadius(snake.segments.length);
        const hue = getHueFromColor(snake.color);
        snake.segments.forEach((seg, i) => {
          drawWormSegment(seg.x, seg.y, radius, hue, i === 0);
        });
      });

      // Draw player snake
      const playerRadius = getSnakeRadius(state.player.segments.length);
      const playerHue = getHueFromColor(state.player.color);
      state.player.segments.forEach((seg, i) => {
        drawWormSegment(seg.x, seg.y, playerRadius, playerHue, i === 0);
      });

      // Draw pickups with wrapping
      state.pickups.forEach((pickup) => {
        const screen = worldToScreen(pickup.position.x, pickup.position.y);
        const size = getPickupRenderSize(pickup.type);

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
          const sprite = getFoodSprite(pickup.type);
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

        // Handle wrapping for pickups
        const margin = size;
        if (pickup.position.x < margin) {
          const wrapScreen = worldToScreen(pickup.position.x + worldWidth, pickup.position.y);
          if (pickup.type === 'coin' && coinImage.complete) {
            ctx.drawImage(
              coinImage,
              wrapScreen.x - (size * zoom) / 2,
              wrapScreen.y - (size * zoom) / 2,
              size * zoom,
              size * zoom
            );
          } else if (foodSpritesImage.complete) {
            const sprite = getFoodSprite(pickup.type);
            ctx.drawImage(
              foodSpritesImage,
              sprite.x,
              sprite.y,
              sprite.width,
              sprite.height,
              wrapScreen.x - (size * zoom) / 2,
              wrapScreen.y - (size * zoom) / 2,
              size * zoom,
              size * zoom
            );
          }
        }
        if (pickup.position.x > worldWidth - margin) {
          const wrapScreen = worldToScreen(pickup.position.x - worldWidth, pickup.position.y);
          if (pickup.type === 'coin' && coinImage.complete) {
            ctx.drawImage(
              coinImage,
              wrapScreen.x - (size * zoom) / 2,
              wrapScreen.y - (size * zoom) / 2,
              size * zoom,
              size * zoom
            );
          } else if (foodSpritesImage.complete) {
            const sprite = getFoodSprite(pickup.type);
            ctx.drawImage(
              foodSpritesImage,
              sprite.x,
              sprite.y,
              sprite.width,
              sprite.height,
              wrapScreen.x - (size * zoom) / 2,
              wrapScreen.y - (size * zoom) / 2,
              size * zoom,
              size * zoom
            );
          }
        }
        if (pickup.position.y < margin) {
          const wrapScreen = worldToScreen(pickup.position.x, pickup.position.y + worldHeight);
          if (pickup.type === 'coin' && coinImage.complete) {
            ctx.drawImage(
              coinImage,
              wrapScreen.x - (size * zoom) / 2,
              wrapScreen.y - (size * zoom) / 2,
              size * zoom,
              size * zoom
            );
          } else if (foodSpritesImage.complete) {
            const sprite = getFoodSprite(pickup.type);
            ctx.drawImage(
              foodSpritesImage,
              sprite.x,
              sprite.y,
              sprite.width,
              sprite.height,
              wrapScreen.x - (size * zoom) / 2,
              wrapScreen.y - (size * zoom) / 2,
              size * zoom,
              size * zoom
            );
          }
        }
        if (pickup.position.y > worldHeight - margin) {
          const wrapScreen = worldToScreen(pickup.position.x, pickup.position.y - worldHeight);
          if (pickup.type === 'coin' && coinImage.complete) {
            ctx.drawImage(
              coinImage,
              wrapScreen.x - (size * zoom) / 2,
              wrapScreen.y - (size * zoom) / 2,
              size * zoom,
              size * zoom
            );
          } else if (foodSpritesImage.complete) {
            const sprite = getFoodSprite(pickup.type);
            ctx.drawImage(
              foodSpritesImage,
              sprite.x,
              sprite.y,
              sprite.width,
              sprite.height,
              wrapScreen.x - (size * zoom) / 2,
              wrapScreen.y - (size * zoom) / 2,
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
  }, []);

  return <canvas ref={canvasRef} className="snake-canvas" />;
}
