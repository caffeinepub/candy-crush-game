import { MultiplayerSnake } from './types';
import { WZ_ASSETS } from '../wzAssets';

interface MultiplayerHUDProps {
  snakes: MultiplayerSnake[];
  localPlayerId: string;
  viewportWidth: number;
  viewportHeight: number;
  zoom: number;
}

export default function MultiplayerHUD({ snakes, localPlayerId }: MultiplayerHUDProps) {
  // Sort by score
  const leaderboard = [...snakes]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="snake-hud-leaderboard">
      <div className="snake-hud-panel" style={{ backgroundImage: `url(${WZ_ASSETS.hudPanelDark})` }}>
        <div className="snake-hud-panel-title">Top Players</div>
        <div className="snake-hud-leaderboard-list">
          {leaderboard.map((snake, i) => (
            <div
              key={snake.id}
              className={`snake-hud-leaderboard-item ${snake.id === localPlayerId ? 'player' : ''}`}
            >
              <span className="snake-hud-leaderboard-rank">{i + 1}</span>
              <span className="snake-hud-leaderboard-name">
                {snake.nickname}
                {snake.id === localPlayerId && ' (You)'}
              </span>
              <span className="snake-hud-leaderboard-score">{snake.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
