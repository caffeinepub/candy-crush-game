import { useState, useEffect, useRef, useCallback } from 'react';
import { SnakeGameState, Snake } from './types';
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

// Mission configuration
const MISSION_DURATION = 300; // 5 minutes in seconds
const MISSION_COIN_TARGET = 5;
const MISSION_COMPLETE_DISPLAY_TIME = 3000; // 3 seconds

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
  const [missionCompleteVisible, setMissionCompleteVisible] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltError, setTiltError] = useState<string | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const missionTimerRef = useRef<number>(0);
  const gameStateRef = useRef(gameState);
  const joystickAngleRef = useRef<number | null>(null);
  const keyboardAngleRef = useRef<number | null>(null);
  const tiltAngleRef = useRef<number | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const startNewMission = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      mission: {
        coinsCollected: 0,
        coinsTarget: MISSION_COIN_TARGET,
        timeRemaining: MISSION_DURATION,
        isComplete: false,
      },
    }));
    missionTimerRef.current = 0;
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    const state = gameStateRef.current;
    
    if (state.status !== 'playing') {
      return;
    }

    // Calculate deltaTime with clamping to prevent speed spikes
    let deltaTime = lastUpdateRef.current === 0 ? 16.67 : timestamp - lastUpdateRef.current;
    deltaTime = Math.min(deltaTime, MAX_DELTA_TIME);
    lastUpdateRef.current = timestamp;

    // Update mission timer
    missionTimerRef.current += deltaTime / 1000;
    if (missionTimerRef.current >= 1) {
      const secondsElapsed = Math.floor(missionTimerRef.current);
      missionTimerRef.current -= secondsElapsed;
      
      setGameState(prev => ({
        ...prev,
        mission: {
          ...prev.mission,
          timeRemaining: Math.max(0, prev.mission.timeRemaining - secondsElapsed),
        },
      }));
    }

    // Update player angle from controls (priority: tilt > keyboard > joystick) with turn rate limiting
    let updatedPlayer = state.player;
    const targetAngle = tiltAngleRef.current ?? keyboardAngleRef.current ?? joystickAngleRef.current;
    
    if (targetAngle !== null) {
      const limitedAngle = applyTurnRateLimit(
        updatedPlayer.angle,
        targetAngle,
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
    let coinsCollected = state.mission.coinsCollected;
    let totalCoins = state.coins;
    
    if (playerPickupResult.collected.length > 0) {
      playerPickupResult.collected.forEach(pickup => {
        if (pickup.type === 'coin') {
          coinsCollected++;
          totalCoins++;
        } else {
          updatedPlayer = {
            ...updatedPlayer,
            score: updatedPlayer.score + pickup.value,
          };
          updatedPlayer = growSnake(updatedPlayer, pickup.growthAmount);
        }
      });
    }

    // Check pickup collisions for AI
    updatedAI = updatedAI.map(ai => {
      const aiPickupResult = checkPickupCollision(ai, remainingPickups);
      remainingPickups = aiPickupResult.remaining;
      
      let updatedAISnake = ai;
      if (aiPickupResult.collected.length > 0) {
        aiPickupResult.collected.forEach(pickup => {
          if (pickup.type !== 'coin') {
            updatedAISnake = {
              ...updatedAISnake,
              score: updatedAISnake.score + pickup.value,
            };
            updatedAISnake = growSnake(updatedAISnake, pickup.growthAmount);
          }
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

    // Update camera to follow player smoothly across wrap boundaries
    const camera = {
      x: updatedPlayer.segments[0].x,
      y: updatedPlayer.segments[0].y,
    };

    // Update state
    setGameState(prev => ({
      ...prev,
      player: updatedPlayer,
      aiSnakes: updatedAI,
      pickups: remainingPickups,
      camera,
      coins: totalCoins,
      mission: {
        ...prev.mission,
        coinsCollected,
      },
    }));

    // Check if mission is complete (after state update to keep game running)
    if (coinsCollected >= state.mission.coinsTarget && !state.mission.isComplete) {
      setGameState(prev => ({
        ...prev,
        mission: {
          ...prev.mission,
          isComplete: true,
        },
      }));
      
      setMissionCompleteVisible(true);
      setTimeout(() => {
        setMissionCompleteVisible(false);
        startNewMission();
      }, MISSION_COMPLETE_DISPLAY_TIME);
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [startNewMission]);

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

  // Tilt controls
  useEffect(() => {
    if (!tiltEnabled) {
      tiltAngleRef.current = null;
      return;
    }

    let permissionGranted = false;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (gameStateRef.current.status !== 'playing') return;
      
      const gamma = event.gamma;
      
      if (gamma !== null) {
        const tiltSensitivity = 0.03;
        const clampedGamma = Math.max(-45, Math.min(45, gamma));
        const currentAngle = gameStateRef.current.player.angle;
        const turnAmount = clampedGamma * tiltSensitivity;
        tiltAngleRef.current = normalizeAngle(currentAngle + turnAmount);
      }
    };

    const requestPermission = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            permissionGranted = true;
            window.addEventListener('deviceorientation', handleOrientation);
            setTiltError(null);
          } else {
            setTiltError('Motion sensor permission denied. Using joystick/keyboard controls.');
            setTiltEnabled(false);
          }
        } catch (error) {
          setTiltError('Could not access motion sensors. Using joystick/keyboard controls.');
          setTiltEnabled(false);
        }
      } else if (typeof DeviceOrientationEvent !== 'undefined') {
        permissionGranted = true;
        window.addEventListener('deviceorientation', handleOrientation);
        setTiltError(null);
      } else {
        setTiltError('Motion sensors not available on this device. Using joystick/keyboard controls.');
        setTiltEnabled(false);
      }
    };

    requestPermission();

    return () => {
      if (permissionGranted) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      tiltAngleRef.current = null;
    };
  }, [tiltEnabled]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeGame = useCallback(() => {
    lastUpdateRef.current = 0;
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const restartGame = useCallback(() => {
    // Cancel any running animation frame
    if (gameLoopRef.current !== null) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Reset all control refs
    joystickAngleRef.current = null;
    keyboardAngleRef.current = null;
    tiltAngleRef.current = null;
    lastUpdateRef.current = 0;
    missionTimerRef.current = 0;
    
    // Create fresh initial state
    const newState = createInitialState();
    setGameState(newState);
    
    // Immediately transition to playing
    requestAnimationFrame(() => {
      setGameState(prev => ({ ...prev, status: 'playing' }));
    });
  }, []);

  const setJoystickAngle = useCallback((angle: number | null) => {
    joystickAngleRef.current = angle;
  }, []);

  const setKeyboardAngle = useCallback((angle: number | null) => {
    keyboardAngleRef.current = angle;
  }, []);

  const toggleTilt = useCallback(() => {
    setTiltEnabled(prev => !prev);
    if (tiltEnabled) {
      setTiltError(null);
    }
  }, [tiltEnabled]);

  return {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    setJoystickAngle,
    setKeyboardAngle,
    missionCompleteVisible,
    tiltEnabled,
    toggleTilt,
    tiltError,
  };
}
