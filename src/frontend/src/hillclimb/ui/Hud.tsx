import { ASSETS } from '../assets';
import { Progress } from '@/components/ui/progress';

interface HudProps {
  distance: number;
  coins: number;
  fuel: number;
  maxFuel: number;
}

export default function Hud({ distance, coins, fuel, maxFuel }: HudProps) {
  const fuelPercent = (fuel / maxFuel) * 100;

  return (
    <div className="hillclimb-hud">
      <div className="hillclimb-hud-panel" style={{ backgroundImage: `url(${ASSETS.hudPanel})` }}>
        <div className="hillclimb-hud-stat">
          <span className="hillclimb-hud-label">Distance</span>
          <span className="hillclimb-hud-value">{distance}m</span>
        </div>

        <div className="hillclimb-hud-stat">
          <img src={ASSETS.coinIcon} alt="Coins" className="hillclimb-hud-icon" />
          <span className="hillclimb-hud-value">{coins}</span>
        </div>

        <div className="hillclimb-hud-fuel">
          <img src={ASSETS.fuelIcon} alt="Fuel" className="hillclimb-hud-icon" />
          <Progress value={fuelPercent} className="hillclimb-fuel-bar" />
        </div>
      </div>
    </div>
  );
}
