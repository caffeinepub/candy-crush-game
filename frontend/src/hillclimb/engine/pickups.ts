import type { Vector2 } from './physics';
import type { Vehicle } from './vehicle';
import type { ScoringState } from './scoring';
import type { Terrain } from './terrain';
import { sampleTerrain } from './terrain';

export interface Pickup {
  position: Vector2;
  type: 'fuel' | 'coin';
  collected: boolean;
}

export interface PickupSystem {
  pickups: Pickup[];
  nextSpawnX: number;
}

export function createPickups(): PickupSystem {
  return {
    pickups: [],
    nextSpawnX: 50
  };
}

export function updatePickups(system: PickupSystem, vehicleX: number, terrain: Terrain) {
  // Spawn new pickups ahead of vehicle
  while (system.nextSpawnX < vehicleX + 100) {
    const type = Math.random() < 0.3 ? 'fuel' : 'coin';
    const spawnX = system.nextSpawnX;
    const groundY = sampleTerrain(terrain, spawnX);
    
    system.pickups.push({
      position: { x: spawnX, y: groundY + 1.5 }, // Spawn above terrain
      type,
      collected: false
    });
    system.nextSpawnX += 20 + Math.random() * 30;
  }
  
  // Remove old pickups
  system.pickups = system.pickups.filter(p => !p.collected && p.position.x > vehicleX - 50);
}

export function checkPickupCollisions(
  system: PickupSystem,
  vehicle: Vehicle,
  scoring: ScoringState
): number {
  let fuelCollected = 0;
  
  for (const pickup of system.pickups) {
    if (pickup.collected) continue;
    
    const dx = pickup.position.x - vehicle.position.x;
    const dy = pickup.position.y - vehicle.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 2) {
      pickup.collected = true;
      
      if (pickup.type === 'fuel') {
        fuelCollected += 20;
      } else if (pickup.type === 'coin') {
        scoring.coins += 1;
      }
    }
  }
  
  return fuelCollected;
}
