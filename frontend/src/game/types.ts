// Core game types and constants

export const BOARD_SIZE = 8;
export const CANDY_TYPES = 6;

export type CandyType = 0 | 1 | 2 | 3 | 4 | 5;

export type SpecialType = 'striped-h' | 'striped-v' | 'wrapped' | 'color-bomb' | null;

export interface Candy {
  type: CandyType;
  special: SpecialType;
  id: string; // Unique ID for animation tracking
}

export interface Position {
  row: number;
  col: number;
}

export interface Match {
  positions: Position[];
  type: CandyType;
  length: number;
  isHorizontal: boolean;
}

export interface AnimationState {
  swapping?: { from: Position; to: Position };
  swappingBack?: { from: Position; to: Position };
  clearing?: Position[];
  falling?: Array<{ from: Position; to: Position; candy: Candy }>;
  specialEffect?: {
    type: 'striped-h' | 'striped-v' | 'wrapped' | 'color-bomb';
    position: Position;
    targets?: Position[];
  };
}

export interface GameState {
  board: (Candy | null)[][];
  score: number;
  moves: number;
  level: number;
  targetScore: number;
  gameOver: boolean;
  levelComplete: boolean;
  animating: boolean;
  animationState: AnimationState;
  selectedCell: Position | null;
  highlightedCell: Position | null;
}
