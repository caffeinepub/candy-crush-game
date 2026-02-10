import { BOARD_SIZE, type Position } from './types';

// Check if two positions are adjacent
export function areAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// Check if position is valid
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

// Get adjacent position based on direction
export function getAdjacentPosition(pos: Position, direction: 'up' | 'down' | 'left' | 'right'): Position | null {
  const newPos = { ...pos };
  
  switch (direction) {
    case 'up':
      newPos.row--;
      break;
    case 'down':
      newPos.row++;
      break;
    case 'left':
      newPos.col--;
      break;
    case 'right':
      newPos.col++;
      break;
  }
  
  return isValidPosition(newPos) ? newPos : null;
}
