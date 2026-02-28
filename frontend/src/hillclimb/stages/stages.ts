import type { TerrainConfig } from '../engine/terrain';
import type { HazardConfig } from '../engine/hazards';

export type StageId = 'canyon' | 'desert' | 'moon';

export interface Stage {
  id: StageId;
  name: string;
  description: string;
  terrainConfig: TerrainConfig;
  hazardConfig: HazardConfig;
  gravity: number;
  skyColor: string;
  terrainColor: string;
}

export const STAGES: Stage[] = [
  {
    id: 'canyon',
    name: 'Climb Canyon',
    description: 'Rolling hills and steep climbs',
    terrainConfig: {
      amplitude: 5,
      frequency: 0.05,
      roughness: 0.5
    },
    hazardConfig: {
      density: 0.1,
      types: ['boulder', 'log']
    },
    gravity: 20,
    skyColor: '#87CEEB',
    terrainColor: '#8B7355'
  },
  {
    id: 'desert',
    name: 'Desert Dunes',
    description: 'Sandy slopes and scorching heat',
    terrainConfig: {
      amplitude: 8,
      frequency: 0.03,
      roughness: 0.3
    },
    hazardConfig: {
      density: 0.05,
      types: ['cactus', 'rock']
    },
    gravity: 20,
    skyColor: '#FFD700',
    terrainColor: '#DEB887'
  },
  {
    id: 'moon',
    name: 'Lunar Surface',
    description: 'Low gravity, high jumps!',
    terrainConfig: {
      amplitude: 10,
      frequency: 0.04,
      roughness: 0.7
    },
    hazardConfig: {
      density: 0.15,
      types: ['crater', 'rock']
    },
    gravity: 5,
    skyColor: '#000033',
    terrainColor: '#808080'
  }
];

export function getStageById(id: StageId): Stage {
  return STAGES.find(s => s.id === id) || STAGES[0];
}
