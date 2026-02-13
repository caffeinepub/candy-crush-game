import { Button } from '@/components/ui/button';

interface OverlayProps {
  onAction: () => void;
  score?: number;
  length?: number;
}

export function IdleOverlay({ onAction }: OverlayProps) {
  return (
    <div className="snake-overlay">
      <div className="snake-overlay-content">
        <h2 className="snake-overlay-title">Snake Arena</h2>
        <p className="snake-overlay-text">
          Collect food to grow. Eliminate opponents by making them hit your body. Survive and dominate the arena!
        </p>
        <Button onClick={onAction} size="lg" className="snake-overlay-button">
          Start Game
        </Button>
      </div>
    </div>
  );
}

export function PauseOverlay({ onAction }: OverlayProps) {
  return (
    <div className="snake-overlay">
      <div className="snake-overlay-content">
        <h2 className="snake-overlay-title">Paused</h2>
        <p className="snake-overlay-text">Take a break. The arena awaits your return.</p>
        <Button onClick={onAction} size="lg" className="snake-overlay-button">
          Resume
        </Button>
      </div>
    </div>
  );
}

export function GameOverOverlay({ onAction, score = 0, length = 0 }: OverlayProps) {
  return (
    <div className="snake-overlay">
      <div className="snake-overlay-content">
        <h2 className="snake-overlay-title">Game Over</h2>
        <div className="snake-overlay-stats">
          <div className="snake-overlay-stat">
            <span className="snake-overlay-stat-label">Final Score</span>
            <span className="snake-overlay-stat-value">{score}</span>
          </div>
          <div className="snake-overlay-stat">
            <span className="snake-overlay-stat-label">Final Length</span>
            <span className="snake-overlay-stat-value">{length}</span>
          </div>
        </div>
        <p className="snake-overlay-text">You were eliminated in the arena. Try again!</p>
        <Button onClick={onAction} size="lg" className="snake-overlay-button">
          Play Again
        </Button>
      </div>
    </div>
  );
}
