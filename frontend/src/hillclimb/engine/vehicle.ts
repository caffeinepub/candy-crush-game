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

export function spawnVehicleOnTerrain(vehicle: Vehicle, terrain: Terrain, spawnX: number) {
  // Sample terrain at spawn position
  const groundY = sampleTerrain(terrain, spawnX);
  const terrainNormal = sampleTerrainNormal(terrain, spawnX);
  
  // Position vehicle on terrain surface with clearance
  vehicle.position.x = spawnX;
  vehicle.position.y = groundY + 1.5; // Chassis height above ground
  
  // Align rotation to terrain
  vehicle.rotation = Math.atan2(-terrainNormal.x, terrainNormal.y);
  
  // Reset velocity
  vehicle.velocity.x = 0;
  vehicle.velocity.y = 0;
  vehicle.angularVelocity = 0;
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
  const wheelRadius = 0.4;
  
  // Calculate wheel positions in world space
  const cos = Math.cos(vehicle.rotation);
  const sin = Math.sin(vehicle.rotation);
  
  const frontWheelX = vehicle.position.x + cos * wheelBase;
  const frontWheelY = vehicle.position.y + sin * wheelBase - wheelRadius;
  
  const rearWheelX = vehicle.position.x - cos * wheelBase;
  const rearWheelY = vehicle.position.y - sin * wheelBase - wheelRadius;
  
  const frontGroundY = sampleTerrain(terrain, frontWheelX);
  const rearGroundY = sampleTerrain(terrain, rearWheelX);
  
  // Improved ground contact detection with tighter threshold
  const contactThreshold = 0.15;
  vehicle.wheels.front.grounded = frontWheelY <= frontGroundY + contactThreshold;
  vehicle.wheels.rear.grounded = rearWheelY <= rearGroundY + contactThreshold;
  
  // Enhanced suspension forces with stronger ground settling
  let totalSuspensionForceY = 0;
  let groundedWheels = 0;
  
  if (vehicle.wheels.front.grounded) {
    const penetration = frontGroundY - frontWheelY;
    vehicle.wheels.front.compression = Math.max(0, penetration);
    
    if (penetration > 0) {
      // Strong upward correction for ground penetration
      const suspensionForce = penetration * stats.suspension * 3;
      totalSuspensionForceY += suspensionForce;
      groundedWheels++;
    } else if (penetration > -0.1 && vehicle.velocity.y > 0) {
      // Near-ground downward motion: apply gentle settling force
      const settlingForce = -vehicle.velocity.y * stats.suspension * 0.5;
      totalSuspensionForceY += settlingForce;
    }
  } else {
    vehicle.wheels.front.compression = 0;
  }
  
  if (vehicle.wheels.rear.grounded) {
    const penetration = rearGroundY - rearWheelY;
    vehicle.wheels.rear.compression = Math.max(0, penetration);
    
    if (penetration > 0) {
      // Strong upward correction for ground penetration
      const suspensionForce = penetration * stats.suspension * 3;
      totalSuspensionForceY += suspensionForce;
      groundedWheels++;
    } else if (penetration > -0.1 && vehicle.velocity.y > 0) {
      // Near-ground downward motion: apply gentle settling force
      const settlingForce = -vehicle.velocity.y * stats.suspension * 0.5;
      totalSuspensionForceY += settlingForce;
    }
  } else {
    vehicle.wheels.rear.compression = 0;
  }
  
  // Apply suspension forces
  if (groundedWheels > 0 || totalSuspensionForceY !== 0) {
    vehicle.velocity.y += totalSuspensionForceY * dt;
    
    // Dampen vertical velocity when grounded to prevent bouncing
    if (groundedWheels > 0 && Math.abs(vehicle.velocity.y) < 2) {
      vehicle.velocity.y *= 0.85;
    }
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
  
  // Update rotation based on terrain when grounded
  if (grounded) {
    const terrainNormal = sampleTerrainNormal(terrain, vehicle.position.x);
    const targetRotation = Math.atan2(-terrainNormal.x, terrainNormal.y);
    vehicle.rotation += (targetRotation - vehicle.rotation) * 0.15;
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
