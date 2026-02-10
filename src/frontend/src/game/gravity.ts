import { BOARD_SIZE, type Candy, type Position } from './types';

export interface FallInfo {
  from: Position;
  to: Position;
  candy: Candy;
}

// Apply gravity to the board and return fall information
export function applyGravity(board: (Candy | null)[][]): {
  newBoard: (Candy | null)[][];
  falls: FallInfo[];
} {
  const newBoard = board.map(row => [...row]);
  const falls: FallInfo[] = [];
  
  // Process each column from bottom to top
  for (let col = 0; col < BOARD_SIZE; col++) {
    let writeRow = BOARD_SIZE - 1;
    
    // First pass: move existing candies down
    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col]) {
        if (row !== writeRow) {
          falls.push({
            from: { row, col },
            to: { row: writeRow, col },
            candy: newBoard[row][col]!,
          });
          newBoard[writeRow][col] = newBoard[row][col];
          newBoard[row][col] = null;
        }
        writeRow--;
      }
    }
  }
  
  return { newBoard, falls };
}
