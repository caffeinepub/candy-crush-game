import { Button } from '@/components/ui/button';

interface PauseOverlayProps {
  onAction: () => void;
}

export function PauseOverlay({ onAction }: PauseOverlayProps) {
  return (
    <div className="snake-overlay">
      <div className="snake-overlay-content">
        <h2 className="snake-overlay-title">Paused</h2>
        <p className="snake-overlay-text">Game is paused. Click Resume to continue.</p>
        <Button onClick={onAction} size="lg" className="snake-overlay-button">
          Resume
        </Button>
      </div>
    </div>
  );
}

interface GameOverOverlayProps {
  onAction: () => void;
  score: number;
  length: number;
}

export function GameOverOverlay({ onAction, score, length }: GameOverOverlayProps) {
  return (
    <div className="snake-overlay">
      <div className="snake-overlay-content">
        <h2 className="snake-overlay-title">Game Over</h2>
        <div className="snake-overlay-stats">
          <div className="snake-overlay-stat">
            <span className="snake-overlay-stat-label">Score</span>
            <span className="snake-overlay-stat-value">{score}</span>
          </div>
          <div className="snake-overlay-stat">
            <span className="snake-overlay-stat-label">Length</span>
            <span className="snake-overlay-stat-value">{length}</span>
          </div>
        </div>
        <Button onClick={onAction} size="lg" className="snake-overlay-button">
          Play Again
        </Button>
      </div>
    </div>
  );
}
