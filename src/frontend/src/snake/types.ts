export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export interface SnakeGameState {
  snake: Position[];
  direction: Direction;
  nextDirection: Direction;
  food: Position;
  score: number;
  status: GameStatus;
  speed: number;
}
