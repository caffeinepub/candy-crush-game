import { SnakeGameState } from './types';
import { WZ_ASSETS } from './wzAssets';

interface SnakeHUDProps {
  gameState: SnakeGameState;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
}

export default function SnakeHUD({ gameState }: SnakeHUDProps) {
  // Calculate leaderboard
  const allSnakes = [gameState.player, ...gameState.aiSnakes]
    .filter(s => s.alive)
    .sort((a, b) => b.score - a.score);
  
  const topSnakes = allSnakes.slice(0, 10);
  const playerRank = allSnakes.findIndex(s => s.id === gameState.player.id) + 1;
  const playerInTop10 = playerRank <= 10;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Leaderboard - Top Left */}
      <div className="snake-hud-leaderboard">
        <div className="snake-hud-panel" style={{ backgroundImage: `url(${WZ_ASSETS.hudPanelDark})` }}>
          <div className="snake-hud-panel-title">Top players (in the arena: {allSnakes.length})</div>
          <div className="snake-hud-leaderboard-list">
            {topSnakes.map((snake, index) => (
              <div 
                key={snake.id} 
                className={`snake-hud-leaderboard-item ${snake.id === gameState.player.id ? 'player' : ''}`}
              >
                <span className="snake-hud-leaderboard-rank">{index + 1}.</span>
                <span className="snake-hud-leaderboard-name">
                  {snake.isPlayer ? 'You' : `Player${index + 1}`}
                </span>
                <span className="snake-hud-leaderboard-score">{snake.score}</span>
              </div>
            ))}
            {!playerInTop10 && (
              <div className="snake-hud-leaderboard-item player">
                <span className="snake-hud-leaderboard-rank">{playerRank}.</span>
                <span className="snake-hud-leaderboard-name">You</span>
                <span className="snake-hud-leaderboard-score">{gameState.player.score}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mission Panel - Top Center */}
      <div className="snake-hud-mission">
        <div className="snake-hud-panel snake-hud-mission-panel" style={{ backgroundImage: `url(${WZ_ASSETS.hudPanelDark})` }}>
          <div className="snake-hud-mission-icon">
            <img src={WZ_ASSETS.coinIcon} alt="Mission" />
          </div>
          <div className="snake-hud-mission-info">
            <div className="snake-hud-mission-title">Collect {gameState.mission.coinsTarget} coins</div>
            <div className="snake-hud-mission-progress">
              {gameState.mission.coinsCollected}/{gameState.mission.coinsTarget}
            </div>
          </div>
          <div className="snake-hud-mission-timer">
            <div className="snake-hud-timer-circle">
              <svg className="snake-hud-timer-svg" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="3"
                  strokeDasharray={`${(gameState.mission.timeRemaining / 300) * 100} 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="snake-hud-timer-text">{formatTime(gameState.mission.timeRemaining)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coin Counter - Top Right */}
      <div className="snake-hud-coins">
        <div className="snake-hud-panel snake-hud-coins-panel" style={{ backgroundImage: `url(${WZ_ASSETS.hudPanelDark})` }}>
          <img src={WZ_ASSETS.coinIcon} alt="Coins" className="snake-hud-coin-icon" />
          <span className="snake-hud-coins-value">{gameState.coins}</span>
        </div>
      </div>
    </>
  );
}
