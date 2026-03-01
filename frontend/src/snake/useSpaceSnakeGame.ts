import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SpaceSnake,
  SpaceSnakeCoin,
  SpaceSnakeColorPoint,
  createPlayerSnake,
  createBotSnake,
  moveSnake,
  growSnake,
  updateBotAI,
  checkCoinCollision,
  checkPointCollision,
  checkHeadOnCollision,
  checkHeadBodyCollision,
  generateKillDrops,
  spawnCoin,
  spawnColorPoint,
  SPAWN_RADIUS,
} from './spaceSnakeLogic';

const BOT_COUNT = 12;
const COIN_TARGET = 60;
const POINT_TARGET = 50;
const LEADERBOARD_SIZE = 10;

export type GamePhase = 'menu' | 'playing' | 'gameover';

export interface SpaceSnakeGameState {
  phase: GamePhase;
  player: SpaceSnake | null;
  bots: SpaceSnake[];
  coins: SpaceSnakeCoin[];
  points: SpaceSnakeColorPoint[];
  score: number;
  coins_collected: number;
  leaderboard: { name: string; score: number; isPlayer: boolean }[];
  deathReason: string;
}

interface UseSpaceSnakeGameOptions {
  isLandscape: boolean;
  tiltEnabled: boolean;
  tiltAngle: number;
}

export function useSpaceSnakeGame(
  nickname: string,
  joystickAngle: React.MutableRefObject<number | null>,
  options: UseSpaceSnakeGameOptions
) {
  const { isLandscape, tiltEnabled, tiltAngle } = options;

  const [gameState, setGameState] = useState<SpaceSnakeGameState>({
    phase: 'menu',
    player: null,
    bots: [],
    coins: [],
    points: [],
    score: 0,
    coins_collected: 0,
    leaderboard: [],
    deathReason: '',
  });

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const mouseAngleRef = useRef<number>(0);

  const buildLeaderboard = useCallback(
    (player: SpaceSnake, bots: SpaceSnake[]) => {
      const entries = [
        { name: player.name, score: player.score, isPlayer: true },
        ...bots.map((b) => ({ name: b.name, score: b.score, isPlayer: false })),
      ];
      entries.sort((a, b) => b.score - a.score);
      return entries.slice(0, LEADERBOARD_SIZE);
    },
    []
  );

  const startGame = useCallback(() => {
    const player = createPlayerSnake(0, 0, nickname || 'Player');
    const bots: SpaceSnake[] = [];
    for (let i = 0; i < BOT_COUNT; i++) {
      bots.push(createBotSnake(i, 0, 0));
    }
    const coins: SpaceSnakeCoin[] = [];
    const points: SpaceSnakeColorPoint[] = [];
    for (let i = 0; i < COIN_TARGET; i++) coins.push(spawnCoin(0, 0));
    for (let i = 0; i < POINT_TARGET; i++) points.push(spawnColorPoint(0, 0));

    setGameState({
      phase: 'playing',
      player,
      bots,
      coins,
      points,
      score: 0,
      coins_collected: 0,
      leaderboard: buildLeaderboard(player, bots),
      deathReason: '',
    });
  }, [nickname, buildLeaderboard]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    mouseAngleRef.current = Math.atan2(e.clientY - cy, e.clientX - cx);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!isLandscape) {
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const dt = Math.min(timestamp - lastTimeRef.current, 50);
      lastTimeRef.current = timestamp;

      const state = stateRef.current;
      if (state.phase !== 'playing' || !state.player) {
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      let player = state.player;
      let bots = [...state.bots];
      let coins = [...state.coins];
      let points = [...state.points];

      // Determine player steering angle
      let steerAngle: number;
      if (tiltEnabled) {
        steerAngle = (tiltAngle * Math.PI) / 180;
      } else if (joystickAngle.current !== null) {
        steerAngle = joystickAngle.current;
      } else {
        steerAngle = mouseAngleRef.current;
      }

      // Smooth player turn
      let angleDiff = steerAngle - player.angle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      const playerTurnRate = 0.08;
      const newPlayerAngle =
        player.angle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), playerTurnRate);
      player = { ...player, angle: newPlayerAngle };

      // Move player
      player = moveSnake(player);

      // Player coin collection
      const playerCoinResult = checkCoinCollision(player, coins);
      const coinsCollectedThisFrame = playerCoinResult.collected.length;
      if (coinsCollectedThisFrame > 0) {
        const totalValue = playerCoinResult.collected.reduce((s, c) => s + c.value, 0);
        player = growSnake(player, totalValue * 2);
        player = { ...player, score: player.score + totalValue };
        coins = playerCoinResult.remaining;
      }

      // Player point collection
      const playerPointResult = checkPointCollision(player, points);
      if (playerPointResult.collected.length > 0) {
        const totalValue = playerPointResult.collected.reduce((s, p) => s + p.value, 0);
        player = growSnake(player, totalValue);
        player = { ...player, score: player.score + totalValue };
        points = playerPointResult.remaining;
      }

      // Replenish coins and points near player
      while (coins.length < COIN_TARGET) {
        coins.push(spawnCoin(player.segments[0].x, player.segments[0].y));
      }
      while (points.length < POINT_TARGET) {
        points.push(spawnColorPoint(player.segments[0].x, player.segments[0].y));
      }

      // Update bots
      const playerHead = player.segments[0];
      const survivingBots: SpaceSnake[] = [];
      const deadBots: SpaceSnake[] = [];

      for (let i = 0; i < bots.length; i++) {
        let bot = bots[i];
        bot = updateBotAI(bot, playerHead, coins, points, bots);
        bot = moveSnake(bot);

        // Bot coin collection
        const botCoinResult = checkCoinCollision(bot, coins);
        if (botCoinResult.collected.length > 0) {
          const val = botCoinResult.collected.reduce((s, c) => s + c.value, 0);
          bot = growSnake(bot, val * 2);
          bot = { ...bot, score: bot.score + val };
          coins = botCoinResult.remaining;
        }

        // Bot point collection
        const botPointResult = checkPointCollision(bot, points);
        if (botPointResult.collected.length > 0) {
          const val = botPointResult.collected.reduce((s, p) => s + p.value, 0);
          bot = growSnake(bot, val);
          bot = { ...bot, score: bot.score + val };
          points = botPointResult.remaining;
        }

        bots[i] = bot;
      }

      // ── Collision detection ──────────────────────────────────────────────

      // 1. Check player head vs each bot
      let playerDied = false;
      let deathReason = '';

      for (let i = 0; i < bots.length; i++) {
        const bot = bots[i];

        // Head-on collision: player head touches bot head → BOTH die
        if (checkHeadOnCollision(player, bot)) {
          playerDied = true;
          deathReason = `Head-on collision with ${bot.name}!`;
          deadBots.push(bot);
          bots[i] = { ...bot, segments: [] }; // mark dead
          break;
        }

        // Player head hits bot body → player dies
        if (checkHeadBodyCollision(player, bot)) {
          playerDied = true;
          deathReason = `Crashed into ${bot.name}!`;
          break;
        }
      }

      // 2. Check bot heads vs player body (bot hits player body → bot dies)
      if (!playerDied) {
        for (let i = 0; i < bots.length; i++) {
          const bot = bots[i];
          if (bot.segments.length === 0) continue;
          if (checkHeadBodyCollision(bot, player)) {
            deadBots.push(bot);
            bots[i] = { ...bot, segments: [] };
            // Player grows and scores for killing a bot
            const killScore = Math.floor(bot.segments.length / 5);
            player = growSnake(player, killScore);
            player = { ...player, score: player.score + killScore };
          }
        }
      }

      // 3. Check bot vs bot head-on collisions
      for (let i = 0; i < bots.length; i++) {
        if (bots[i].segments.length === 0) continue;
        for (let j = i + 1; j < bots.length; j++) {
          if (bots[j].segments.length === 0) continue;
          if (checkHeadOnCollision(bots[i], bots[j])) {
            deadBots.push(bots[i]);
            deadBots.push(bots[j]);
            bots[i] = { ...bots[i], segments: [] };
            bots[j] = { ...bots[j], segments: [] };
          }
        }
      }

      // 4. Check bot vs bot body collisions
      for (let i = 0; i < bots.length; i++) {
        if (bots[i].segments.length === 0) continue;
        for (let j = 0; j < bots.length; j++) {
          if (i === j || bots[j].segments.length === 0) continue;
          if (checkHeadBodyCollision(bots[i], bots[j])) {
            deadBots.push(bots[i]);
            bots[i] = { ...bots[i], segments: [] };
            break;
          }
        }
      }

      // ── Process dead bots: generate kill drops ───────────────────────────
      for (const deadBot of deadBots) {
        if (deadBot.segments.length === 0) continue;
        const drops = generateKillDrops(deadBot);
        coins = [...coins, ...drops.coins];
        points = [...points, ...drops.points];
      }

      // Remove dead bots and respawn
      const activeBots = bots.filter((b) => b.segments.length > 0);
      while (activeBots.length < BOT_COUNT) {
        const idx = activeBots.length;
        activeBots.push(createBotSnake(idx, playerHead.x, playerHead.y));
      }

      // ── Player death ─────────────────────────────────────────────────────
      if (playerDied) {
        // Drop player's items too
        const playerDrops = generateKillDrops(player);
        coins = [...coins, ...playerDrops.coins];
        points = [...points, ...playerDrops.points];

        setGameState((prev) => ({
          ...prev,
          phase: 'gameover',
          player,
          bots: activeBots,
          coins,
          points,
          score: player.score,
          deathReason,
          leaderboard: buildLeaderboard(player, activeBots),
        }));
        return;
      }

      // Increment coins_collected only by the number of coins the player
      // actually picked up this frame (never goes negative, no double-counting)
      const newCoinsCollected = state.coins_collected + coinsCollectedThisFrame;

      setGameState((prev) => ({
        ...prev,
        player,
        bots: activeBots,
        coins,
        points,
        score: player.score,
        coins_collected: newCoinsCollected,
        leaderboard: buildLeaderboard(player, activeBots),
      }));

      animFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [isLandscape, tiltEnabled, tiltAngle, joystickAngle, buildLeaderboard]
  );

  useEffect(() => {
    if (gameState.phase === 'playing') {
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [gameState.phase, gameLoop]);

  const goToMenu = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setGameState({
      phase: 'menu',
      player: null,
      bots: [],
      coins: [],
      points: [],
      score: 0,
      coins_collected: 0,
      leaderboard: [],
      deathReason: '',
    });
  }, []);

  return { gameState, startGame, goToMenu };
}
