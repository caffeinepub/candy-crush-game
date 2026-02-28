import type { Vehicle } from './vehicle';
import type { FuelSystem } from './fuel';

export interface FailureState {
  isFlipped: boolean;
  flipTimer: number;
  hasCrashed: boolean;
}

export function checkFailures(
  failure: FailureState,
  vehicle: Vehicle,
  fuel: FuelSystem,
  dt: number
) {
  // Check if flipped (rotation > 90 degrees)
  const rotation = vehicle.rotation % (Math.PI * 2);
  const isUpsideDown = Math.abs(rotation) > Math.PI / 2 && Math.abs(rotation) < (3 * Math.PI) / 2;
  
  if (isUpsideDown) {
    failure.isFlipped = true;
    failure.flipTimer += dt;
  } else {
    failure.isFlipped = false;
    failure.flipTimer = 0;
  }
  
  // Check for high-impact crash (high velocity + sudden stop)
  const speed = Math.sqrt(vehicle.velocity.x ** 2 + vehicle.velocity.y ** 2);
  if (speed > 30 && (vehicle.wheels.front.grounded || vehicle.wheels.rear.grounded)) {
    const impactForce = speed * 0.1;
    if (impactForce > 5) {
      failure.hasCrashed = true;
    }
  }
}
