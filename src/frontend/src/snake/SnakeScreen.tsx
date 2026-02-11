import { useEffect } from 'react';
import { useSnakeGame } from './useSnakeGame';
import SnakeCanvas from './SnakeCanvas';
import { GameOverOverlay, PauseOverlay, IdleOverlay } from './SnakeOverlays';
import Joystick from './Joystick';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw, Heart, Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';

export default function SnakeScreen() {
  const { gameState, startGame, pauseGame, resumeGame, restartGame, setJoystickAngle } = useSnakeGame();
  const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen();

  const togglePause = () => {
    if (gameState.status === 'playing') {
      pauseGame();
    } else if (gameState.status === 'paused') {
      resumeGame();
    }
  };

  return (
    <div className="game-screen">
      {/* Header */}
      <header className="game-header">
        <div className="game-header-content">
          <h1 className="game-title">Snake Arena</h1>
          <div className="game-header-actions">
            {gameState.status === 'playing' || gameState.status === 'paused' ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePause}
                  className="game-header-button"
                  aria-label={gameState.status === 'playing' ? 'Pause' : 'Resume'}
                >
                  {gameState.status === 'playing' ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={restartGame}
                  className="game-header-button"
                  aria-label="Restart"
                >
                  <RotateCcw size={20} />
                </Button>
              </>
            ) : null}
            {isSupported && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
                className="game-header-button"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="game-main">
        <div className="game-container">
          {/* HUD */}
          <div className="game-hud snake-hud">
            <div className="game-hud-item">
              <span className="game-hud-label">Score</span>
              <span className="game-hud-value">{gameState.player.score}</span>
            </div>
            <div className="game-hud-item">
              <span className="game-hud-label">Length</span>
              <span className="game-hud-value">{gameState.player.segments.length}</span>
            </div>
            <div className="game-hud-item">
              <span className="game-hud-label">Rank</span>
              <span className="game-hud-value">
                {[gameState.player, ...gameState.aiSnakes]
                  .filter(s => s.alive)
                  .sort((a, b) => b.score - a.score)
                  .findIndex(s => s.id === gameState.player.id) + 1}
              </span>
            </div>
          </div>

          {/* Game Board */}
          <div className="game-board-container snake-board-container">
            <SnakeCanvas gameState={gameState} />
          </div>

          {/* Joystick Control */}
          <Joystick
            onAngleChange={setJoystickAngle}
            disabled={gameState.status !== 'playing'}
          />

          {/* Instructions */}
          <div className="game-instructions">
            <p className="game-instructions-text">
              <strong>Controls:</strong> Use the joystick to steer your snake. Collect points to grow. Eliminate other snakes by making them hit your body!
            </p>
          </div>
        </div>

        {/* Overlays */}
        {gameState.status === 'idle' && <IdleOverlay onStart={startGame} />}
        {gameState.status === 'paused' && (
          <PauseOverlay onResume={resumeGame} onRestart={restartGame} />
        )}
        {gameState.status === 'gameOver' && (
          <GameOverOverlay score={gameState.player.score} length={gameState.player.segments.length} onRestart={restartGame} />
        )}
      </main>

      {/* Footer */}
      <footer className="game-footer">
        <p className="game-footer-text">
          © {new Date().getFullYear()}. Built with{' '}
          <Heart className="inline-block w-4 h-4 text-red-500 fill-current" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname
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
