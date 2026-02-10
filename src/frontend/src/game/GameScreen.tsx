import { useMatch3Game } from './useMatch3Game';
import GameBoard from './GameBoard';
import { GameOverOverlay, LevelCompleteOverlay } from './Overlays';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, RotateCcw, Heart } from 'lucide-react';
import { audioManager } from './audio/audioManager';
import { useState } from 'react';

export default function GameScreen() {
  const { gameState, startNewGame, nextLevel, attemptSwap, selectCell, highlightCell } = useMatch3Game();
  const [muted, setMuted] = useState(false);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    audioManager.setMuted(newMuted);
  };

  return (
    <div className="game-screen">
      {/* Header */}
      <header className="game-header">
        <div className="game-header-content">
          <h1 className="game-title">Candy Crush</h1>
          <div className="game-header-actions">
            <Button variant="outline" size="icon" onClick={toggleMute} className="game-header-button">
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
            <Button variant="outline" size="icon" onClick={startNewGame} className="game-header-button">
              <RotateCcw size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="game-main">
        <div className="game-container">
          {/* HUD */}
          <div className="game-hud">
            <div className="game-hud-item">
              <span className="game-hud-label">Level</span>
              <span className="game-hud-value">{gameState.level}</span>
            </div>
            <div className="game-hud-item">
              <span className="game-hud-label">Score</span>
              <span className="game-hud-value">{gameState.score}</span>
            </div>
            <div className="game-hud-item">
              <span className="game-hud-label">Target</span>
              <span className="game-hud-value">{gameState.targetScore}</span>
            </div>
            <div className="game-hud-item">
              <span className="game-hud-label">Moves</span>
              <span className="game-hud-value">{gameState.moves}</span>
            </div>
          </div>

          {/* Game Board */}
          <div className="game-board-container">
            <GameBoard
              gameState={gameState}
              onSelectCell={selectCell}
              onHighlightCell={highlightCell}
              onAttemptSwap={attemptSwap}
            />
          </div>

          {/* Instructions */}
          <div className="game-instructions">
            <p className="game-instructions-text">
              <strong>How to Play:</strong> Swap adjacent candies to match 3 or more. Match 4 for striped candy, 5 for color bomb!
            </p>
          </div>
        </div>

        {/* Overlays */}
        {gameState.gameOver && (
          <GameOverOverlay score={gameState.score} onRestart={startNewGame} />
        )}
        {gameState.levelComplete && (
          <LevelCompleteOverlay level={gameState.level} score={gameState.score} onNextLevel={nextLevel} />
        )}
      </main>

      {/* Footer */}
      <footer className="game-footer">
        <p className="game-footer-text">
          © 2026. Built with <Heart className="inline-block w-4 h-4 text-red-500 fill-current" /> using{' '}
          <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="game-footer-link">
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
