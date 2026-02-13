import { useRef, useEffect } from 'react';
import { useSnakeGame } from './useSnakeGame';
import SnakeCanvas from './SnakeCanvas';
import SnakeMainMenu from './SnakeMainMenu';
import SnakeHUD from './SnakeHUD';
import SnakeMinimap from './SnakeMinimap';
import SnakeBoosters from './SnakeBoosters';
import SnakeMissionCompleteOverlay from './SnakeMissionCompleteOverlay';
import { GameOverOverlay, PauseOverlay } from './SnakeOverlays';
import Joystick from './Joystick';
import RotateToLandscapeOverlay from './RotateToLandscapeOverlay';
import { useLandscapeOrientation } from './useLandscapeOrientation';
import { useCanvasViewport } from './useCanvasViewport';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw, Maximize, Minimize, Smartphone } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { Heart } from 'lucide-react';

// Reduced zoom for more spacious view
const ZOOM = 0.6;

export default function SnakeScreen() {
  const { 
    gameState, 
    startGame, 
    pauseGame, 
    resumeGame, 
    restartGame, 
    setJoystickAngle, 
    setKeyboardAngle,
    missionCompleteVisible,
    tiltEnabled,
    toggleTilt,
    tiltError,
  } = useSnakeGame();
  const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen();
  const isLandscape = useLandscapeOrientation();
  const playfieldRef = useRef<HTMLDivElement>(null);
  const viewport = useCanvasViewport(playfieldRef);

  const togglePause = () => {
    if (gameState.status === 'playing') {
      pauseGame();
    } else if (gameState.status === 'paused') {
      resumeGame();
    }
  };

  // Keyboard controls (Arrow keys + WASD)
  useEffect(() => {
    const keysPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing') return;
      
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysPressed.add(key);
        updateKeyboardAngle();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        keysPressed.delete(key);
        updateKeyboardAngle();
      }
    };

    const updateKeyboardAngle = () => {
      let dx = 0;
      let dy = 0;

      if (keysPressed.has('arrowup') || keysPressed.has('w')) dy -= 1;
      if (keysPressed.has('arrowdown') || keysPressed.has('s')) dy += 1;
      if (keysPressed.has('arrowleft') || keysPressed.has('a')) dx -= 1;
      if (keysPressed.has('arrowright') || keysPressed.has('d')) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const angle = Math.atan2(dy, dx);
        setKeyboardAngle(angle);
      } else {
        setKeyboardAngle(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.status, setKeyboardAngle]);

  // Show main menu
  if (gameState.status === 'menu') {
    return (
      <div className="game-screen">
        <SnakeMainMenu onStartGame={startGame} />
        
        {/* Footer */}
        <footer className="game-footer">
          <p className="game-footer-text">
            © {new Date().getFullYear()} Built with <Heart size={14} className="inline text-red-500" fill="currentColor" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'snake-arena'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="game-footer-link"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="game-screen game-screen-gameplay" data-orientation={isLandscape ? 'landscape' : 'portrait'}>
      {/* Main Game Area - Full screen during gameplay */}
      <main className="game-main game-main-fullscreen">
        <div className="game-container snake-game-container snake-game-container-fullscreen">
          {/* Rotate to Landscape Overlay */}
          <RotateToLandscapeOverlay visible={!isLandscape} />

          {/* In-game controls overlay (top-right corner) */}
          {(gameState.status === 'playing' || gameState.status === 'paused') && (
            <div className="snake-controls-overlay">
              <Button
                variant="outline"
                size="icon"
                onClick={togglePause}
                className="snake-control-button"
                aria-label={gameState.status === 'playing' ? 'Pause' : 'Resume'}
              >
                {gameState.status === 'playing' ? <Pause size={18} /> : <Play size={18} />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={restartGame}
                className="snake-control-button"
                aria-label="Restart"
              >
                <RotateCcw size={18} />
              </Button>
              {isSupported && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="snake-control-button"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </Button>
              )}
            </div>
          )}

          {/* HUD Overlays */}
          {(gameState.status === 'playing' || gameState.status === 'paused') && (
            <>
              <SnakeHUD gameState={gameState} viewportWidth={viewport.width} viewportHeight={viewport.height} zoom={ZOOM} />
              <SnakeMinimap gameState={gameState} viewportWidth={viewport.width} viewportHeight={viewport.height} zoom={ZOOM} />
              
              {/* Tilt Control Toggle */}
              <div className="snake-tilt-toggle">
                <Button
                  variant={tiltEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleTilt}
                  className="snake-tilt-button"
                  aria-label="Toggle tilt controls"
                >
                  <Smartphone size={14} className="mr-1" />
                  Tilt
                </Button>
                {tiltError && (
                  <div className="snake-tilt-error">{tiltError}</div>
                )}
              </div>
            </>
          )}

          {/* Game Board */}
          <div ref={playfieldRef} className="game-board-container snake-board-container">
            <SnakeCanvas 
              gameState={gameState} 
              viewportWidth={viewport.width}
              viewportHeight={viewport.height}
              canvasWidth={viewport.canvasWidth}
              canvasHeight={viewport.canvasHeight}
              dpr={viewport.dpr}
              zoom={ZOOM}
            />
          </div>

          {/* Boosters */}
          {(gameState.status === 'playing' || gameState.status === 'paused') && (
            <SnakeBoosters />
          )}

          {/* Joystick Control */}
          <div className="snake-joystick">
            <Joystick
              onAngleChange={setJoystickAngle}
              disabled={gameState.status !== 'playing'}
            />
          </div>

          {/* Overlays */}
          {gameState.status === 'paused' && <PauseOverlay onAction={resumeGame} />}
          {gameState.status === 'gameOver' && (
            <GameOverOverlay
              onAction={restartGame}
              score={gameState.player.score}
              length={gameState.player.segments.length}
            />
          )}
          {missionCompleteVisible && <SnakeMissionCompleteOverlay />}
        </div>
      </main>
    </div>
  );
}
