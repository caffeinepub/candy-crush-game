import type { Vehicle } from './vehicle';

export interface StuntState {
  isAirborne: boolean;
  airTime: number;
  rotations: number;
}

export function detectStunts(stunt: StuntState, vehicle: Vehicle, dt: number) {
  const grounded = vehicle.wheels.front.grounded || vehicle.wheels.rear.grounded;
  
  if (!grounded) {
    stunt.isAirborne = true;
    stunt.airTime += dt;
  } else {
    if (stunt.isAirborne) {
      // Landing - reset
      stunt.isAirborne = false;
      stunt.airTime = 0;
      stunt.rotations = 0;
    }
  }
}
