import { BOARD_SIZE, type Candy, type Position } from './types';

export interface SpecialActivation {
  type: 'striped-h' | 'striped-v' | 'wrapped' | 'color-bomb';
  position: Position;
  targets: Position[];
}

// Get all positions that should be cleared by a special candy
export function getSpecialTargets(
  board: (Candy | null)[][],
  position: Position,
  special: 'striped-h' | 'striped-v' | 'wrapped' | 'color-bomb'
): Position[] {
  const targets: Position[] = [];
  
  switch (special) {
    case 'striped-h':
      // Clear entire row
      for (let col = 0; col < BOARD_SIZE; col++) {
        targets.push({ row: position.row, col });
      }
      break;
      
    case 'striped-v':
      // Clear entire column
      for (let row = 0; row < BOARD_SIZE; row++) {
        targets.push({ row, col: position.col });
      }
      break;
      
    case 'wrapped':
      // Clear 3x3 area
      for (let row = Math.max(0, position.row - 1); row <= Math.min(BOARD_SIZE - 1, position.row + 1); row++) {
        for (let col = Math.max(0, position.col - 1); col <= Math.min(BOARD_SIZE - 1, position.col + 1); col++) {
          targets.push({ row, col });
        }
      }
      break;
      
    case 'color-bomb':
      // Clear all candies of the same type
      const candy = board[position.row][position.col];
      if (candy) {
        for (let row = 0; row < BOARD_SIZE; row++) {
          for (let col = 0; col < BOARD_SIZE; col++) {
            const targetCandy = board[row][col];
            if (targetCandy && targetCandy.type === candy.type) {
              targets.push({ row, col });
            }
          }
        }
      }
      break;
  }
  
  return targets;
}

// Check for special combo (e.g., striped + striped)
export function detectSpecialCombo(
  board: (Candy | null)[][],
  pos1: Position,
  pos2: Position
): SpecialActivation | null {
  const candy1 = board[pos1.row][pos1.col];
  const candy2 = board[pos2.row][pos2.col];
  
  if (!candy1 || !candy2) return null;
  
  // Striped + Striped = clear row and column
  if (
    (candy1.special === 'striped-h' || candy1.special === 'striped-v') &&
    (candy2.special === 'striped-h' || candy2.special === 'striped-v')
  ) {
    const targets: Position[] = [];
    
    // Clear entire row
    for (let col = 0; col < BOARD_SIZE; col++) {
      targets.push({ row: pos1.row, col });
    }
    
    // Clear entire column
    for (let row = 0; row < BOARD_SIZE; row++) {
      targets.push({ row, col: pos1.col });
    }
    
    return {
      type: 'striped-h', // Use as identifier for combo
      position: pos1,
      targets,
    };
  }
  
  return null;
}
