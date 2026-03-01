import { useRef, useEffect, useState } from 'react';
import { useSnakeGame } from './useSnakeGame';
import SnakeCanvas from './SnakeCanvas';
import SnakeMainMenu from './SnakeMainMenu';
import SnakeHUD from './SnakeHUD';
import SnakeMinimap from './SnakeMinimap';
import SnakeBoosters from './SnakeBoosters';
import SnakeMissionCompleteOverlay from './SnakeMissionCompleteOverlay';
import { GameOverOverlay, PauseOverlay } from './SnakeOverlays';
import Joystick from './Joystick';
import RotateToLandscapeOverlay from './RotateToLandscapeOverlay';
import { useLandscapeOrientation } from './useLandscapeOrientation';
import { useCanvasViewport } from './useCanvasViewport';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw, Maximize, Minimize, Smartphone } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { Heart } from 'lucide-react';
import { MultiplayerRoomProvider } from './multiplayer/MultiplayerRoomContext';
import { useMultiplayerRoom } from './multiplayer/useMultiplayerRoom';
import { useRoomPolling } from './multiplayer/useRoomPolling';
import { useInputSubmission } from './multiplayer/useInputSubmission';
import MultiplayerConnectionIndicator from './multiplayer/MultiplayerConnectionIndicator';
import MultiplayerConnectingScreen from './multiplayer/MultiplayerConnectingScreen';
import MultiplayerRoomCodePanel from './multiplayer/MultiplayerRoomCodePanel';

// Reduced zoom for more spacious view
const ZOOM = 0.6;

function SnakeScreenContent() {
  const { 
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
  } = useSnakeGame();
  
  const { isFullscreen, isSupported, toggleFullscreen } = useFullscreen();
  const isLandscape = useLandscapeOrientation();
  const playfieldRef = useRef<HTMLDivElement>(null);
  const viewport = useCanvasViewport(playfieldRef);

  // Multiplayer state - now using shared context
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [multiplayerNickname, setMultiplayerNickname] = useState('');
  const { roomCode, leaveRoom } = useMultiplayerRoom();
  const { roomState, connectionStatus, isInitialLoad, retry } = useRoomPolling(roomCode, isMultiplayer);
  const [currentAngle, setCurrentAngle] = useState<number | null>(null);
  
  useInputSubmission(roomCode, isMultiplayer, currentAngle);

  const togglePause = () => {
    if (gameState.status === 'playing') {
      pauseGame();
    } else if (gameState.status === 'paused') {
      resumeGame();
    }
  };

  const handleStartMultiplayer = (code: string, nickname: string) => {
    setIsMultiplayer(true);
    setMultiplayerNickname(nickname);
  };

  const handleLeaveMultiplayer = () => {
    setIsMultiplayer(false);
    setMultiplayerNickname('');
    leaveRoom();
  };

  // Keyboard controls (Arrow keys + WASD)
  useEffect(() => {
    const keysPressed = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing' && !isMultiplayer) return;
      
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysPressed.add(key);
        updateKeyboardAngle();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        keysPressed.delete(key);
        updateKeyboardAngle();
      }
    };

    const updateKeyboardAngle = () => {
      let dx = 0;
      let dy = 0;

      if (keysPressed.has('arrowup') || keysPressed.has('w')) dy -= 1;
      if (keysPressed.has('arrowdown') || keysPressed.has('s')) dy += 1;
      if (keysPressed.has('arrowleft') || keysPressed.has('a')) dx -= 1;
      if (keysPressed.has('arrowright') || keysPressed.has('d')) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const angle = Math.atan2(dy, dx);
        if (isMultiplayer) {
          setCurrentAngle(angle);
        } else {
          setKeyboardAngle(angle);
        }
      } else {
        if (isMultiplayer) {
          setCurrentAngle(null);
        } else {
          setKeyboardAngle(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.status, isMultiplayer, setKeyboardAngle]);

  const handleJoystickMove = (angle: number | null) => {
    if (isMultiplayer) {
      setCurrentAngle(angle);
    } else {
      setJoystickAngle(angle);
    }
  };

  // Show menu if not in game
  if (gameState.status === 'menu' && !isMultiplayer) {
    return (
      <div className="game-screen">
        <SnakeMainMenu 
          onStartGame={startGame}
          onStartMultiplayer={handleStartMultiplayer}
        />
      </div>
    );
  }

  // Show multiplayer connecting screen if waiting for room state
  if (isMultiplayer && (!roomState || isInitialLoad)) {
    return (
      <div className="game-screen game-screen-gameplay">
        <MultiplayerConnectingScreen
          connectionStatus={connectionStatus}
          isInitialLoad={isInitialLoad}
          onRetry={retry}
          onLeave={handleLeaveMultiplayer}
        />
      </div>
    );
  }

  // Show portrait overlay if not in landscape
  if (!isLandscape) {
    return <RotateToLandscapeOverlay visible={true} />;
  }

  return (
    <div className="game-screen game-screen-gameplay">
      <div className="game-main game-main-fullscreen">
        <div className="snake-game-container-fullscreen">
          <div 
            ref={playfieldRef}
            className="game-board-container snake-board-container"
          >
            {/* Canvas — always single-player; multiplayer canvas requires backend getRoomState */}
            <SnakeCanvas
              gameState={gameState}
              viewportWidth={viewport.width}
              viewportHeight={viewport.height}
              canvasWidth={viewport.canvasWidth}
              canvasHeight={viewport.canvasHeight}
              dpr={viewport.dpr}
              zoom={ZOOM}
            />

            {/* HUD — always single-player */}
            <SnakeHUD 
              gameState={gameState}
              viewportWidth={viewport.width}
              viewportHeight={viewport.height}
              zoom={ZOOM}
            />

            {/* Multiplayer room code panel */}
            {isMultiplayer && roomCode && (
              <MultiplayerRoomCodePanel roomCode={roomCode} />
            )}

            {/* Multiplayer connection indicator */}
            {isMultiplayer && connectionStatus !== 'connected' && (
              <MultiplayerConnectionIndicator status={connectionStatus} />
            )}

            {/* Minimap */}
            {!isMultiplayer && (
              <SnakeMinimap 
                gameState={gameState}
                viewportWidth={viewport.width}
                viewportHeight={viewport.height}
                zoom={ZOOM}
              />
            )}

            {/* Boosters */}
            {!isMultiplayer && (
              <SnakeBoosters />
            )}

            {/* Mission complete overlay */}
            {!isMultiplayer && missionCompleteVisible && (
              <SnakeMissionCompleteOverlay />
            )}

            {/* Controls overlay */}
            <div className="snake-controls-overlay">
              {!isMultiplayer && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={togglePause}
                    className="snake-control-button"
                    aria-label={gameState.status === 'playing' ? 'Pause' : 'Resume'}
                  >
                    {gameState.status === 'playing' ? <Pause size={20} /> : <Play size={20} />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={restartGame}
                    className="snake-control-button"
                    aria-label="Restart"
                  >
                    <RotateCcw size={20} />
                  </Button>
                </>
              )}
              {isSupported && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="snake-control-button"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </Button>
              )}
              {isMultiplayer && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleLeaveMultiplayer}
                  className="snake-control-button"
                  aria-label="Leave room"
                >
                  <RotateCcw size={20} />
                </Button>
              )}
            </div>

            {/* Tilt toggle */}
            {!isMultiplayer && (
              <div className="snake-tilt-toggle">
                {tiltError && (
                  <div className="snake-tilt-error">{tiltError}</div>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleTilt}
                  className="snake-tilt-button"
                  aria-label={tiltEnabled ? 'Disable tilt controls' : 'Enable tilt controls'}
                >
                  <Smartphone size={20} />
                </Button>
              </div>
            )}

            {/* Joystick */}
            <div className="snake-joystick">
              <Joystick
                onAngleChange={handleJoystickMove}
                disabled={gameState.status !== 'playing' && !isMultiplayer}
              />
            </div>

            {/* Overlays */}
            {!isMultiplayer && gameState.status === 'paused' && (
              <PauseOverlay onAction={resumeGame} />
            )}
            {!isMultiplayer && gameState.status === 'gameOver' && (
              <GameOverOverlay 
                onAction={restartGame}
                score={gameState.player.score}
                length={gameState.player.segments.length}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="game-footer">
        <p className="game-footer-text">
          Built with <Heart size={14} className="inline text-red-500" /> using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="game-footer-link"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

export default function SnakeScreen() {
  return (
    <MultiplayerRoomProvider>
      <SnakeScreenContent />
    </MultiplayerRoomProvider>
  );
}
