import { BOARD_SIZE, CANDY_TYPES, type Candy, type CandyType } from './types';

// Generate a random candy type
function randomCandyType(): CandyType {
  return Math.floor(Math.random() * CANDY_TYPES) as CandyType;
}

// Generate a unique ID for candy tracking
let candyIdCounter = 0;
function generateCandyId(): string {
  return `candy-${candyIdCounter++}`;
}

// Create a new candy
export function createCandy(type: CandyType): Candy {
  return {
    type,
    special: null,
    id: generateCandyId(),
  };
}

// Check if there's a match at a specific position
function hasMatchAt(board: (Candy | null)[][], row: number, col: number): boolean {
  const candy = board[row][col];
  if (!candy) return false;

  // Check horizontal
  let horizontalCount = 1;
  for (let c = col - 1; c >= 0 && board[row][c]?.type === candy.type; c--) horizontalCount++;
  for (let c = col + 1; c < BOARD_SIZE && board[row][c]?.type === candy.type; c++) horizontalCount++;
  if (horizontalCount >= 3) return true;

  // Check vertical
  let verticalCount = 1;
  for (let r = row - 1; r >= 0 && board[r][col]?.type === candy.type; r--) verticalCount++;
  for (let r = row + 1; r < BOARD_SIZE && board[r][col]?.type === candy.type; r++) verticalCount++;
  if (verticalCount >= 3) return true;

  return false;
}

// Generate initial board without immediate matches
export function generateInitialBoard(): (Candy | null)[][] {
  const board: (Candy | null)[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      let attempts = 0;
      let candyType: CandyType;
      
      do {
        candyType = randomCandyType();
        board[row][col] = createCandy(candyType);
        attempts++;
      } while (hasMatchAt(board, row, col) && attempts < 50);

      // If we can't avoid a match after 50 attempts, just use it
      if (attempts >= 50) {
        board[row][col] = createCandy(candyType);
      }
    }
  }

  return board;
}

// Refill empty cells with new candies
export function refillBoard(board: (Candy | null)[][]): (Candy | null)[][] {
  const newBoard = board.map(row => [...row]);
  
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (!newBoard[row][col]) {
        newBoard[row][col] = createCandy(randomCandyType());
      }
    }
  }
  
  return newBoard;
}
