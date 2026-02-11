import { useState, useEffect, useRef, useCallback } from 'react';
import { SnakeGameState, Snake, Pickup } from './types';
import {
  createInitialState,
  updateSnakeMovement,
  checkPickupCollision,
  growSnake,
  checkSnakeCollisions,
  updateAI,
  generatePickups,
  respawnAISnake,
  PICKUP_COUNT,
} from './logic';

// Maximum turn rate per second (radians)
const MAX_TURN_RATE = Math.PI * 2; // 360 degrees per second

// Maximum deltaTime to prevent speed spikes on lag/tab switches
const MAX_DELTA_TIME = 100; // milliseconds (10 fps minimum)

/**
 * Normalizes an angle to the range [-PI, PI]
 */
function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

/**
 * Calculates the shortest angular distance between two angles
 */
function angleDifference(from: number, to: number): number {
  return normalizeAngle(to - from);
}

/**
 * Applies turn rate limiting to prevent instant 180-degree turns
 */
function applyTurnRateLimit(currentAngle: number, targetAngle: number, deltaTime: number): number {
  const maxTurnThisFrame = MAX_TURN_RATE * (deltaTime / 1000);
  const diff = angleDifference(currentAngle, targetAngle);
  
  if (Math.abs(diff) <= maxTurnThisFrame) {
    return targetAngle;
  }
  
  const turnDirection = diff > 0 ? 1 : -1;
  return normalizeAngle(currentAngle + turnDirection * maxTurnThisFrame);
}

export function useSnakeGame() {
  const [gameState, setGameState] = useState<SnakeGameState>(createInitialState);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);
  const joystickAngleRef = useRef<number | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const gameLoop = useCallback((timestamp: number) => {
    const state = gameStateRef.current;
    
    if (state.status !== 'playing') {
      return;
    }

    // Calculate deltaTime with clamping to prevent speed spikes
    let deltaTime = lastUpdateRef.current === 0 ? 16.67 : timestamp - lastUpdateRef.current;
    deltaTime = Math.min(deltaTime, MAX_DELTA_TIME); // Clamp to prevent huge jumps
    lastUpdateRef.current = timestamp;

    // Update player angle from joystick with turn rate limiting
    let updatedPlayer = state.player;
    if (joystickAngleRef.current !== null) {
      const limitedAngle = applyTurnRateLimit(
        updatedPlayer.angle,
        joystickAngleRef.current,
        deltaTime
      );
      updatedPlayer = { ...updatedPlayer, angle: limitedAngle };
    }

    // Move all snakes
    updatedPlayer = updateSnakeMovement(updatedPlayer, deltaTime);
    let updatedAI = state.aiSnakes.map(ai => updateSnakeMovement(ai, deltaTime));

    // Update AI behavior
    updatedAI = updatedAI.map(ai => updateAI(ai, state.pickups, [updatedPlayer, ...updatedAI]));

    // Check pickup collisions for player
    const playerPickupResult = checkPickupCollision(updatedPlayer, state.pickups);
    let remainingPickups = playerPickupResult.remaining;
    
    if (playerPickupResult.collected.length > 0) {
      playerPickupResult.collected.forEach(pickup => {
        updatedPlayer = {
          ...updatedPlayer,
          score: updatedPlayer.score + pickup.value,
        };
        updatedPlayer = growSnake(updatedPlayer, pickup.growthAmount);
      });
    }

    // Check pickup collisions for AI
    updatedAI = updatedAI.map(ai => {
      const aiPickupResult = checkPickupCollision(ai, remainingPickups);
      remainingPickups = aiPickupResult.remaining;
      
      let updatedAISnake = ai;
      if (aiPickupResult.collected.length > 0) {
        aiPickupResult.collected.forEach(pickup => {
          updatedAISnake = {
            ...updatedAISnake,
            score: updatedAISnake.score + pickup.value,
          };
          updatedAISnake = growSnake(updatedAISnake, pickup.growthAmount);
        });
      }
      return updatedAISnake;
    });

    // Respawn pickups if needed
    if (remainingPickups.length < PICKUP_COUNT * 0.7) {
      const newPickups = generatePickups(
        PICKUP_COUNT - remainingPickups.length,
        [updatedPlayer, ...updatedAI]
      );
      remainingPickups = [...remainingPickups, ...newPickups];
    }

    // Check snake collisions
    const allSnakes = [updatedPlayer, ...updatedAI];
    const collisionResult = checkSnakeCollisions(allSnakes);

    // Handle eliminations
    if (collisionResult.eliminated.includes(updatedPlayer.id)) {
      setGameState(prev => ({
        ...prev,
        player: { ...updatedPlayer, alive: false },
        status: 'gameOver',
      }));
      return;
    }

    // Process point transfers and respawn AI
    collisionResult.transfers.forEach(transfer => {
      if (transfer.to === updatedPlayer.id) {
        updatedPlayer = { ...updatedPlayer, score: updatedPlayer.score + transfer.points };
      } else {
        const aiIndex = updatedAI.findIndex(ai => ai.id === transfer.to);
        if (aiIndex !== -1) {
          updatedAI[aiIndex] = {
            ...updatedAI[aiIndex],
            score: updatedAI[aiIndex].score + transfer.points,
          };
        }
      }
    });

    // Remove eliminated AI and respawn
    updatedAI = updatedAI.map(ai => {
      if (collisionResult.eliminated.includes(ai.id)) {
        return respawnAISnake(ai.id);
      }
      return ai;
    });

    // Update camera to follow player
    const camera = {
      x: updatedPlayer.segments[0].x,
      y: updatedPlayer.segments[0].y,
    };

    setGameState(prev => ({
      ...prev,
      player: updatedPlayer,
      aiSnakes: updatedAI,
      pickups: remainingPickups,
      camera,
    }));

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
    
    joystickAngleRef.current = null;
    lastUpdateRef.current = 0;
    setGameState(createInitialState());
    
    setTimeout(() => {
      setGameState(prev => ({ ...prev, status: 'playing' }));
    }, 100);
  }, []);

  const setJoystickAngle = useCallback((angle: number | null) => {
    joystickAngleRef.current = angle;
  }, []);

  return {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    setJoystickAngle,
  };
}
