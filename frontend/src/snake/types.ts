// Arena-based continuous movement snake game types

export interface Vector2 {
  x: number;
  y: number;
}

export type GameStatus = 'menu' | 'idle' | 'playing' | 'paused' | 'gameOver';

export type PickupType = 'small' | 'medium' | 'large' | 'coin';

export interface Pickup {
  id: string;
  position: Vector2;
  type: PickupType;
  radius: number;
  value: number;
  growthAmount: number;
}

export interface Snake {
  id: string;
  segments: Vector2[];
  angle: number;
  speed: number;
  score: number;
  isPlayer: boolean;
  alive: boolean;
  color: string;
  targetAngle?: number;
  aiState?: {
    targetPickup?: string;
    avoidanceVector?: Vector2;
  };
}

export interface MissionState {
  coinsCollected: number;
  coinsTarget: number;
  timeRemaining: number;
  isComplete: boolean;
}

export interface SnakeGameState {
  player: Snake;
  aiSnakes: Snake[];
  pickups: Pickup[];
  status: GameStatus;
  worldSize: { width: number; height: number };
  camera: { x: number; y: number };
  coins: number;
  mission: MissionState;
}
