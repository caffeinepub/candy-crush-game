export interface GameState {
  coinBalance: number;
  unlockedVehicles: string[];
  upgradeLevels: Record<string, number>;
  dailyClaimHistory: string[];
  unlockedPhotos: string[];
  lastUpdated?: number;
}

const STORAGE_KEY = 'hillclimb_game_state';

export function loadGameState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration: ensure unlockedPhotos exists and photo-1 is unlocked by default
      if (!parsed.unlockedPhotos) {
        parsed.unlockedPhotos = ['photo-1'];
      } else if (!parsed.unlockedPhotos.includes('photo-1')) {
        parsed.unlockedPhotos = ['photo-1', ...parsed.unlockedPhotos];
      }
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load game state:', error);
  }
  
  return {
    coinBalance: 0,
    unlockedVehicles: [],
    upgradeLevels: {},
    dailyClaimHistory: [],
    unlockedPhotos: ['photo-1'], // Photo 1 is free by default
    lastUpdated: Date.now()
  };
}

export function saveGameState(state: GameState) {
  try {
    const toSave = { ...state, lastUpdated: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}
