import { useState, useCallback } from 'react';
import { type GameState, type Position, BOARD_SIZE } from './types';
import CandyTile from './CandyTile';
import { getAdjacentPosition } from './interaction';
import { detectSwipe } from './touchControls';

interface GameBoardProps {
  gameState: GameState;
  onSelectCell: (pos: Position) => void;
  onHighlightCell: (pos: Position | null) => void;
  onAttemptSwap: (pos1: Position, pos2: Position) => void;
}

export default function GameBoard({
  gameState,
  onSelectCell,
  onHighlightCell,
  onAttemptSwap,
}: GameBoardProps) {
  const [touchStart, setTouchStart] = useState<{ pos: Position; x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((pos: Position, e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStart({ pos, x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((pos: Position, e: React.TouchEvent) => {
    e.preventDefault();
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const direction = detectSwipe(touchStart.x, touchStart.y, touch.clientX, touch.clientY);

    if (direction) {
      const adjacentPos = getAdjacentPosition(pos, direction);
      if (adjacentPos) {
        onAttemptSwap(pos, adjacentPos);
      }
    } else {
      // Tap without swipe - select
      onSelectCell(pos);
    }

    setTouchStart(null);
  }, [touchStart, onSelectCell, onAttemptSwap]);

  const isCellClearing = useCallback((pos: Position): boolean => {
    return gameState.animationState.clearing?.some(
      p => p.row === pos.row && p.col === pos.col
    ) ?? false;
  }, [gameState.animationState.clearing]);

  const isCellFalling = useCallback((pos: Position): boolean => {
    return gameState.animationState.falling?.some(
      f => f.to.row === pos.row && f.to.col === pos.col
    ) ?? false;
  }, [gameState.animationState.falling]);

  return (
    <div className="game-board">
      {Array.from({ length: BOARD_SIZE }).map((_, row) => (
        <div key={row} className="game-board-row">
          {Array.from({ length: BOARD_SIZE }).map((_, col) => {
            const pos: Position = { row, col };
            const candy = gameState.board[row][col];
            const isSelected = gameState.selectedCell?.row === row && gameState.selectedCell?.col === col;
            const isHighlighted = gameState.highlightedCell?.row === row && gameState.highlightedCell?.col === col;
            const isClearing = isCellClearing(pos);
            const isFalling = isCellFalling(pos);

            return (
              <CandyTile
                key={`${row}-${col}`}
                candy={candy}
                position={pos}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isClearing={isClearing}
                isFalling={isFalling}
                onClick={() => onSelectCell(pos)}
                onMouseEnter={() => onHighlightCell(pos)}
                onMouseLeave={() => onHighlightCell(null)}
                onTouchStart={(e) => handleTouchStart(pos, e)}
                onTouchEnd={(e) => handleTouchEnd(pos, e)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
