import type { GameState } from '../progression/storage';

export interface DailyChallenge {
  dateKey: string;
  title: string;
  description: string;
  objective: {
    type: 'distance' | 'airtime' | 'coins';
    target: number;
  };
  reward: number;
}

export function getDailyChallenge(): DailyChallenge {
  const today = new Date();
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
  // Deterministic challenge based on date
  const seed = dateKey.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const challengeType = ['distance', 'airtime', 'coins'][seed % 3] as 'distance' | 'airtime' | 'coins';
  
  const challenges = {
    distance: {
      title: 'Long Haul',
      description: 'Travel 500 meters in a single run',
      objective: { type: 'distance' as const, target: 500 },
      reward: 100
    },
    airtime: {
      title: 'High Flyer',
      description: 'Stay airborne for 5 seconds total',
      objective: { type: 'airtime' as const, target: 5 },
      reward: 150
    },
    coins: {
      title: 'Coin Collector',
      description: 'Collect 50 coins in a single run',
      objective: { type: 'coins' as const, target: 50 },
      reward: 120
    }
  };
  
  return {
    dateKey,
    ...challenges[challengeType]
  };
}

export function isDailyChallengeCompleted(gameState: GameState): boolean {
  const challenge = getDailyChallenge();
  return gameState.dailyClaimHistory.includes(challenge.dateKey);
}

export function canClaimDaily(gameState: GameState): boolean {
  // For now, assume completed if claimed (actual completion tracking would need run data)
  return !isDailyChallengeCompleted(gameState);
}
