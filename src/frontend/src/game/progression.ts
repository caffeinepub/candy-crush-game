import { getTargetScore, getInitialMoves } from './scoring';

export interface LevelConfig {
  level: number;
  targetScore: number;
  moves: number;
}

export function getLevelConfig(level: number): LevelConfig {
  return {
    level,
    targetScore: getTargetScore(level),
    moves: getInitialMoves(level),
  };
}

export function checkLevelComplete(score: number, targetScore: number): boolean {
  return score >= targetScore;
}
