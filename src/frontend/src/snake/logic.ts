import { Vector2, Snake, Pickup, PickupType, SnakeGameState } from './types';

// Arena configuration
export const WORLD_WIDTH = 4000;
export const WORLD_HEIGHT = 4000;
export const SEGMENT_SPACING = 12;
export const BASE_SPEED = 150; // pixels per second (medium speed)
export const BOOST_SPEED = 250; // pixels per second
export const HEAD_RADIUS = 16;
export const INITIAL_LENGTH = 10;
export const AI_COUNT = 8;
export const PICKUP_COUNT = 300;

// Pickup configuration
export const PICKUP_CONFIG: Record<PickupType, { radius: number; value: number; growth: number; weight: number }> = {
  small: { radius: 4, value: 1, growth: 0.5, weight: 0.7 },
  medium: { radius: 7, value: 3, growth: 1.5, weight: 0.25 },
  large: { radius: 11, value: 10, growth: 4, weight: 0.05 },
};

// Unique ID counter for pickups
let pickupIdCounter = 0;

// Helper functions
export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate shortest distance between two points considering world wrap-around
 */
export function toroidalDistance(a: Vector2, b: Vector2): { dx: number; dy: number; dist: number } {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  
  // Find shortest path considering wrap-around
  if (Math.abs(dx) > WORLD_WIDTH / 2) {
    dx = dx > 0 ? dx - WORLD_WIDTH : dx + WORLD_WIDTH;
  }
  if (Math.abs(dy) > WORLD_HEIGHT / 2) {
    dy = dy > 0 ? dy - WORLD_HEIGHT : dy + WORLD_HEIGHT;
  }
  
  const dist = Math.sqrt(dx * dx + dy * dy);
  return { dx, dy, dist };
}

export function normalize(v: Vector2): Vector2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function angleToVector(angle: number): Vector2 {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

export function vectorToAngle(v: Vector2): number {
  return Math.atan2(v.y, v.x);
}

export function lerpAngle(from: number, to: number, t: number): number {
  let diff = to - from;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return from + diff * t;
}

/**
 * Wrap a position to stay within world boundaries
 */
function wrapPosition(pos: Vector2): Vector2 {
  let x = pos.x;
  let y = pos.y;
  
  while (x < 0) x += WORLD_WIDTH;
  while (x >= WORLD_WIDTH) x -= WORLD_WIDTH;
  while (y < 0) y += WORLD_HEIGHT;
  while (y >= WORLD_HEIGHT) y -= WORLD_HEIGHT;
  
  return { x, y };
}

// Initialize game state
export function createInitialState(): SnakeGameState {
  pickupIdCounter = 0; // Reset counter on new game
  
  const player = createSnake(true, WORLD_WIDTH / 2, WORLD_HEIGHT / 2, '#2ed573');
  const aiSnakes = Array.from({ length: AI_COUNT }, (_, i) => {
    const angle = (i / AI_COUNT) * Math.PI * 2;
    const distance = 800;
    const x = WORLD_WIDTH / 2 + Math.cos(angle) * distance;
    const y = WORLD_HEIGHT / 2 + Math.sin(angle) * distance;
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#fdcb6e', '#e17055'];
    return createSnake(false, x, y, colors[i % colors.length]);
  });

  const pickups = generatePickups(PICKUP_COUNT, [player, ...aiSnakes]);

  return {
    player,
    aiSnakes,
    pickups,
    status: 'idle',
    worldSize: { width: WORLD_WIDTH, height: WORLD_HEIGHT },
    camera: { x: player.segments[0].x, y: player.segments[0].y },
  };
}

function createSnake(isPlayer: boolean, x: number, y: number, color: string): Snake {
  const segments: Vector2[] = [];
  const angle = Math.random() * Math.PI * 2;
  
  for (let i = 0; i < INITIAL_LENGTH; i++) {
    segments.push({
      x: x - Math.cos(angle) * i * SEGMENT_SPACING,
      y: y - Math.sin(angle) * i * SEGMENT_SPACING,
    });
  }

  return {
    id: isPlayer ? 'player' : `ai-${Math.random().toString(36).substr(2, 9)}`,
    segments,
    angle,
    speed: BASE_SPEED,
    score: 0,
    isPlayer,
    alive: true,
    color,
    aiState: isPlayer ? undefined : { targetPickup: undefined, avoidanceVector: undefined },
  };
}

export function generatePickups(count: number, snakes: Snake[]): Pickup[] {
  const pickups: Pickup[] = [];
  const occupiedAreas = snakes.flatMap(s => s.segments);

  for (let i = 0; i < count; i++) {
    let position: Vector2;
    let attempts = 0;
    
    do {
      position = {
        x: Math.random() * (WORLD_WIDTH - 200) + 100,
        y: Math.random() * (WORLD_HEIGHT - 200) + 100,
      };
      attempts++;
    } while (
      attempts < 50 &&
      occupiedAreas.some(seg => distance(seg, position) < 100)
    );

    const type = getRandomPickupType();
    const config = PICKUP_CONFIG[type];

    pickups.push({
      id: `pickup-${pickupIdCounter++}`,
      position,
      type,
      radius: config.radius,
      value: config.value,
      growthAmount: config.growth,
    });
  }

  return pickups;
}

function getRandomPickupType(): PickupType {
  const rand = Math.random();
  if (rand < PICKUP_CONFIG.small.weight) return 'small';
  if (rand < PICKUP_CONFIG.small.weight + PICKUP_CONFIG.medium.weight) return 'medium';
  return 'large';
}

export function updateSnakeMovement(snake: Snake, deltaTime: number): Snake {
  if (!snake.alive) return snake;

  const head = snake.segments[0];
  const direction = angleToVector(snake.angle);
  
  // Convert speed from pixels/second to pixels/frame using actual deltaTime in seconds
  const moveDistance = snake.speed * (deltaTime / 1000);

  const newHead = wrapPosition({
    x: head.x + direction.x * moveDistance,
    y: head.y + direction.y * moveDistance,
  });

  const newSegments = [newHead];
  
  // Each segment follows the segment in front of it using toroidal distance
  // This prevents jitter and handles wrap-around smoothly
  for (let i = 1; i < snake.segments.length; i++) {
    const leader = newSegments[i - 1];
    const follower = snake.segments[i];
    
    const { dx, dy, dist } = toroidalDistance(follower, leader);
    
    if (dist > SEGMENT_SPACING) {
      // Move follower toward leader maintaining SEGMENT_SPACING
      const ratio = (dist - SEGMENT_SPACING) / dist;
      newSegments.push(wrapPosition({
        x: follower.x + dx * ratio,
        y: follower.y + dy * ratio,
      }));
    } else {
      // Follower is close enough, keep it in place
      newSegments.push({ ...follower });
    }
  }

  return { ...snake, segments: newSegments };
}

export function checkPickupCollision(snake: Snake, pickups: Pickup[]): { collected: Pickup[]; remaining: Pickup[] } {
  const head = snake.segments[0];
  const collected: Pickup[] = [];
  const remaining: Pickup[] = [];

  pickups.forEach(pickup => {
    if (distance(head, pickup.position) < HEAD_RADIUS + pickup.radius) {
      collected.push(pickup);
    } else {
      remaining.push(pickup);
    }
  });

  return { collected, remaining };
}

export function growSnake(snake: Snake, amount: number): Snake {
  const segments = [...snake.segments];
  const segmentsToAdd = Math.floor(amount);
  
  for (let i = 0; i < segmentsToAdd; i++) {
    const lastSeg = segments[segments.length - 1];
    const secondLast = segments[segments.length - 2] || lastSeg;
    
    const { dx, dy } = toroidalDistance(secondLast, lastSeg);
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    
    segments.push(wrapPosition({
      x: lastSeg.x + (dx / len) * SEGMENT_SPACING,
      y: lastSeg.y + (dy / len) * SEGMENT_SPACING,
    }));
  }

  return { ...snake, segments };
}

export function checkSnakeCollisions(snakes: Snake[]): { eliminated: string[]; transfers: Array<{ from: string; to: string; points: number }> } {
  const eliminated: string[] = [];
  const transfers: Array<{ from: string; to: string; points: number }> = [];

  snakes.forEach(snake => {
    if (!snake.alive) return;

    const head = snake.segments[0];

    snakes.forEach(other => {
      if (!other.alive || snake.id === other.id) return;

      // Check head collision with other's body (skip head)
      for (let i = 3; i < other.segments.length; i++) {
        const segment = other.segments[i];
        if (distance(head, segment) < HEAD_RADIUS * 1.5) {
          if (!eliminated.includes(snake.id)) {
            eliminated.push(snake.id);
            transfers.push({
              from: snake.id,
              to: other.id,
              points: snake.score,
            });
          }
          break;
        }
      }
    });
  });

  return { eliminated, transfers };
}

export function updateAI(snake: Snake, pickups: Pickup[], allSnakes: Snake[]): Snake {
  if (!snake.alive || snake.isPlayer) return snake;

  const head = snake.segments[0];
  let targetAngle = snake.angle;

  // Find nearest pickup
  let nearestPickup: Pickup | undefined;
  let nearestDist = Infinity;

  pickups.forEach(pickup => {
    const dist = distance(head, pickup.position);
    if (dist < nearestDist && dist < 400) {
      nearestDist = dist;
      nearestPickup = pickup;
    }
  });

  if (nearestPickup) {
    const dx = nearestPickup.position.x - head.x;
    const dy = nearestPickup.position.y - head.y;
    targetAngle = Math.atan2(dy, dx);
  } else {
    // Wander
    if (Math.random() < 0.02) {
      targetAngle = snake.angle + (Math.random() - 0.5) * 0.5;
    }
  }

  // Avoid other snakes
  allSnakes.forEach(other => {
    if (other.id === snake.id || !other.alive) return;
    
    other.segments.forEach((seg, i) => {
      if (i < 3) return; // Skip head area
      const dist = distance(head, seg);
      if (dist < 150) {
        const dx = head.x - seg.x;
        const dy = head.y - seg.y;
        const avoidAngle = Math.atan2(dy, dx);
        const weight = 1 - (dist / 150);
        targetAngle = lerpAngle(targetAngle, avoidAngle, weight * 0.5);
      }
    });
  });

  const newAngle = lerpAngle(snake.angle, targetAngle, 0.08);

  return { ...snake, angle: newAngle, targetAngle };
}

export function respawnAISnake(id: string): Snake {
  const x = Math.random() * (WORLD_WIDTH - 400) + 200;
  const y = Math.random() * (WORLD_HEIGHT - 400) + 200;
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#fdcb6e', '#e17055'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return createSnake(false, x, y, color);
}
