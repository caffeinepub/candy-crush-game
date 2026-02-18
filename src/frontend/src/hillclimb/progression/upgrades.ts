import type { VehicleStats } from '../engine/vehicle';

export interface UpgradeConfig {
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  statModifier: (level: number) => Partial<VehicleStats>;
}

export const UPGRADES: Record<string, UpgradeConfig> = {
  engine: {
    name: 'Engine',
    description: 'Increases acceleration and top speed',
    maxLevel: 10,
    baseCost: 100,
    statModifier: (level) => ({
      acceleration: level * 2,
      topSpeed: level * 1.5
    })
  },
  suspension: {
    name: 'Suspension',
    description: 'Improves stability on rough terrain',
    maxLevel: 10,
    baseCost: 80,
    statModifier: (level) => ({
      suspension: level * 5
    })
  },
  tires: {
    name: 'Tires',
    description: 'Better grip and control',
    maxLevel: 10,
    baseCost: 60,
    statModifier: (level) => ({
      grip: level * 0.02
    })
  },
  fuelTank: {
    name: 'Fuel Tank',
    description: 'Increases maximum fuel capacity',
    maxLevel: 10,
    baseCost: 50,
    statModifier: (level) => ({
      maxFuel: level * 10
    })
  }
};

export function getUpgradeCost(upgradeType: string, currentLevel: number): number {
  const upgrade = UPGRADES[upgradeType];
  if (!upgrade) return 0;
  return Math.floor(upgrade.baseCost * Math.pow(1.5, currentLevel));
}

export function canAffordUpgrade(coins: number, upgradeType: string, currentLevel: number): boolean {
  const upgrade = UPGRADES[upgradeType];
  if (!upgrade || currentLevel >= upgrade.maxLevel) return false;
  return coins >= getUpgradeCost(upgradeType, currentLevel);
}

export function applyUpgrades(baseStats: VehicleStats, upgradeLevels: Record<string, number>): VehicleStats {
  const stats = { ...baseStats };
  
  for (const [type, level] of Object.entries(upgradeLevels)) {
    const upgrade = UPGRADES[type];
    if (!upgrade) continue;
    
    const modifier = upgrade.statModifier(level);
    Object.assign(stats, {
      acceleration: (stats.acceleration || 0) + (modifier.acceleration || 0),
      topSpeed: (stats.topSpeed || 0) + (modifier.topSpeed || 0),
      suspension: (stats.suspension || 0) + (modifier.suspension || 0),
      grip: (stats.grip || 0) + (modifier.grip || 0),
      maxFuel: (stats.maxFuel || 0) + (modifier.maxFuel || 0)
    });
  }
  
  return stats;
}
