// Core Space Snake game logic

export const WORLD_SIZE = 8000;
export const SPAWN_RADIUS = 2000;
export const PLAYER_SPEED = 3.2;
export const BOT_SPEED = 2.6;
export const SEGMENT_SPACING = 18;
export const INITIAL_LENGTH = 20;
export const COIN_RADIUS = 22;
export const POINT_RADIUS = 18;
export const HEAD_COLLISION_RADIUS = 28;
export const SNAKE_HEAD_RADIUS = 24;

export interface Vector2 {
  x: number;
  y: number;
}

export interface SpaceSnakeSegment {
  x: number;
  y: number;
}

export interface SpaceSnakeCoin {
  id: string;
  x: number;
  y: number;
  value: number;
}

export interface SpaceSnakeColorPoint {
  id: string;
  x: number;
  y: number;
  color: 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'cyan' | 'orange' | 'pink';
  value: number;
}

export interface SpaceSnake {
  id: string;
  segments: SpaceSnakeSegment[];
  angle: number;
  speed: number;
  color: string;
  name: string;
  isPlayer: boolean;
  score: number;
  boosting: boolean;
  // For bots: target angle
  targetAngle?: number;
  wanderTimer?: number;
}

export interface KillDropResult {
  coins: SpaceSnakeCoin[];
  points: SpaceSnakeColorPoint[];
}

const COLORS = [
  '#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff',
  '#44ffff', '#ff8844', '#8844ff', '#44ff88', '#ff4488',
];

const POINT_COLORS: SpaceSnakeColorPoint['color'][] = [
  'red', 'green', 'blue', 'yellow', 'purple', 'cyan', 'orange', 'pink'
];

const POINT_COLOR_VALUES: Record<SpaceSnakeColorPoint['color'], number> = {
  red: 3,
  green: 2,
  blue: 2,
  yellow: 4,
  purple: 5,
  cyan: 3,
  orange: 4,
  pink: 3,
};

let idCounter = 0;
function genId(prefix: string): string {
  return `${prefix}_${++idCounter}_${Math.random().toString(36).slice(2, 7)}`;
}

export function createPlayerSnake(x: number, y: number, name: string): SpaceSnake {
  const segments: SpaceSnakeSegment[] = [];
  for (let i = 0; i < INITIAL_LENGTH; i++) {
    segments.push({ x: x - i * SEGMENT_SPACING, y });
  }
  return {
    id: 'player',
    segments,
    angle: 0,
    speed: PLAYER_SPEED,
    color: '#00e5ff',
    name,
    isPlayer: true,
    score: 0,
    boosting: false,
  };
}

export function createBotSnake(index: number, playerX: number, playerY: number): SpaceSnake {
  const angle = Math.random() * Math.PI * 2;
  const dist = 400 + Math.random() * SPAWN_RADIUS;
  const x = playerX + Math.cos(angle) * dist;
  const y = playerY + Math.sin(angle) * dist;
  const snakeAngle = Math.random() * Math.PI * 2;
  const segments: SpaceSnakeSegment[] = [];
  const length = INITIAL_LENGTH + Math.floor(Math.random() * 30);
  for (let i = 0; i < length; i++) {
    segments.push({
      x: x - Math.cos(snakeAngle) * i * SEGMENT_SPACING,
      y: y - Math.sin(snakeAngle) * i * SEGMENT_SPACING,
    });
  }
  return {
    id: `bot_${index}_${Date.now()}`,
    segments,
    angle: snakeAngle,
    speed: BOT_SPEED + Math.random() * 0.5,
    color: COLORS[index % COLORS.length],
    name: BOT_NAMES[index % BOT_NAMES.length],
    isPlayer: false,
    score: Math.floor(Math.random() * 50),
    boosting: false,
    targetAngle: snakeAngle,
    wanderTimer: Math.random() * 100,
  };
}

const BOT_NAMES = [
  'Cobra', 'Viper', 'Mamba', 'Python', 'Anaconda',
  'Rattler', 'Boa', 'Adder', 'Asp', 'Krait',
  'Taipan', 'Copperhead', 'Sidewinder', 'Kingsnake', 'Racer',
];

export function spawnCoin(playerX: number, playerY: number): SpaceSnakeCoin {
  const angle = Math.random() * Math.PI * 2;
  const dist = 100 + Math.random() * SPAWN_RADIUS;
  return {
    id: genId('coin'),
    x: playerX + Math.cos(angle) * dist,
    y: playerY + Math.sin(angle) * dist,
    value: 1,
  };
}

export function spawnColorPoint(playerX: number, playerY: number): SpaceSnakeColorPoint {
  const angle = Math.random() * Math.PI * 2;
  const dist = 100 + Math.random() * SPAWN_RADIUS;
  const color = POINT_COLORS[Math.floor(Math.random() * POINT_COLORS.length)];
  return {
    id: genId('pt'),
    x: playerX + Math.cos(angle) * dist,
    y: playerY + Math.sin(angle) * dist,
    color,
    value: POINT_COLOR_VALUES[color],
  };
}

/**
 * Generate kill drops (coins + colored points) scattered along a dead snake's body.
 * Larger snakes drop more and higher-value items.
 */
export function generateKillDrops(deadSnake: SpaceSnake): KillDropResult {
  const length = deadSnake.segments.length;
  // Scale drops with snake size
  // Small snake (20 segs) → ~5 coins, 3 points
  // Large snake (100 segs) → ~40 coins, 20 points
  const coinCount = Math.max(3, Math.floor(length * 0.4));
  const pointCount = Math.max(2, Math.floor(length * 0.2));

  const coins: SpaceSnakeCoin[] = [];
  const points: SpaceSnakeColorPoint[] = [];

  // Coin value scales with snake size
  const coinValue = Math.max(1, Math.floor(length / 20));

  // Distribute coins along body segments with scatter
  for (let i = 0; i < coinCount; i++) {
    const segIdx = Math.floor(Math.random() * deadSnake.segments.length);
    const seg = deadSnake.segments[segIdx];
    const scatter = 40 + Math.random() * 60;
    const scatterAngle = Math.random() * Math.PI * 2;
    coins.push({
      id: genId('drop_coin'),
      x: seg.x + Math.cos(scatterAngle) * scatter,
      y: seg.y + Math.sin(scatterAngle) * scatter,
      value: coinValue,
    });
  }

  // Distribute colored points along body segments with scatter
  for (let i = 0; i < pointCount; i++) {
    const segIdx = Math.floor(Math.random() * deadSnake.segments.length);
    const seg = deadSnake.segments[segIdx];
    const scatter = 30 + Math.random() * 50;
    const scatterAngle = Math.random() * Math.PI * 2;
    const color = POINT_COLORS[Math.floor(Math.random() * POINT_COLORS.length)];
    // Point value also scales with snake size
    const baseValue = POINT_COLOR_VALUES[color];
    const scaledValue = Math.max(baseValue, Math.floor(baseValue * length / 30));
    points.push({
      id: genId('drop_pt'),
      x: seg.x + Math.cos(scatterAngle) * scatter,
      y: seg.y + Math.sin(scatterAngle) * scatter,
      color,
      value: scaledValue,
    });
  }

  return { coins, points };
}

export function dist2(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt(dist2(ax, ay, bx, by));
}

/**
 * Check if two snake heads are colliding head-on.
 * Returns true if the distance between the two heads is within the collision threshold.
 */
export function checkHeadOnCollision(snakeA: SpaceSnake, snakeB: SpaceSnake): boolean {
  if (snakeA.segments.length === 0 || snakeB.segments.length === 0) return false;
  const headA = snakeA.segments[0];
  const headB = snakeB.segments[0];
  const threshold = SNAKE_HEAD_RADIUS * 2;
  return dist(headA.x, headA.y, headB.x, headB.y) < threshold;
}

/**
 * Check if snakeA's head collides with any body segment of snakeB (excluding snakeB's head).
 */
export function checkHeadBodyCollision(snakeA: SpaceSnake, snakeB: SpaceSnake): boolean {
  if (snakeA.segments.length === 0 || snakeB.segments.length < 2) return false;
  const head = snakeA.segments[0];
  // Start from index 1 to skip the head (head-on is handled separately)
  for (let i = 3; i < snakeB.segments.length; i++) {
    const seg = snakeB.segments[i];
    if (dist(head.x, head.y, seg.x, seg.y) < HEAD_COLLISION_RADIUS) {
      return true;
    }
  }
  return false;
}

export function moveSnake(snake: SpaceSnake): SpaceSnake {
  const head = snake.segments[0];
  const speed = snake.boosting ? snake.speed * 1.6 : snake.speed;
  const newHead: SpaceSnakeSegment = {
    x: head.x + Math.cos(snake.angle) * speed,
    y: head.y + Math.sin(snake.angle) * speed,
  };
  const newSegments = [newHead, ...snake.segments.slice(0, -1)];
  return { ...snake, segments: newSegments };
}

export function growSnake(snake: SpaceSnake, amount: number = 5): SpaceSnake {
  const tail = snake.segments[snake.segments.length - 1];
  const extra: SpaceSnakeSegment[] = [];
  for (let i = 0; i < amount; i++) {
    extra.push({ ...tail });
  }
  return { ...snake, segments: [...snake.segments, ...extra] };
}

export function updateBotAI(
  bot: SpaceSnake,
  playerHead: SpaceSnakeSegment,
  coins: SpaceSnakeCoin[],
  points: SpaceSnakeColorPoint[],
  allSnakes: SpaceSnake[]
): SpaceSnake {
  let { targetAngle = bot.angle, wanderTimer = 0 } = bot;
  const head = bot.segments[0];

  // Wander back toward player if too far
  const distToPlayer = dist(head.x, head.y, playerHead.x, playerHead.y);
  if (distToPlayer > SPAWN_RADIUS * 1.5) {
    const angleToPlayer = Math.atan2(playerHead.y - head.y, playerHead.x - head.x);
    targetAngle = angleToPlayer;
    wanderTimer = 0;
  } else {
    wanderTimer -= 1;
    if (wanderTimer <= 0) {
      // Find nearest coin or point
      let bestDist = Infinity;
      let bestAngle = targetAngle;

      for (const coin of coins) {
        const d = dist(head.x, head.y, coin.x, coin.y);
        if (d < bestDist) {
          bestDist = d;
          bestAngle = Math.atan2(coin.y - head.y, coin.x - head.x);
        }
      }
      for (const pt of points) {
        const d = dist(head.x, head.y, pt.x, pt.y);
        if (d < bestDist * 0.8) {
          bestDist = d;
          bestAngle = Math.atan2(pt.y - head.y, pt.x - head.x);
        }
      }

      if (bestDist < SPAWN_RADIUS) {
        targetAngle = bestAngle;
      } else {
        targetAngle += (Math.random() - 0.5) * 0.8;
      }
      wanderTimer = 30 + Math.random() * 60;
    }
  }

  // Smooth turn
  let angleDiff = targetAngle - bot.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  const turnRate = 0.06;
  const newAngle = bot.angle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnRate);

  return { ...bot, angle: newAngle, targetAngle, wanderTimer };
}

export function checkCoinCollision(
  snake: SpaceSnake,
  coins: SpaceSnakeCoin[]
): { collected: SpaceSnakeCoin[]; remaining: SpaceSnakeCoin[] } {
  if (snake.segments.length === 0) return { collected: [], remaining: coins };
  const head = snake.segments[0];
  const collected: SpaceSnakeCoin[] = [];
  const remaining: SpaceSnakeCoin[] = [];
  for (const coin of coins) {
    if (dist(head.x, head.y, coin.x, coin.y) < COIN_RADIUS) {
      collected.push(coin);
    } else {
      remaining.push(coin);
    }
  }
  return { collected, remaining };
}

export function checkPointCollision(
  snake: SpaceSnake,
  points: SpaceSnakeColorPoint[]
): { collected: SpaceSnakeColorPoint[]; remaining: SpaceSnakeColorPoint[] } {
  if (snake.segments.length === 0) return { collected: [], remaining: points };
  const head = snake.segments[0];
  const collected: SpaceSnakeColorPoint[] = [];
  const remaining: SpaceSnakeColorPoint[] = [];
  for (const pt of points) {
    if (dist(head.x, head.y, pt.x, pt.y) < POINT_RADIUS) {
      collected.push(pt);
    } else {
      remaining.push(pt);
    }
  }
  return { collected, remaining };
}
