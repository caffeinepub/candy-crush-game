import { useEffect } from 'react';
import { useSnakeGame } from './useSnakeGame';
import SnakeCanvas from './SnakeCanvas';
import { GameOverOverlay, PauseOverlay, IdleOverlay } from './SnakeOverlays';
import DPad from './DPad';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw, Heart } from 'lucide-react';

export default function SnakeScreen() {
  const { gameState, startGame, pauseGame, resumeGame, restartGame, changeDirection } = useSnakeGame();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (gameState.status === 'playing') {
            pauseGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, changeDirection, pauseGame]);

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
          <h1 className="game-title">Snake Game</h1>
          <div className="game-header-actions">
            {gameState.status === 'playing' || gameState.status === 'paused' ? (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePause}
                  className="game-header-button"
                >
                  {gameState.status === 'playing' ? <Pause size={20} /> : <Play size={20} />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={restartGame}
                  className="game-header-button"
                >
                  <RotateCcw size={20} />
                </Button>
              </>
            ) : null}
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
              <span className="game-hud-value">{gameState.score}</span>
            </div>
            <div className="game-hud-item">
              <span className="game-hud-label">Length</span>
              <span className="game-hud-value">{gameState.snake.length}</span>
            </div>
            <div className="game-hud-item">
              <span className="game-hud-label">Speed</span>
              <span className="game-hud-value">{Math.round((200 - gameState.speed) / 10)}</span>
            </div>
          </div>

          {/* Game Board */}
          <div className="game-board-container snake-board-container">
            <SnakeCanvas gameState={gameState} />
          </div>

          {/* On-screen D-pad Controls */}
          <DPad
            onDirectionChange={changeDirection}
            disabled={gameState.status !== 'playing'}
          />

          {/* Instructions */}
          <div className="game-instructions">
            <p className="game-instructions-text">
              <strong>Controls:</strong> Use Arrow Keys, WASD, or on-screen arrows to move. Press Space to pause.
            </p>
          </div>
        </div>

        {/* Overlays */}
        {gameState.status === 'idle' && <IdleOverlay onStart={startGame} />}
        {gameState.status === 'paused' && (
          <PauseOverlay onResume={resumeGame} onRestart={restartGame} />
        )}
        {gameState.status === 'gameOver' && (
          <GameOverOverlay score={gameState.score} onRestart={restartGame} />
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
