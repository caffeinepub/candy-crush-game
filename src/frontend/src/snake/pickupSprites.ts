// Pickup sprite mapping helper

export interface SpriteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Food sprite sheet layout (4x4 grid in 1024x1024)
const FOOD_SPRITE_SIZE = 256;
const FOOD_SPRITES: SpriteRect[] = [
  { x: 0, y: 0, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE, y: 0, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE * 2, y: 0, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE * 3, y: 0, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: 0, y: FOOD_SPRITE_SIZE, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE, y: FOOD_SPRITE_SIZE, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE * 2, y: FOOD_SPRITE_SIZE, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE * 3, y: FOOD_SPRITE_SIZE, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: 0, y: FOOD_SPRITE_SIZE * 2, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE, y: FOOD_SPRITE_SIZE * 2, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE * 2, y: FOOD_SPRITE_SIZE * 2, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE * 3, y: FOOD_SPRITE_SIZE * 2, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: 0, y: FOOD_SPRITE_SIZE * 3, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE, y: FOOD_SPRITE_SIZE * 3, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE * 2, y: FOOD_SPRITE_SIZE * 3, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
  { x: FOOD_SPRITE_SIZE * 3, y: FOOD_SPRITE_SIZE * 3, width: FOOD_SPRITE_SIZE, height: FOOD_SPRITE_SIZE },
];

// Helper to generate stable key from pickup id
export function getPickupKey(pickupId: string): string {
  return pickupId;
}

export function getFoodSprite(pickupId: string): SpriteRect {
  // Use pickup ID to consistently select a sprite
  const hash = pickupId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % FOOD_SPRITES.length;
  return FOOD_SPRITES[index];
}

export function getPickupRenderSize(type: 'small' | 'medium' | 'large' | 'coin'): number {
  switch (type) {
    case 'small': return 24;
    case 'medium': return 36;
    case 'large': return 48;
    case 'coin': return 32;
  }
}
