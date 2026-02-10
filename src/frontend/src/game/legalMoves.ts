import { BOARD_SIZE, type Candy, type Position } from './types';
import { wouldCreateMatch } from './matchDetection';

// Check if there are any legal moves on the board
export function hasLegalMoves(board: (Candy | null)[][]): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Try swapping with right neighbor
      if (col < BOARD_SIZE - 1) {
        if (wouldCreateMatch(board, { row, col }, { row, col: col + 1 })) {
          return true;
        }
      }
      
      // Try swapping with bottom neighbor
      if (row < BOARD_SIZE - 1) {
        if (wouldCreateMatch(board, { row, col }, { row: row + 1, col })) {
          return true;
        }
      }
    }
  }
  
  return false;
}
