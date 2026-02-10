import { generateInitialBoard } from './boardGeneration';
import { hasLegalMoves } from './legalMoves';
import { type Candy } from './types';

// Reshuffle the board until it has legal moves
export function reshuffleBoard(currentBoard: (Candy | null)[][]): (Candy | null)[][] {
  let newBoard = generateInitialBoard();
  let attempts = 0;
  
  while (!hasLegalMoves(newBoard) && attempts < 10) {
    newBoard = generateInitialBoard();
    attempts++;
  }
  
  return newBoard;
}
