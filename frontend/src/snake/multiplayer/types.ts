import { Vector2 } from '../types';

export interface MultiplayerSnake {
  id: string;
  nickname: string;
  segments: Vector2[];
  angle: number;
  score: number;
  color: string;
  isLocalPlayer: boolean;
}

export interface MultiplayerGameState {
  snakes: MultiplayerSnake[];
  pickups: Array<{ position: Vector2; type: string; radius: number }>;
  worldSize: { width: number; height: number };
  timeRemaining: number;
}

export interface RoomInfo {
  roomId: string;
  roomCode: string;
  playerCount: number;
}
