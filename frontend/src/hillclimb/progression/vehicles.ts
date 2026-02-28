import type { VehicleStats } from '../engine/vehicle';

export type VehicleId = 'hillClimber' | 'bike' | 'truck';

export interface VehicleConfig {
  id: VehicleId;
  name: string;
  description: string;
  unlockCost: number;
  baseStats: VehicleStats;
}

export const VEHICLES: VehicleConfig[] = [
  {
    id: 'hillClimber',
    name: 'Hill Climber',
    description: 'The classic jeep. Balanced and reliable.',
    unlockCost: 0,
    baseStats: {
      acceleration: 10,
      topSpeed: 20,
      suspension: 50,
      grip: 0.3,
      maxFuel: 100
    }
  },
  {
    id: 'bike',
    name: 'Dirt Bike',
    description: 'Fast and agile, but less stable.',
    unlockCost: 500,
    baseStats: {
      acceleration: 15,
      topSpeed: 25,
      suspension: 30,
      grip: 0.2,
      maxFuel: 80
    }
  },
  {
    id: 'truck',
    name: 'Monster Truck',
    description: 'Heavy and powerful. Crushes obstacles.',
    unlockCost: 1000,
    baseStats: {
      acceleration: 8,
      topSpeed: 18,
      suspension: 70,
      grip: 0.4,
      maxFuel: 120
    }
  }
];

export function getVehicleById(id: VehicleId): VehicleConfig {
  return VEHICLES.find(v => v.id === id) || VEHICLES[0];
}
