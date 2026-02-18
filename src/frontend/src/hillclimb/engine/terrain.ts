export interface TerrainConfig {
  amplitude: number;
  frequency: number;
  roughness: number;
}

export interface Terrain {
  config: TerrainConfig;
  seed: number;
}

export function createTerrain(config: TerrainConfig): Terrain {
  return {
    config,
    seed: Math.random() * 10000
  };
}

export function sampleTerrain(terrain: Terrain, x: number): number {
  const { amplitude, frequency, roughness } = terrain.config;
  const { seed } = terrain;
  
  // Simple multi-octave noise approximation
  let y = 0;
  let amp = amplitude;
  let freq = frequency;
  
  for (let i = 0; i < 3; i++) {
    y += Math.sin((x + seed) * freq) * amp;
    amp *= roughness;
    freq *= 2;
  }
  
  return y;
}

export function sampleTerrainNormal(terrain: Terrain, x: number): { x: number; y: number } {
  const delta = 0.1;
  const y1 = sampleTerrain(terrain, x - delta);
  const y2 = sampleTerrain(terrain, x + delta);
  const dx = 2 * delta;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  return { x: -dy / len, y: dx / len };
}
