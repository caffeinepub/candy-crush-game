export interface FuelSystem {
  current: number;
  max: number;
  depletionRate: number;
}

export function createFuelSystem(maxFuel: number): FuelSystem {
  return {
    current: maxFuel,
    max: maxFuel,
    depletionRate: 2.5 // Adjusted for smoother continuous depletion
  };
}

export function updateFuel(fuel: FuelSystem, dt: number) {
  fuel.current = Math.max(0, fuel.current - fuel.depletionRate * dt);
}

export function refuelVehicle(fuel: FuelSystem, amount: number) {
  fuel.current = Math.min(fuel.max, fuel.current + amount);
}
