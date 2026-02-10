import { useState, useEffect, useRef, useCallback } from 'react';
import { SnakeGameState, Direction } from './types';
import {
  generateInitialSnake,
  generateFood,
  getNextPosition,
  isValidDirection,
  checkCollision,
  positionsEqual,
  INITIAL_SPEED,
  SPEED_INCREMENT,
  MIN_SPEED,
} from './logic';

export function useSnakeGame() {
  const [gameState, setGameState] = useState<SnakeGameState>(() => {
    const initialSnake = generateInitialSnake();
    return {
      snake: initialSnake,
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      food: generateFood(initialSnake),
      score: 0,
      status: 'idle',
      speed: INITIAL_SPEED,
    };
  });

  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const gameLoop = useCallback((timestamp: number) => {
    const state = gameStateRef.current;
    
    if (state.status !== 'playing') {
      return;
    }

    const elapsed = timestamp - lastUpdateRef.current;

    if (elapsed >= state.speed) {
      lastUpdateRef.current = timestamp;

      // Update direction
      const currentDirection = state.nextDirection;
      const head = state.snake[0];
      const nextPos = getNextPosition(head, currentDirection);

      // Check collision
      if (checkCollision(nextPos, state.snake)) {
        setGameState(prev => ({ ...prev, status: 'gameOver' }));
        return;
      }

      // Check food
      const ateFood = positionsEqual(nextPos, state.food);
      const newSnake = [nextPos, ...state.snake];
      
      if (!ateFood) {
        newSnake.pop();
      }

      const newState: Partial<SnakeGameState> = {
        snake: newSnake,
        direction: currentDirection,
      };

      if (ateFood) {
        newState.food = generateFood(newSnake);
        newState.score = state.score + 10;
        newState.speed = Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT);
      }

      setGameState(prev => ({ ...prev, ...newState }));
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    if (gameState.status === 'playing') {
      lastUpdateRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    return () => {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState.status, gameLoop]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const restartGame = useCallback(() => {
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    const initialSnake = generateInitialSnake();
    setGameState({
      snake: initialSnake,
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      food: generateFood(initialSnake),
      score: 0,
      status: 'playing',
      speed: INITIAL_SPEED,
    });
    
    lastUpdateRef.current = 0;
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState(prev => {
      if (isValidDirection(prev.direction, newDirection)) {
        return { ...prev, nextDirection: newDirection };
      }
      return prev;
    });
  }, []);

  return {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    changeDirection,
  };
}
