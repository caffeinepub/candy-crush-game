import React, { useState, useCallback, useEffect } from 'react';
import SpaceSnakeMainMenu from './SpaceSnakeMainMenu';
import SpaceSnakeCanvas from './SpaceSnakeCanvas';
import SpaceSnakeJoystick from './SpaceSnakeJoystick';
import SpaceSnakeLeaderboard from './SpaceSnakeLeaderboard';
import SpaceSnakeMissionBanner from './SpaceSnakeMissionBanner';
import SpaceSnakeScoreCounter from './SpaceSnakeScoreCounter';
import SpaceSnakeMinimap from './SpaceSnakeMinimap';
import SpaceSnakeGameOverOverlay from './SpaceSnakeGameOverOverlay';
import SpaceSnakeTiltToggle from './SpaceSnakeTiltToggle';
import RotateToLandscapeOverlay from './RotateToLandscapeOverlay';
import { useLandscapeOrientation } from './useLandscapeOrientation';
import { useTiltControls } from './useTiltControls';
import { useSpaceSnakeGame } from './useSpaceSnakeGame';

const TILT_STORAGE_KEY = 'spaceSnakeTiltEnabled';

type Screen = 'menu' | 'game';

/** Detect if the user is on a mobile/touch device */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

const SpaceSnakeScreen: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('menu');
  const [playerName, setPlayerName] = useState('Player');
  const [isMobile] = useState(() => isMobileDevice());

  // Orientation detection
  const isLandscape = useLandscapeOrientation();

  // Tilt enabled state — persisted to localStorage
  const [tiltEnabled, setTiltEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(TILT_STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const handleTiltToggle = useCallback(() => {
    setTiltEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem(TILT_STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Tilt controls hook
  const { tiltAngle, permissionGranted, requestPermission } = useTiltControls(
    tiltEnabled && isMobile
  );

  // Request iOS permission when tilt is first enabled
  useEffect(() => {
    if (tiltEnabled && isMobile && !permissionGranted) {
      requestPermission();
    }
  }, [tiltEnabled, isMobile, permissionGranted, requestPermission]);

  const { gameState, setSteering, setMouseSteering, restart } = useSpaceSnakeGame(
    playerName,
    screen === 'game',
    isLandscape,
    tiltEnabled && isMobile,
    tiltAngle
  );

  const handlePlay = useCallback((name: string) => {
    setPlayerName(name);
    setScreen('game');
  }, []);

  const handlePlayAgain = useCallback(() => {
    restart();
  }, [restart]);

  const handleMouseMove = useCallback(
    (x: number, y: number) => {
      if (!gameState) return;
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      setMouseSteering(x, y, canvas.offsetWidth, canvas.offsetHeight);
    },
    [gameState, setMouseSteering]
  );

  if (screen === 'menu') {
    return (
      <div className="w-full h-full">
        <SpaceSnakeMainMenu onPlay={handlePlay} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#0a1a3a' }}>
      {/* Game Canvas */}
      {gameState && (
        <SpaceSnakeCanvas
          gameState={gameState}
          onMouseMove={handleMouseMove}
        />
      )}

      {/* HUD Overlays */}
      {gameState && (
        <>
          {/* Top-left leaderboard */}
          <SpaceSnakeLeaderboard entries={gameState.leaderboard} />

          {/* Top-center mission banner */}
          <SpaceSnakeMissionBanner mission={gameState.mission} />

          {/* Bottom-center score */}
          <SpaceSnakeScoreCounter score={gameState.player.score} />

          {/* Bottom-left: minimap + joystick + tilt toggle */}
          <div
            className="absolute bottom-4 left-4 z-20 flex flex-col items-center gap-2"
          >
            <SpaceSnakeMinimap gameState={gameState} />
            <div className="flex items-center gap-2">
              <SpaceSnakeJoystick onAngleChange={setSteering} />
              <SpaceSnakeTiltToggle
                tiltEnabled={tiltEnabled}
                onToggle={handleTiltToggle}
                isMobile={isMobile}
              />
            </div>
          </div>

          {/* Game Over Overlay */}
          {gameState.gameOver && (
            <SpaceSnakeGameOverOverlay
              score={gameState.player.score}
              rank={gameState.playerRank}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </>
      )}

      {/* Portrait mode overlay — blocks gameplay and prompts rotation */}
      {isMobile && (
        <RotateToLandscapeOverlay visible={!isLandscape} />
      )}
    </div>
  );
};

export default SpaceSnakeScreen;
