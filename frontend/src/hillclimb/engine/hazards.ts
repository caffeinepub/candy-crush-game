import type { Vector2 } from './physics';
import type { Vehicle } from './vehicle';

export interface HazardConfig {
  density: number;
  types: string[];
}

export interface Hazard {
  position: Vector2;
  type: string;
  active: boolean;
}

export interface HazardSystem {
  hazards: Hazard[];
  nextSpawnX: number;
  config: HazardConfig;
}

export function createHazards(config: HazardConfig): HazardSystem {
  return {
    hazards: [],
    nextSpawnX: 100,
    config
  };
}

export function updateHazards(system: HazardSystem, vehicleX: number) {
  // Spawn hazards ahead
  while (system.nextSpawnX < vehicleX + 100) {
    if (Math.random() < system.config.density) {
      const type = system.config.types[Math.floor(Math.random() * system.config.types.length)];
      system.hazards.push({
        position: { x: system.nextSpawnX, y: 0 },
        type,
        active: true
      });
    }
    system.nextSpawnX += 30 + Math.random() * 50;
  }
  
  // Remove old hazards
  system.hazards = system.hazards.filter(h => h.active && h.position.x > vehicleX - 50);
}

export function checkHazardCollisions(system: HazardSystem, vehicle: Vehicle): boolean {
  for (const hazard of system.hazards) {
    if (!hazard.active) continue;
    
    const dx = hazard.position.x - vehicle.position.x;
    const dy = hazard.position.y - vehicle.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 3) {
      hazard.active = false;
      return true; // Collision detected
    }
  }
  
  return false;
}
