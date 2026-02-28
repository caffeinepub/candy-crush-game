// Core game logic for Space Snake

export const WORLD_SIZE = 3000;
export const SEGMENT_RADIUS = 12;
export const HEAD_RADIUS = 16;
export const COIN_RADIUS = 14;
export const COIN_COUNT = 20;
export const BOT_COUNT = 8;
export const PLAYER_SPEED = 2.8;
export const BOT_SPEED = 2.2;

export interface Vec2 {
  x: number;
  y: number;
}

export interface SnakeSegment {
  x: number;
  y: number;
}

export interface SnakeEntity {
  id: string;
  name: string;
  color: string;
  headColor: string;
  segments: SnakeSegment[];
  angle: number; // radians
  speed: number;
  score: number;
  alive: boolean;
  respawnTimer: number;
  isPlayer: boolean;
}

export interface CoinEntity {
  id: string;
  x: number;
  y: number;
}

export interface MissionState {
  current: number;
  target: number;
  timeRemaining: number;
  completed: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  isPlayer: boolean;
}

export interface GameState {
  player: SnakeEntity;
  bots: SnakeEntity[];
  coins: CoinEntity[];
  mission: MissionState;
  leaderboard: LeaderboardEntry[];
  cameraX: number;
  cameraY: number;
  gameOver: boolean;
  playerRank: number;
}

const BOT_COLORS = [
  { body: '#e53e3e', head: '#fc8181' },
  { body: '#dd6b20', head: '#f6ad55' },
  { body: '#d69e2e', head: '#faf089' },
  { body: '#805ad5', head: '#d6bcfa' },
  { body: '#e91e8c', head: '#f48fb1' },
  { body: '#ffffff', head: '#e2e8f0' },
  { body: '#38a169', head: '#9ae6b4' },
  { body: '#3182ce', head: '#90cdf4' },
];

let coinIdCounter = 0;

export function createCoin(): CoinEntity {
  return {
    id: `coin_${coinIdCounter++}`,
    x: Math.random() * (WORLD_SIZE - 200) + 100,
    y: Math.random() * (WORLD_SIZE - 200) + 100,
  };
}

export function createPlayerSnake(name: string): SnakeEntity {
  const startX = WORLD_SIZE / 2;
  const startY = WORLD_SIZE / 2;
  const segments: SnakeSegment[] = [];
  for (let i = 0; i < 20; i++) {
    segments.push({ x: startX, y: startY + i * (SEGMENT_RADIUS * 1.8) });
  }
  return {
    id: 'player',
    name,
    color: '#4dd0c4',
    headColor: '#a0f0e8',
    segments,
    angle: -Math.PI / 2,
    speed: PLAYER_SPEED,
    score: 0,
    alive: true,
    respawnTimer: 0,
    isPlayer: true,
  };
}

export function createBotSnake(index: number): SnakeEntity {
  const colors = BOT_COLORS[index % BOT_COLORS.length];
  const startX = Math.random() * (WORLD_SIZE - 400) + 200;
  const startY = Math.random() * (WORLD_SIZE - 400) + 200;
  const angle = Math.random() * Math.PI * 2;
  const segments: SnakeSegment[] = [];
  for (let i = 0; i < 15; i++) {
    segments.push({
      x: startX + Math.cos(angle + Math.PI) * i * (SEGMENT_RADIUS * 1.8),
      y: startY + Math.sin(angle + Math.PI) * i * (SEGMENT_RADIUS * 1.8),
    });
  }
  return {
    id: `bot_${index}`,
    name: `Bot ${index + 1}`,
    color: colors.body,
    headColor: colors.head,
    segments,
    angle,
    speed: BOT_SPEED + Math.random() * 0.5,
    score: Math.floor(Math.random() * 30),
    alive: true,
    respawnTimer: 0,
    isPlayer: false,
  };
}

export function initGameState(playerName: string): GameState {
  coinIdCounter = 0;
  const player = createPlayerSnake(playerName);
  const bots: SnakeEntity[] = [];
  for (let i = 0; i < BOT_COUNT; i++) {
    bots.push(createBotSnake(i));
  }
  const coins: CoinEntity[] = [];
  for (let i = 0; i < COIN_COUNT; i++) {
    coins.push(createCoin());
  }
  const mission: MissionState = {
    current: 0,
    target: 5,
    timeRemaining: 30,
    completed: false,
  };
  return {
    player,
    bots,
    coins,
    mission,
    leaderboard: [],
    cameraX: player.segments[0].x,
    cameraY: player.segments[0].y,
    gameOver: false,
    playerRank: 1,
  };
}

function moveSnake(snake: SnakeEntity): void {
  if (!snake.alive) return;
  const head = snake.segments[0];
  const newHead: SnakeSegment = {
    x: head.x + Math.cos(snake.angle) * snake.speed,
    y: head.y + Math.sin(snake.angle) * snake.speed,
  };
  // Clamp to world bounds
  newHead.x = Math.max(HEAD_RADIUS, Math.min(WORLD_SIZE - HEAD_RADIUS, newHead.x));
  newHead.y = Math.max(HEAD_RADIUS, Math.min(WORLD_SIZE - HEAD_RADIUS, newHead.y));

  snake.segments.unshift(newHead);
  snake.segments.pop();
}

function growSnake(snake: SnakeEntity): void {
  const tail = snake.segments[snake.segments.length - 1];
  snake.segments.push({ ...tail });
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

function updateBotAI(bot: SnakeEntity, coins: CoinEntity[], allSnakes: SnakeEntity[]): void {
  if (!bot.alive) return;
  const head = bot.segments[0];

  // Find nearest coin
  let nearestCoin: CoinEntity | null = null;
  let nearestDist = Infinity;
  for (const coin of coins) {
    const d = dist(head.x, head.y, coin.x, coin.y);
    if (d < nearestDist) {
      nearestDist = d;
      nearestCoin = coin;
    }
  }

  // Avoid walls
  const margin = 150;
  let targetAngle = bot.angle;

  if (head.x < margin) targetAngle = 0;
  else if (head.x > WORLD_SIZE - margin) targetAngle = Math.PI;
  else if (head.y < margin) targetAngle = Math.PI / 2;
  else if (head.y > WORLD_SIZE - margin) targetAngle = -Math.PI / 2;
  else if (nearestCoin) {
    targetAngle = Math.atan2(nearestCoin.y - head.y, nearestCoin.x - head.x);
    // Add some randomness
    if (Math.random() < 0.02) {
      targetAngle += (Math.random() - 0.5) * 1.5;
    }
  } else {
    if (Math.random() < 0.02) {
      targetAngle += (Math.random() - 0.5) * 1.0;
    }
  }

  // Smooth angle change
  let angleDiff = targetAngle - bot.angle;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  const maxTurn = 0.06;
  bot.angle += Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
}

function checkCoinCollision(snake: SnakeEntity, coins: CoinEntity[]): number {
  if (!snake.alive) return -1;
  const head = snake.segments[0];
  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i];
    if (dist(head.x, head.y, coin.x, coin.y) < HEAD_RADIUS + COIN_RADIUS) {
      return i;
    }
  }
  return -1;
}

function checkSnakeCollision(snake: SnakeEntity, allSnakes: SnakeEntity[]): boolean {
  if (!snake.alive) return false;
  const head = snake.segments[0];
  for (const other of allSnakes) {
    if (!other.alive) continue;
    const startIdx = other.id === snake.id ? 10 : 0;
    for (let i = startIdx; i < other.segments.length; i++) {
      const seg = other.segments[i];
      if (dist(head.x, head.y, seg.x, seg.y) < HEAD_RADIUS + SEGMENT_RADIUS * 0.8) {
        return true;
      }
    }
  }
  return false;
}

export function computeLeaderboard(player: SnakeEntity, bots: SnakeEntity[]): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [
    { name: player.name, score: player.score, isPlayer: true },
    ...bots.map(b => ({ name: b.name, score: b.score, isPlayer: false })),
  ];
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, 5);
}

export function updateGame(
  state: GameState,
  steeringAngle: number | null,
  deltaMs: number
): GameState {
  if (state.gameOver) return state;

  const { player, bots, coins, mission } = state;

  // Update player angle from steering
  if (steeringAngle !== null && player.alive) {
    let angleDiff = steeringAngle - player.angle;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    const maxTurn = 0.08;
    player.angle += Math.max(-maxTurn, Math.min(maxTurn, angleDiff));
  }

  // Move player
  moveSnake(player);

  // Update bots
  const allSnakes = [player, ...bots];
  for (const bot of bots) {
    if (!bot.alive) {
      bot.respawnTimer -= deltaMs;
      if (bot.respawnTimer <= 0) {
        // Respawn
        const newBot = createBotSnake(parseInt(bot.id.replace('bot_', '')));
        bot.segments = newBot.segments;
        bot.angle = newBot.angle;
        bot.alive = true;
        bot.respawnTimer = 0;
      }
      continue;
    }
    updateBotAI(bot, coins, allSnakes);
    moveSnake(bot);
  }

  // Check coin collisions for player
  let missionCurrent = mission.current;
  const coinIdx = checkCoinCollision(player, coins);
  if (coinIdx >= 0) {
    coins[coinIdx] = createCoin();
    growSnake(player);
    player.score += 1;
    missionCurrent += 1;
  }

  // Check coin collisions for bots
  for (const bot of bots) {
    const bCoinIdx = checkCoinCollision(bot, coins);
    if (bCoinIdx >= 0) {
      coins[bCoinIdx] = createCoin();
      growSnake(bot);
      bot.score += 1;
    }
  }

  // Check snake collisions for bots
  for (const bot of bots) {
    if (!bot.alive) continue;
    const otherSnakes = allSnakes.filter(s => s.id !== bot.id);
    if (checkSnakeCollision(bot, otherSnakes)) {
      bot.alive = false;
      bot.respawnTimer = 3000;
    }
  }

  // Check player collision — explicitly typed as boolean to avoid literal type narrowing
  let gameOver: boolean = state.gameOver;
  if (player.alive) {
    const otherSnakes = bots.filter(b => b.alive);
    if (checkSnakeCollision(player, otherSnakes)) {
      player.alive = false;
      gameOver = true;
    }
  }

  // Update mission
  let missionTarget = mission.target;
  let missionTimeRemaining = mission.timeRemaining;

  // Check mission completion
  if (missionCurrent >= missionTarget) {
    missionCurrent = 0;
    missionTarget = Math.floor(Math.random() * 6) + 5; // 5-10
    missionTimeRemaining = 30;
  }

  // Update camera
  const cameraX = player.alive ? player.segments[0].x : state.cameraX;
  const cameraY = player.alive ? player.segments[0].y : state.cameraY;

  // Compute leaderboard
  const leaderboard = computeLeaderboard(player, bots);
  const playerRank = leaderboard.findIndex(e => e.isPlayer) + 1;

  return {
    ...state,
    player,
    bots,
    coins,
    mission: {
      current: missionCurrent,
      target: missionTarget,
      timeRemaining: missionTimeRemaining,
      completed: mission.completed,
    },
    leaderboard,
    cameraX,
    cameraY,
    gameOver,
    playerRank: playerRank || leaderboard.length + 1,
  };
}
