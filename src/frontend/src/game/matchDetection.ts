import { BOARD_SIZE, type Candy, type Position, type Match } from './types';

// Find all matches on the board
export function findMatches(board: (Candy | null)[][]): Match[] {
  const matches: Match[] = [];
  const processed = new Set<string>();

  // Helper to create position key
  const posKey = (row: number, col: number) => `${row},${col}`;

  // Check horizontal matches
  for (let row = 0; row < BOARD_SIZE; row++) {
    let matchStart = 0;
    
    for (let col = 1; col <= BOARD_SIZE; col++) {
      const current = col < BOARD_SIZE ? board[row][col] : null;
      const previous = board[row][col - 1];
      
      if (!current || !previous || current.type !== previous.type || current.special === 'color-bomb' || previous.special === 'color-bomb') {
        // End of potential match
        const matchLength = col - matchStart;
        if (matchLength >= 3 && previous) {
          const positions: Position[] = [];
          for (let c = matchStart; c < col; c++) {
            if (!processed.has(posKey(row, c))) {
              positions.push({ row, col: c });
            }
          }
          if (positions.length >= 3) {
            matches.push({
              positions,
              type: previous.type,
              length: positions.length,
              isHorizontal: true,
            });
            positions.forEach(p => processed.add(posKey(p.row, p.col)));
          }
        }
        matchStart = col;
      }
    }
  }

  // Check vertical matches
  for (let col = 0; col < BOARD_SIZE; col++) {
    let matchStart = 0;
    
    for (let row = 1; row <= BOARD_SIZE; row++) {
      const current = row < BOARD_SIZE ? board[row][col] : null;
      const previous = board[row - 1][col];
      
      if (!current || !previous || current.type !== previous.type || current.special === 'color-bomb' || previous.special === 'color-bomb') {
        const matchLength = row - matchStart;
        if (matchLength >= 3 && previous) {
          const positions: Position[] = [];
          for (let r = matchStart; r < row; r++) {
            positions.push({ row: r, col });
          }
          if (positions.length >= 3) {
            matches.push({
              positions,
              type: previous.type,
              length: positions.length,
              isHorizontal: false,
            });
          }
        }
        matchStart = row;
      }
    }
  }

  return matches;
}

// Check if a swap would create a match
export function wouldCreateMatch(
  board: (Candy | null)[][],
  pos1: Position,
  pos2: Position
): boolean {
  // Create temporary board with swap
  const tempBoard = board.map(row => [...row]);
  const temp = tempBoard[pos1.row][pos1.col];
  tempBoard[pos1.row][pos1.col] = tempBoard[pos2.row][pos2.col];
  tempBoard[pos2.row][pos2.col] = temp;

  // Check for matches
  const matches = findMatches(tempBoard);
  return matches.length > 0;
}
