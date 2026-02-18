import { SnakeGameState } from './types';
import { WZ_ASSETS } from './wzAssets';

interface SnakeHUDProps {
  gameState: SnakeGameState;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
  isMultiplayer?: boolean;
}

export default function SnakeHUD({ gameState, viewportWidth, viewportHeight, zoom, isMultiplayer = false }: SnakeHUDProps) {
  // Sort leaderboard by score
  const leaderboard = [
    { name: 'You', score: gameState.player.score, isPlayer: true },
    ...gameState.aiSnakes.map((snake, i) => ({
      name: `Bot ${i + 1}`,
      score: snake.score,
      isPlayer: false,
    })),
  ].sort((a, b) => b.score - a.score);

  // Mission progress
  const mission = gameState.mission;
  const missionProgress = mission ? `${mission.coinsCollected}/${mission.coinsTarget}` : '';
  const missionTimeLeft = mission ? Math.ceil(mission.timeRemaining / 1000) : 0;
  const missionTimePercent = mission && mission.timeRemaining > 0 ? (mission.timeRemaining / 60000) * 100 : 100;

  return (
    <>
      {/* Leaderboard - Compact (top 3) */}
      <div className="snake-hud-leaderboard">
        <div className="snake-hud-panel" style={{ backgroundImage: `url(${WZ_ASSETS.hudPanelDark})` }}>
          <div className="snake-hud-panel-title">Top Players</div>
          <div className="snake-hud-leaderboard-list">
            {leaderboard.slice(0, 3).map((entry, i) => (
              <div
                key={i}
                className={`snake-hud-leaderboard-item ${entry.isPlayer ? 'player' : ''}`}
              >
                <span className="snake-hud-leaderboard-rank">{i + 1}</span>
                <span className="snake-hud-leaderboard-name">{entry.name}</span>
                <span className="snake-hud-leaderboard-score">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Panel - Compact */}
      {mission && !mission.isComplete && (
        <div className="snake-hud-mission">
          <div className="snake-hud-panel snake-hud-mission-panel" style={{ backgroundImage: `url(${WZ_ASSETS.hudPanelDark})` }}>
            <div className="snake-hud-mission-icon">
              <img src={WZ_ASSETS.coinIcon} alt="Mission" />
            </div>
            <div className="snake-hud-mission-info">
              <div className="snake-hud-mission-title">Collect Coins</div>
              <div className="snake-hud-mission-progress">{missionProgress}</div>
            </div>
            <div className="snake-hud-mission-timer">
              <div className="snake-hud-timer-circle">
                <svg className="snake-hud-timer-svg" viewBox="0 0 40 40">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="oklch(70% 0.24 240)"
                    strokeWidth="3"
                    strokeDasharray={`${(missionTimePercent / 100) * 100.53} 100.53`}
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                  />
                </svg>
                <div className="snake-hud-timer-text">{missionTimeLeft}s</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
