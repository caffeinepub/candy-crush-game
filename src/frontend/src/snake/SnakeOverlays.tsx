import { Button } from '@/components/ui/button';
import { Play, RotateCcw } from 'lucide-react';

interface GameOverOverlayProps {
  score: number;
  onRestart: () => void;
}

export function GameOverOverlay({ score, onRestart }: GameOverOverlayProps) {
  return (
    <div className="game-overlay">
      <div className="game-overlay-content">
        <div className="game-overlay-icon game-overlay-icon-fail">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <h2 className="game-overlay-title">Game Over!</h2>
        <p className="game-overlay-text">Final Score: {score}</p>
        <Button onClick={onRestart} className="game-overlay-button" size="lg">
          <RotateCcw className="mr-2" size={20} />
          Restart
        </Button>
      </div>
    </div>
  );
}

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
}

export function PauseOverlay({ onResume, onRestart }: PauseOverlayProps) {
  return (
    <div className="game-overlay">
      <div className="game-overlay-content">
        <div className="game-overlay-icon game-overlay-icon-success">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        </div>
        <h2 className="game-overlay-title">Paused</h2>
        <div className="flex flex-col gap-3 mt-6">
          <Button onClick={onResume} className="game-overlay-button" size="lg">
            <Play className="mr-2" size={20} />
            Resume
          </Button>
          <Button onClick={onRestart} variant="outline" size="lg">
            <RotateCcw className="mr-2" size={20} />
            Restart
          </Button>
        </div>
      </div>
    </div>
  );
}

interface IdleOverlayProps {
  onStart: () => void;
}

export function IdleOverlay({ onStart }: IdleOverlayProps) {
  return (
    <div className="game-overlay">
      <div className="game-overlay-content">
        <div className="game-overlay-icon game-overlay-icon-success">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
          </svg>
        </div>
        <h2 className="game-overlay-title">Snake Game</h2>
        <p className="game-overlay-text mb-4">Use arrow keys, WASD, or on-screen arrows to control the snake</p>
        <Button onClick={onStart} className="game-overlay-button" size="lg">
          <Play className="mr-2" size={20} />
          Start Game
        </Button>
      </div>
    </div>
  );
}
