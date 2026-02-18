import type { Vector2 } from './physics';
import { vec2, add, scale, integrate } from './physics';
import type { Terrain } from './terrain';
import { sampleTerrain, sampleTerrainNormal } from './terrain';
import type { InputState } from './input';

export interface VehicleStats {
  acceleration: number;
  topSpeed: number;
  suspension: number;
  grip: number;
  maxFuel: number;
}

export interface Vehicle {
  position: Vector2;
  velocity: Vector2;
  rotation: number;
  angularVelocity: number;
  stats: VehicleStats;
  wheels: {
    front: { grounded: boolean; compression: number };
    rear: { grounded: boolean; compression: number };
  };
}

export function createVehicle(stats: VehicleStats): Vehicle {
  return {
    position: vec2(0, 0),
    velocity: vec2(0, 0),
    rotation: 0,
    angularVelocity: 0,
    stats,
    wheels: {
      front: { grounded: false, compression: 0 },
      rear: { grounded: false, compression: 0 }
    }
  };
}

export function updateVehicle(
  vehicle: Vehicle,
  input: InputState,
  terrain: Terrain,
  gravity: number,
  dt: number
) {
  const { stats } = vehicle;
  
  // Apply gravity
  vehicle.velocity.y += gravity * dt;
  
  // Ground contact and suspension
  const wheelBase = 2;
  const frontX = vehicle.position.x + Math.cos(vehicle.rotation) * wheelBase;
  const rearX = vehicle.position.x - Math.cos(vehicle.rotation) * wheelBase;
  
  const frontGroundY = sampleTerrain(terrain, frontX);
  const rearGroundY = sampleTerrain(terrain, rearX);
  
  const frontWheelY = vehicle.position.y + Math.sin(vehicle.rotation) * wheelBase;
  const rearWheelY = vehicle.position.y - Math.sin(vehicle.rotation) * wheelBase;
  
  vehicle.wheels.front.grounded = frontWheelY <= frontGroundY + 0.5;
  vehicle.wheels.rear.grounded = rearWheelY <= rearGroundY + 0.5;
  
  // Suspension forces
  if (vehicle.wheels.front.grounded) {
    const compression = frontGroundY - frontWheelY;
    vehicle.wheels.front.compression = Math.max(0, compression);
    const suspensionForce = compression * stats.suspension;
    vehicle.velocity.y += suspensionForce * dt;
  }
  
  if (vehicle.wheels.rear.grounded) {
    const compression = rearGroundY - rearWheelY;
    vehicle.wheels.rear.compression = Math.max(0, compression);
    const suspensionForce = compression * stats.suspension;
    vehicle.velocity.y += suspensionForce * dt;
  }
  
  // Drive forces (only when grounded)
  const grounded = vehicle.wheels.front.grounded || vehicle.wheels.rear.grounded;
  if (grounded) {
    const throttle = input.throttle * stats.acceleration;
    const brake = input.brake * stats.acceleration * 0.5;
    
    const terrainNormal = sampleTerrainNormal(terrain, vehicle.position.x);
    const driveForce = (throttle - brake) * dt;
    
    vehicle.velocity.x += driveForce * terrainNormal.y;
    vehicle.velocity.y -= driveForce * terrainNormal.x;
    
    // Apply grip/friction
    vehicle.velocity.x *= (1 - stats.grip * dt);
    vehicle.velocity.y *= (1 - stats.grip * dt * 0.5);
  }
  
  // Integrate position
  vehicle.position = integrate(vehicle.position, vehicle.velocity, dt);
  
  // Update rotation based on terrain
  if (grounded) {
    const terrainNormal = sampleTerrainNormal(terrain, vehicle.position.x);
    const targetRotation = Math.atan2(-terrainNormal.x, terrainNormal.y);
    vehicle.rotation += (targetRotation - vehicle.rotation) * 0.1;
  } else {
    vehicle.rotation += vehicle.angularVelocity * dt;
  }
  
  // Clamp speed
  const speed = Math.sqrt(vehicle.velocity.x ** 2 + vehicle.velocity.y ** 2);
  if (speed > stats.topSpeed) {
    const scale = stats.topSpeed / speed;
    vehicle.velocity.x *= scale;
    vehicle.velocity.y *= scale;
  }
}
