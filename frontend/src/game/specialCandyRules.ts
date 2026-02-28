import { type Candy, type Match, type Position, type SpecialType } from './types';
import { createCandy } from './boardGeneration';

// Determine what special candy to create from a match
export function determineSpecialCandy(match: Match): { special: SpecialType; position: Position } | null {
  if (match.length === 5) {
    // Color bomb for 5-match
    return {
      special: 'color-bomb',
      position: match.positions[Math.floor(match.positions.length / 2)],
    };
  } else if (match.length === 4) {
    // Striped candy for 4-match
    const special: SpecialType = match.isHorizontal ? 'striped-h' : 'striped-v';
    return {
      special,
      position: match.positions[Math.floor(match.positions.length / 2)],
    };
  }
  
  // Check for wrapped pattern (L or T shape)
  // For simplicity, we'll create wrapped candies less frequently
  // This would require more complex pattern detection
  
  return null;
}

// Apply special candy creation to board
export function applySpecialCreation(
  board: (Candy | null)[][],
  match: Match,
  specialInfo: { special: SpecialType; position: Position }
): (Candy | null)[][] {
  const newBoard = board.map(row => [...row]);
  const { special, position } = specialInfo;
  
  // Clear all matched positions except the special one
  match.positions.forEach(pos => {
    if (pos.row !== position.row || pos.col !== position.col) {
      newBoard[pos.row][pos.col] = null;
    }
  });
  
  // Create special candy at the designated position
  const candy = newBoard[position.row][position.col];
  if (candy) {
    candy.special = special;
  }
  
  return newBoard;
}
