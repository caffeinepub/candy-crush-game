import { useRef, useState, useEffect, useCallback } from 'react';
import {
  GameState,
  initGameState,
  updateGame,
} from './spaceSnakeLogic';

export function useSpaceSnakeGame(
  playerName: string,
  active: boolean,
  isLandscape: boolean = true,
  tiltEnabled: boolean = false,
  tiltAngle: number | null = null
) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const steeringAngleRef = useRef<number | null>(null);
  const tiltAngleRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const missionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLandscapeRef = useRef<boolean>(isLandscape);
  const tiltEnabledRef = useRef<boolean>(tiltEnabled);

  // Keep refs in sync with props
  useEffect(() => {
    isLandscapeRef.current = isLandscape;
  }, [isLandscape]);

  useEffect(() => {
    tiltEnabledRef.current = tiltEnabled;
  }, [tiltEnabled]);

  useEffect(() => {
    tiltAngleRef.current = tiltAngle;
  }, [tiltAngle]);

  const startGame = useCallback(() => {
    const initial = initGameState(playerName);
    stateRef.current = initial;
    setGameState(initial);
  }, [playerName]);

  const setSteering = useCallback((angle: number | null) => {
    steeringAngleRef.current = angle;
  }, []);

  const setMouseSteering = useCallback((canvasX: number, canvasY: number, viewW: number, viewH: number) => {
    // Compute angle from center of screen to mouse
    const cx = viewW / 2;
    const cy = viewH / 2;
    const angle = Math.atan2(canvasY - cy, canvasX - cx);
    steeringAngleRef.current = angle;
  }, []);

  useEffect(() => {
    if (!active || !gameState) return;

    // Mission countdown timer
    missionTimerRef.current = setInterval(() => {
      if (!stateRef.current) return;
      const s = stateRef.current;
      if (s.gameOver) return;
      // Pause mission timer when not in landscape
      if (!isLandscapeRef.current) return;
      const newTime = Math.max(0, s.mission.timeRemaining - 1);
      const newMission = { ...s.mission, timeRemaining: newTime };
      if (newTime === 0) {
        // Reset mission
        newMission.current = 0;
        newMission.target = Math.floor(Math.random() * 6) + 5;
        newMission.timeRemaining = 30;
      }
      const newState = { ...s, mission: newMission };
      stateRef.current = newState;
    }, 1000);

    return () => {
      if (missionTimerRef.current) clearInterval(missionTimerRef.current);
    };
  }, [active, gameState]);

  useEffect(() => {
    if (!active) return;

    startGame();

    const loop = (timestamp: number) => {
      const delta = lastTimeRef.current ? timestamp - lastTimeRef.current : 16;
      lastTimeRef.current = timestamp;

      // Pause game loop when not in landscape
      if (!isLandscapeRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (stateRef.current && !stateRef.current.gameOver) {
        // Determine effective steering angle:
        // Tilt takes precedence when enabled and active; joystick/mouse as fallback
        let effectiveAngle: number | null = steeringAngleRef.current;
        if (tiltEnabledRef.current && tiltAngleRef.current !== null) {
          effectiveAngle = tiltAngleRef.current;
        }

        const newState = updateGame(stateRef.current, effectiveAngle, delta);
        stateRef.current = newState;
        setGameState({ ...newState });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = 0;
    };
  }, [active, startGame]);

  const restart = useCallback(() => {
    const initial = initGameState(playerName);
    stateRef.current = initial;
    setGameState(initial);
  }, [playerName]);

  return { gameState, setSteering, setMouseSteering, restart };
}
