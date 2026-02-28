import { type Position } from './types';

// Calculate score for cleared candies
export function calculateScore(clearedCount: number, isSpecial: boolean = false): number {
  const baseScore = clearedCount * 10;
  const multiplier = isSpecial ? 2 : 1;
  return baseScore * multiplier;
}

// Calculate target score for a level
export function getTargetScore(level: number): number {
  return 500 + (level - 1) * 300;
}

// Calculate initial moves for a level
export function getInitialMoves(level: number): number {
  return Math.max(15, 25 - level);
}
