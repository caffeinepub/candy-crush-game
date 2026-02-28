import { Button } from '@/components/ui/button';
import { Trophy, XCircle } from 'lucide-react';

interface GameOverOverlayProps {
  score: number;
  onRestart: () => void;
}

export function GameOverOverlay({ score, onRestart }: GameOverOverlayProps) {
  return (
    <div className="game-overlay">
      <div className="game-overlay-content">
        <XCircle className="game-overlay-icon game-overlay-icon-fail" size={64} />
        <h2 className="game-overlay-title">Game Over!</h2>
        <p className="game-overlay-text">Final Score: {score}</p>
        <Button onClick={onRestart} size="lg" className="game-overlay-button">
          Try Again
        </Button>
      </div>
    </div>
  );
}

interface LevelCompleteOverlayProps {
  level: number;
  score: number;
  onNextLevel: () => void;
}

export function LevelCompleteOverlay({ level, score, onNextLevel }: LevelCompleteOverlayProps) {
  return (
    <div className="game-overlay">
      <div className="game-overlay-content">
        <Trophy className="game-overlay-icon game-overlay-icon-success" size={64} />
        <h2 className="game-overlay-title">Level {level} Complete!</h2>
        <p className="game-overlay-text">Score: {score}</p>
        <Button onClick={onNextLevel} size="lg" className="game-overlay-button">
          Next Level
        </Button>
      </div>
    </div>
  );
}
