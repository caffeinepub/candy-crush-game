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
    <>
      {/* Top-Left HUD - Coin and Fuel */}
      <div className="hillclimb-hud-topleft">
        {/* Coin Display */}
        <div className="hillclimb-hud-topleft-item">
          <img src={ASSETS.coinIcon} alt="Coins" className="hillclimb-hud-topleft-icon" />
          <span className="hillclimb-hud-topleft-value">{coins}</span>
        </div>

        {/* Fuel Display */}
        <div className="hillclimb-hud-topleft-item">
          <img src={ASSETS.fuelIcon} alt="Fuel" className="hillclimb-hud-topleft-icon" />
          <div className="hillclimb-hud-topleft-fuel-bar">
            <Progress value={fuelPercent} className="h-full" />
          </div>
        </div>
      </div>

      {/* Distance Display - Top Center */}
      <div className="hillclimb-hud-distance">
        <span className="hillclimb-hud-distance-value">{distance}m</span>
      </div>
    </>
  );
}
