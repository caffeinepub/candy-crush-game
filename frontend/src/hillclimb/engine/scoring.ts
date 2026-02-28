import type { Vehicle } from './vehicle';
import type { StuntState } from './stunts';

export interface ScoringState {
  distance: number;
  coins: number;
  stuntPoints: number;
}

export function updateScoring(
  scoring: ScoringState,
  vehicle: Vehicle,
  stunt: StuntState,
  dt: number
) {
  // Update distance
  if (vehicle.velocity.x > 0) {
    scoring.distance += vehicle.velocity.x * dt;
  }
  
  // Award coins based on distance
  const distanceCoins = Math.floor(scoring.distance / 10);
  scoring.coins = Math.max(scoring.coins, distanceCoins);
  
  // Award stunt points for airtime
  if (stunt.isAirborne && stunt.airTime > 0.5) {
    scoring.stuntPoints += Math.floor(stunt.airTime * 10) * dt;
  }
}
