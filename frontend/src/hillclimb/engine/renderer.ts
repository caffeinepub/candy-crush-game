import type { Vehicle } from './vehicle';
import type { Terrain } from './terrain';
import { sampleTerrain } from './terrain';
import type { PickupSystem } from './pickups';
import type { HazardSystem } from './hazards';
import type { Stage } from '../stages/stages';
import { ASSETS } from '../assets';

// Image cache to avoid recreating images every frame
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): HTMLImageElement {
  if (!imageCache.has(src)) {
    const img = new Image();
    img.src = src;
    imageCache.set(src, img);
  }
  return imageCache.get(src)!;
}

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
  
  // Draw terrain with texture
  ctx.save();
  
  // Create terrain path
  ctx.beginPath();
  const startX = cameraX - width / scale / 2;
  const endX = cameraX + width / scale / 2;
  
  for (let x = startX; x < endX; x += 0.5) {
    const y = sampleTerrain(terrain, x);
    if (x === startX) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  // Close path for fill
  ctx.lineTo(endX, -100);
  ctx.lineTo(startX, -100);
  ctx.closePath();
  
  // Fill with gradient for depth
  const gradient = ctx.createLinearGradient(0, 0, 0, -20);
  gradient.addColorStop(0, stage.terrainColor);
  gradient.addColorStop(1, adjustColorBrightness(stage.terrainColor, -20));
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Add texture detail with subtle lines
  ctx.strokeStyle = adjustColorBrightness(stage.terrainColor, -30);
  ctx.lineWidth = 0.1;
  for (let x = startX; x < endX; x += 2) {
    const y = sampleTerrain(terrain, x);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 3);
    ctx.stroke();
  }
  
  // Terrain outline
  ctx.beginPath();
  for (let x = startX; x < endX; x += 0.5) {
    const y = sampleTerrain(terrain, x);
    if (x === startX) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.strokeStyle = adjustColorBrightness(stage.terrainColor, 20);
  ctx.lineWidth = 0.2;
  ctx.stroke();
  
  ctx.restore();
  
  // Draw pickups with icons
  const fuelIcon = loadImage(ASSETS.fuelIcon);
  const coinIcon = loadImage(ASSETS.coinIcon);
  
  for (const pickup of pickups.pickups) {
    if (pickup.collected) continue;
    
    const icon = pickup.type === 'fuel' ? fuelIcon : coinIcon;
    const size = 1.2;
    
    ctx.save();
    ctx.translate(pickup.position.x, pickup.position.y);
    ctx.scale(1, -1); // Flip back for image
    ctx.drawImage(icon, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
  
  // Draw hazards
  for (const hazard of hazards.hazards) {
    if (!hazard.active) continue;
    
    const groundY = sampleTerrain(terrain, hazard.position.x);
    
    // Draw rock/obstacle with shading
    ctx.save();
    ctx.translate(hazard.position.x, groundY);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 1.2, 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Rock body with gradient
    const rockGradient = ctx.createRadialGradient(-0.3, 0.5, 0, 0, 0, 1.5);
    rockGradient.addColorStop(0, '#a0826d');
    rockGradient.addColorStop(1, '#6b5444');
    ctx.fillStyle = rockGradient;
    ctx.beginPath();
    ctx.moveTo(-1, 0);
    ctx.lineTo(-0.5, 1.5);
    ctx.lineTo(0.5, 1.8);
    ctx.lineTo(1, 0.5);
    ctx.lineTo(0.5, 0);
    ctx.closePath();
    ctx.fill();
    
    // Rock highlights
    ctx.strokeStyle = '#c9b8a8';
    ctx.lineWidth = 0.1;
    ctx.beginPath();
    ctx.moveTo(-0.5, 1.5);
    ctx.lineTo(0.5, 1.8);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Draw vehicle with sprite-like appearance
  ctx.save();
  ctx.translate(vehicle.position.x, vehicle.position.y);
  ctx.rotate(vehicle.rotation);
  ctx.scale(1, -1); // Flip for sprite rendering
  
  // Vehicle body with gradient and details
  const bodyGradient = ctx.createLinearGradient(0, -0.8, 0, 0.8);
  bodyGradient.addColorStop(0, '#e74c3c');
  bodyGradient.addColorStop(0.5, '#c0392b');
  bodyGradient.addColorStop(1, '#a93226');
  ctx.fillStyle = bodyGradient;
  
  // Main chassis
  ctx.fillRect(-1.5, -0.2, 3, 0.8);
  
  // Cabin
  ctx.fillRect(-0.8, -0.8, 1.6, 0.6);
  
  // Window
  ctx.fillStyle = 'rgba(100, 150, 200, 0.6)';
  ctx.fillRect(-0.6, -0.7, 1.2, 0.4);
  
  // Body outline
  ctx.strokeStyle = '#8b1e1e';
  ctx.lineWidth = 0.08;
  ctx.strokeRect(-1.5, -0.2, 3, 0.8);
  ctx.strokeRect(-0.8, -0.8, 1.6, 0.6);
  
  // Highlights
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 0.06;
  ctx.beginPath();
  ctx.moveTo(-1.4, -0.15);
  ctx.lineTo(1.4, -0.15);
  ctx.stroke();
  
  ctx.restore();
  
  // Draw wheels with detail
  ctx.save();
  ctx.translate(vehicle.position.x, vehicle.position.y);
  ctx.rotate(vehicle.rotation);
  
  const wheelPositions = [
    { x: -1, y: -0.5 },
    { x: 1, y: -0.5 }
  ];
  
  for (const pos of wheelPositions) {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    
    // Tire
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.arc(0, 0, 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Rim
    ctx.fillStyle = '#95a5a6';
    ctx.beginPath();
    ctx.arc(0, 0, 0.25, 0, Math.PI * 2);
    ctx.fill();
    
    // Rim detail
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 0.05;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 0.25, Math.sin(angle) * 0.25);
      ctx.stroke();
    }
    
    // Tire tread
    ctx.strokeStyle = '#1a252f';
    ctx.lineWidth = 0.06;
    ctx.beginPath();
    ctx.arc(0, 0, 0.38, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  ctx.restore();
  ctx.restore();
}

// Helper to adjust color brightness
function adjustColorBrightness(color: string, amount: number): string {
  // Simple brightness adjustment for hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  return color;
}
