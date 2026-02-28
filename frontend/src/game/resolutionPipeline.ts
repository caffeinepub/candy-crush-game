import { type Candy, type Position, type Match } from './types';
import { findMatches } from './matchDetection';
import { determineSpecialCandy, applySpecialCreation } from './specialCandyRules';
import { getSpecialTargets } from './specialActivations';
import { applyGravity } from './gravity';
import { refillBoard } from './boardGeneration';
import { calculateScore } from './scoring';

export interface ResolutionResult {
  board: (Candy | null)[][];
  scoreGained: number;
  clearedPositions: Position[];
  hadMatches: boolean;
}

// Clear positions from board
function clearPositions(board: (Candy | null)[][], positions: Position[]): (Candy | null)[][] {
  const newBoard = board.map(row => [...row]);
  positions.forEach(pos => {
    newBoard[pos.row][pos.col] = null;
  });
  return newBoard;
}

// Resolve matches and return new board state
export function resolveMatches(board: (Candy | null)[][]): ResolutionResult {
  let currentBoard = board.map(row => [...row]);
  let totalScore = 0;
  let allClearedPositions: Position[] = [];
  let hadMatches = false;

  // Find and resolve matches
  const matches = findMatches(currentBoard);
  
  if (matches.length > 0) {
    hadMatches = true;
    
    for (const match of matches) {
      // Check if we should create a special candy
      const specialInfo = determineSpecialCandy(match);
      
      if (specialInfo) {
        // Create special candy and clear others
        currentBoard = applySpecialCreation(currentBoard, match, specialInfo);
        // Score for the cleared candies (minus the special one)
        totalScore += calculateScore(match.length - 1);
        allClearedPositions.push(...match.positions.filter(
          p => p.row !== specialInfo.position.row || p.col !== specialInfo.position.col
        ));
      } else {
        // Regular match - clear all
        currentBoard = clearPositions(currentBoard, match.positions);
        totalScore += calculateScore(match.length);
        allClearedPositions.push(...match.positions);
      }
    }
  }

  return {
    board: currentBoard,
    scoreGained: totalScore,
    clearedPositions: allClearedPositions,
    hadMatches,
  };
}

// Check for special candy activations in cleared positions
export function checkSpecialActivations(
  board: (Candy | null)[][],
  clearedPositions: Position[]
): { board: (Candy | null)[][]; additionalClears: Position[]; scoreGained: number } {
  let currentBoard = board.map(row => [...row]);
  const additionalClears: Position[] = [];
  let scoreGained = 0;

  for (const pos of clearedPositions) {
    const candy = board[pos.row][pos.col];
    if (candy?.special && candy.special !== null) {
      const targets = getSpecialTargets(board, pos, candy.special);
      targets.forEach(target => {
        if (currentBoard[target.row][target.col]) {
          additionalClears.push(target);
        }
      });
      scoreGained += calculateScore(targets.length, true);
    }
  }

  if (additionalClears.length > 0) {
    currentBoard = clearPositions(currentBoard, additionalClears);
  }

  return { board: currentBoard, additionalClears, scoreGained };
}
