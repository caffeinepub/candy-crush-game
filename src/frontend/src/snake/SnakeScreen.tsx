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
import { useMultiplayerRoom } from './multiplayer/useMultiplayerRoom';
import { useRoomPolling } from './multiplayer/useRoomPolling';
import { useInputSubmission } from './multiplayer/useInputSubmission';
import MultiplayerSnakeCanvas from './multiplayer/MultiplayerSnakeCanvas';
import MultiplayerHUD from './multiplayer/MultiplayerHUD';
import MultiplayerConnectionIndicator from './multiplayer/MultiplayerConnectionIndicator';
import MultiplayerConnectingScreen from './multiplayer/MultiplayerConnectingScreen';
import MultiplayerRoomCodePanel from './multiplayer/MultiplayerRoomCodePanel';
import { MultiplayerGameState, MultiplayerSnake } from './multiplayer/types';

// Reduced zoom for more spacious view
const ZOOM = 0.6;

export default function SnakeScreen() {
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

  // Multiplayer state
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
    // Don't start single-player game loop
  };

  const handleLeaveMultiplayer = () => {
    setIsMultiplayer(false);
    setMultiplayerNickname('');
    leaveRoom();
  };

  // Convert backend room state to renderable multiplayer state
  const multiplayerGameState: MultiplayerGameState | null = roomState && roomState.players.length > 0 ? {
    snakes: roomState.players.map(([id, nickname], index): MultiplayerSnake => ({
      id,
      nickname,
      segments: roomState.worldState.snakes[index]?.body.map(coord => ({
        x: Number(coord.x),
        y: Number(coord.y),
      })) || [],
      angle: 0,
      score: Number(roomState.worldState.snakes[index]?.score || 0),
      color: `hsl(${index * 60}, 70%, 50%)`,
      isLocalPlayer: nickname === multiplayerNickname,
    })),
    pickups: roomState.worldState.snacks.map((coord, index) => ({
      position: { x: Number(coord.x), y: Number(coord.y) },
      type: 'small',
      radius: 10,
    })),
    worldSize: {
      width: Number(roomState.worldState.worldSize.x) || 2000,
      height: Number(roomState.worldState.worldSize.y) || 2000,
    },
    timeRemaining: Number(roomState.worldState.timeRemaining),
  } : null;

  const localPlayerId = roomState?.players.find(([_, nick]) => nick === multiplayerNickname)?.[0] || '';

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
  }, [gameState.status, setKeyboardAngle, isMultiplayer]);

  const handleJoystickChange = (angle: number | null) => {
    if (isMultiplayer) {
      setCurrentAngle(angle);
    } else {
      setJoystickAngle(angle);
    }
  };

  // Show main menu
  if (gameState.status === 'menu' && !isMultiplayer) {
    return (
      <div className="game-screen">
        <SnakeMainMenu 
          onStartGame={startGame}
          onStartMultiplayer={handleStartMultiplayer}
        />
        
        {/* Footer */}
        <footer className="game-footer">
          <p className="game-footer-text">
            © {new Date().getFullYear()} Built with <Heart size={14} className="inline text-red-500" fill="currentColor" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'snake-arena'
              )}`}
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

  // Multiplayer connecting/loading state
  if (isMultiplayer && !multiplayerGameState) {
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

  // Multiplayer gameplay
  if (isMultiplayer && multiplayerGameState) {
    return (
      <div className="game-screen game-screen-gameplay" data-orientation={isLandscape ? 'landscape' : 'portrait'}>
        <main className="game-main game-main-fullscreen">
          <div className="game-container snake-game-container snake-game-container-fullscreen">
            <RotateToLandscapeOverlay visible={!isLandscape} />

            {/* Room code panel */}
            <MultiplayerRoomCodePanel roomCode={roomCode || ''} />

            {/* Connection indicator */}
            <MultiplayerConnectionIndicator status={connectionStatus} />

            {/* In-game controls overlay */}
            <div className="snake-controls-overlay">
              <Button
                variant="outline"
                size="icon"
                onClick={handleLeaveMultiplayer}
                className="snake-control-button"
                aria-label="Leave room"
              >
                <RotateCcw size={18} />
              </Button>
              {isSupported && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="snake-control-button"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                </Button>
              )}
            </div>

            {/* Multiplayer HUD */}
            <MultiplayerHUD 
              snakes={multiplayerGameState.snakes}
              localPlayerId={localPlayerId}
              viewportWidth={viewport.width}
              viewportHeight={viewport.height}
              zoom={ZOOM}
            />

            {/* Game Board */}
            <div ref={playfieldRef} className="game-board-container snake-board-container">
              <MultiplayerSnakeCanvas
                gameState={multiplayerGameState}
                localPlayerId={localPlayerId}
                viewportWidth={viewport.width}
                viewportHeight={viewport.height}
                canvasWidth={viewport.canvasWidth}
                canvasHeight={viewport.canvasHeight}
                dpr={viewport.dpr}
                zoom={ZOOM}
              />
            </div>

            {/* Joystick Control */}
            <div className="snake-joystick">
              <Joystick
                onAngleChange={handleJoystickChange}
                disabled={false}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Single-player gameplay
  return (
    <div className="game-screen game-screen-gameplay" data-orientation={isLandscape ? 'landscape' : 'portrait'}>
      <main className="game-main game-main-fullscreen">
        <div className="game-container snake-game-container snake-game-container-fullscreen">
          <RotateToLandscapeOverlay visible={!isLandscape} />

          {/* In-game controls overlay */}
          <div className="snake-controls-overlay">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePause}
              className="snake-control-button"
              aria-label={gameState.status === 'playing' ? 'Pause' : 'Resume'}
            >
              {gameState.status === 'playing' ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={restartGame}
              className="snake-control-button"
              aria-label="Restart"
            >
              <RotateCcw size={18} />
            </Button>
            {isSupported && (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
                className="snake-control-button"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </Button>
            )}
          </div>

          {/* Tilt toggle */}
          <div className="snake-tilt-toggle">
            {tiltError && (
              <div className="snake-tilt-error">{tiltError}</div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTilt}
              className="snake-tilt-button"
              aria-label={tiltEnabled ? 'Disable tilt' : 'Enable tilt'}
            >
              <Smartphone size={18} />
            </Button>
          </div>

          {/* HUD */}
          <SnakeHUD 
            gameState={gameState}
            viewportWidth={viewport.width}
            viewportHeight={viewport.height}
            zoom={ZOOM}
          />

          {/* Game Board */}
          <div ref={playfieldRef} className="game-board-container snake-board-container">
            <SnakeCanvas
              gameState={gameState}
              viewportWidth={viewport.width}
              viewportHeight={viewport.height}
              canvasWidth={viewport.canvasWidth}
              canvasHeight={viewport.canvasHeight}
              dpr={viewport.dpr}
              zoom={ZOOM}
            />
          </div>

          {/* Joystick Control */}
          <div className="snake-joystick">
            <Joystick
              onAngleChange={handleJoystickChange}
              disabled={gameState.status !== 'playing'}
            />
          </div>

          {/* Boosters */}
          <SnakeBoosters />

          {/* Minimap */}
          <SnakeMinimap 
            gameState={gameState}
            viewportWidth={viewport.width}
            viewportHeight={viewport.height}
            zoom={ZOOM}
          />

          {/* Overlays */}
          {gameState.status === 'paused' && (
            <PauseOverlay onAction={resumeGame} />
          )}
          {gameState.status === 'gameOver' && (
            <GameOverOverlay 
              score={gameState.player.score}
              length={gameState.player.segments.length}
              onAction={restartGame}
            />
          )}
          {missionCompleteVisible && <SnakeMissionCompleteOverlay />}
        </div>
      </main>
    </div>
  );
}
