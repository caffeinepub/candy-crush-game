import React, { useRef, useState, useCallback } from 'react';
import { useSpaceSnakeGame } from './useSpaceSnakeGame';
import SpaceSnakeCanvas from './SpaceSnakeCanvas';
import SpaceSnakeMainMenu from './SpaceSnakeMainMenu';
import SpaceSnakeGameOverOverlay from './SpaceSnakeGameOverOverlay';
import SpaceSnakeLeaderboard from './SpaceSnakeLeaderboard';
import SpaceSnakeMissionBanner from './SpaceSnakeMissionBanner';
import SpaceSnakeScoreCounter from './SpaceSnakeScoreCounter';
import SpaceSnakeMinimap from './SpaceSnakeMinimap';
import SpaceSnakeJoystick from './SpaceSnakeJoystick';
import SpaceSnakeTiltToggle from './SpaceSnakeTiltToggle';
import RotateToLandscapeOverlay from './RotateToLandscapeOverlay';
import { useLandscapeOrientation } from './useLandscapeOrientation';
import { useTiltControls } from './useTiltControls';
import { useCanvasViewport } from './useCanvasViewport';

/** Detect if the user is on a mobile/touch device */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}

export default function SpaceSnakeScreen() {
  const [nickname, setNickname] = useState('');
  const joystickAngleRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile] = useState(() => isMobileDevice());

  const isLandscape = useLandscapeOrientation();

  // tiltEnabled state managed locally; useTiltControls requires the enabled flag
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const { tiltAngle, permissionGranted, requestPermission } = useTiltControls(
    tiltEnabled && isMobile
  );

  const { width, height } = useCanvasViewport(containerRef);

  const handleJoystickChange = useCallback((angle: number | null) => {
    joystickAngleRef.current = angle;
  }, []);

  const { gameState, startGame, goToMenu } = useSpaceSnakeGame(nickname, joystickAngleRef, {
    isLandscape,
    tiltEnabled: tiltEnabled && isMobile,
    // tiltAngle can be null; coerce to 0 when null so the options type (number) is satisfied
    tiltAngle: tiltAngle ?? 0,
  });

  const handleTiltToggle = useCallback(async () => {
    if (!tiltEnabled) {
      if (!permissionGranted) {
        await requestPermission();
      }
      setTiltEnabled(true);
    } else {
      setTiltEnabled(false);
    }
  }, [tiltEnabled, permissionGranted, requestPermission]);

  if (gameState.phase === 'menu') {
    return (
      <SpaceSnakeMainMenu
        nickname={nickname}
        onNicknameChange={setNickname}
        onPlay={startGame}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-black"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Game canvas */}
      <SpaceSnakeCanvas
        player={gameState.player}
        bots={gameState.bots}
        coins={gameState.coins}
        points={gameState.points}
        width={width}
        height={height}
      />

      {/* HUD overlays */}
      {gameState.phase === 'playing' && (
        <>
          {/* Leaderboard - top right */}
          <SpaceSnakeLeaderboard entries={gameState.leaderboard} />

          {/* Mission banner - top center */}
          <SpaceSnakeMissionBanner
            collected={gameState.coins_collected}
            target={30}
          />

          {/* Score - bottom center */}
          <SpaceSnakeScoreCounter score={gameState.score} />

          {/* Minimap - top left (rendered inside SpaceSnakeMinimap component) */}
          <SpaceSnakeMinimap
            player={gameState.player}
            bots={gameState.bots}
            coins={gameState.coins}
            points={gameState.points}
          />

          {/* Tilt toggle (mobile only) - raised from bottom */}
          <div className="absolute bottom-14 left-28 z-20">
            <SpaceSnakeTiltToggle
              tiltEnabled={tiltEnabled}
              onToggle={handleTiltToggle}
              isMobile={isMobile}
            />
          </div>

          {/* Joystick - raised from bottom edge */}
          <div className="absolute bottom-10 left-6 z-20">
            <SpaceSnakeJoystick onAngleChange={handleJoystickChange} />
          </div>
        </>
      )}

      {/* Game over overlay */}
      {gameState.phase === 'gameover' && (
        <SpaceSnakeGameOverOverlay
          score={gameState.score}
          deathReason={gameState.deathReason}
          onPlayAgain={startGame}
          onGoToMenu={goToMenu}
        />
      )}

      {/* Rotate to landscape overlay */}
      <RotateToLandscapeOverlay visible={!isLandscape} />
    </div>
  );
}
