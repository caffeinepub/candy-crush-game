import type { Vehicle } from './vehicle';
import type { Terrain } from './terrain';
import { sampleTerrain } from './terrain';
import type { PickupSystem } from './pickups';
import type { HazardSystem } from './hazards';
import type { Stage } from '../stages/stages';
import { ASSETS } from '../assets';

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  vehicle: Vehicle,
  terrain: Terrain,
  pickups: PickupSystem,
  hazards: HazardSystem,
  stage: Stage
) {
  // Clear
  ctx.fillStyle = stage.skyColor;
  ctx.fillRect(0, 0, width, height);
  
  // Camera follows vehicle
  const cameraX = vehicle.position.x;
  const cameraY = vehicle.position.y - 10;
  const scale = 10; // pixels per meter
  
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, -scale); // Flip Y axis
  ctx.translate(-cameraX, -cameraY);
  
  // Draw terrain
  ctx.strokeStyle = stage.terrainColor;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = cameraX - width / scale / 2; x < cameraX + width / scale / 2; x += 0.5) {
    const y = sampleTerrain(terrain, x);
    if (x === cameraX - width / scale / 2) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  
  // Fill terrain
  ctx.fillStyle = stage.terrainColor;
  ctx.lineTo(cameraX + width / scale / 2, -100);
  ctx.lineTo(cameraX - width / scale / 2, -100);
  ctx.closePath();
  ctx.fill();
  
  // Draw pickups
  for (const pickup of pickups.pickups) {
    if (pickup.collected) continue;
    
    ctx.fillStyle = pickup.type === 'fuel' ? '#ff6b6b' : '#ffd93d';
    ctx.beginPath();
    ctx.arc(pickup.position.x, sampleTerrain(terrain, pickup.position.x) + 1, 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw hazards
  for (const hazard of hazards.hazards) {
    if (!hazard.active) continue;
    
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(
      hazard.position.x - 1,
      sampleTerrain(terrain, hazard.position.x),
      2,
      2
    );
  }
  
  // Draw vehicle (simple box for now)
  ctx.save();
  ctx.translate(vehicle.position.x, vehicle.position.y);
  ctx.rotate(vehicle.rotation);
  ctx.fillStyle = '#4a90e2';
  ctx.fillRect(-1.5, -0.5, 3, 1);
  
  // Draw wheels
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(-1, -0.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1, -0.5, 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
  ctx.restore();
}
