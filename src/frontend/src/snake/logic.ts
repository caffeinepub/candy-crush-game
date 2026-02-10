import { Position, Direction } from './types';

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const MIN_SPEED = 50;

export function generateInitialSnake(): Position[] {
  const centerX = Math.floor(GRID_SIZE / 2);
  const centerY = Math.floor(GRID_SIZE / 2);
  return [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];
}

export function generateFood(snake: Position[]): Position {
  const occupiedPositions = new Set(snake.map(pos => `${pos.x},${pos.y}`));
  
  let food: Position;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    attempts++;
  } while (occupiedPositions.has(`${food.x},${food.y}`) && attempts < maxAttempts);
  
  return food;
}

export function getNextPosition(head: Position, direction: Direction): Position {
  switch (direction) {
    case 'UP':
      return { x: head.x, y: head.y - 1 };
    case 'DOWN':
      return { x: head.x, y: head.y + 1 };
    case 'LEFT':
      return { x: head.x - 1, y: head.y };
    case 'RIGHT':
      return { x: head.x + 1, y: head.y };
  }
}

export function isValidDirection(current: Direction, next: Direction): boolean {
  if (current === 'UP' && next === 'DOWN') return false;
  if (current === 'DOWN' && next === 'UP') return false;
  if (current === 'LEFT' && next === 'RIGHT') return false;
  if (current === 'RIGHT' && next === 'LEFT') return false;
  return true;
}

export function checkCollision(position: Position, snake: Position[]): boolean {
  // Check wall collision
  if (position.x < 0 || position.x >= GRID_SIZE || position.y < 0 || position.y >= GRID_SIZE) {
    return true;
  }
  
  // Check self collision (skip head)
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === position.x && snake[i].y === position.y) {
      return true;
    }
  }
  
  return false;
}

export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}
