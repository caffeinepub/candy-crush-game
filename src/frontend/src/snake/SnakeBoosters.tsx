import { WZ_ASSETS } from './wzAssets';

export default function SnakeBoosters() {
  const boosters = [
    { icon: 'magnet', count: 0 },
    { icon: 'boost', count: 0 },
    { icon: 'plus', count: 0 },
  ];

  return (
    <div className="snake-boosters">
      {boosters.map((booster, index) => (
        <button 
          key={index} 
          className="snake-booster-btn" 
          disabled
          style={{ backgroundImage: `url(${WZ_ASSETS.boosterBtnBg})` }}
        >
          <div 
            className="snake-booster-icon" 
            style={{ 
              backgroundImage: `url(${WZ_ASSETS.boosterIcons})`,
              backgroundPosition: `${-index * 128}px 0` 
            }} 
          />
          <span className="snake-booster-count">{booster.count}</span>
        </button>
      ))}
    </div>
  );
}
