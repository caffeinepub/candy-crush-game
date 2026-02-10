import { useState, useCallback, useRef, useEffect } from 'react';
import { type GameState, type Position, type Candy, BOARD_SIZE } from './types';
import { generateInitialBoard, refillBoard } from './boardGeneration';
import { areAdjacent } from './interaction';
import { wouldCreateMatch, findMatches } from './matchDetection';
import { resolveMatches, checkSpecialActivations } from './resolutionPipeline';
import { applyGravity } from './gravity';
import { getLevelConfig, checkLevelComplete } from './progression';
import { hasLegalMoves } from './legalMoves';
import { reshuffleBoard } from './boardReshuffle';
import { detectSpecialCombo, getSpecialTargets } from './specialActivations';
import { ANIMATION_TIMINGS, wait } from './animations';
import { playSwapSound, playMatchSound, playSpecialSound, playLevelCompleteSound, playGameOverSound } from './audio/sfx';
import { calculateScore } from './scoring';

export function useMatch3Game() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const levelConfig = getLevelConfig(1);
    return {
      board: generateInitialBoard(),
      score: 0,
      moves: levelConfig.moves,
      level: 1,
      targetScore: levelConfig.targetScore,
      gameOver: false,
      levelComplete: false,
      animating: false,
      animationState: {},
      selectedCell: null,
      highlightedCell: null,
    };
  });

  const gameOverSoundPlayedRef = useRef(false);
  const levelCompleteSoundPlayedRef = useRef(false);

  // Check for game over or level complete
  useEffect(() => {
    if (gameState.gameOver && !gameOverSoundPlayedRef.current) {
      playGameOverSound();
      gameOverSoundPlayedRef.current = true;
    }
    
    if (gameState.levelComplete && !levelCompleteSoundPlayedRef.current) {
      playLevelCompleteSound();
      levelCompleteSoundPlayedRef.current = true;
    }
  }, [gameState.gameOver, gameState.levelComplete]);

  // New game
  const startNewGame = useCallback(() => {
    const levelConfig = getLevelConfig(1);
    setGameState({
      board: generateInitialBoard(),
      score: 0,
      moves: levelConfig.moves,
      level: 1,
      targetScore: levelConfig.targetScore,
      gameOver: false,
      levelComplete: false,
      animating: false,
      animationState: {},
      selectedCell: null,
      highlightedCell: null,
    });
    gameOverSoundPlayedRef.current = false;
    levelCompleteSoundPlayedRef.current = false;
  }, []);

  // Next level
  const nextLevel = useCallback(() => {
    const newLevel = gameState.level + 1;
    const levelConfig = getLevelConfig(newLevel);
    setGameState({
      board: generateInitialBoard(),
      score: 0,
      moves: levelConfig.moves,
      level: newLevel,
      targetScore: levelConfig.targetScore,
      gameOver: false,
      levelComplete: false,
      animating: false,
      animationState: {},
      selectedCell: null,
      highlightedCell: null,
    });
    levelCompleteSoundPlayedRef.current = false;
  }, [gameState.level]);

  // Cascade resolution
  const resolveCascade = useCallback(async (board: (Candy | null)[][], currentScore: number): Promise<{ board: (Candy | null)[][]; score: number }> => {
    let workingBoard = board;
    let totalScore = currentScore;
    let cascadeCount = 0;

    while (true) {
      // Check for matches
      const resolution = resolveMatches(workingBoard);
      
      if (!resolution.hadMatches) {
        break;
      }

      cascadeCount++;
      
      // Animate clearing
      setGameState(prev => ({
        ...prev,
        animationState: { clearing: resolution.clearedPositions },
      }));
      
      await wait(ANIMATION_TIMINGS.CLEAR);
      playMatchSound();

      // Check for special activations
      const specialResult = checkSpecialActivations(resolution.board, resolution.clearedPositions);
      totalScore += resolution.scoreGained + specialResult.scoreGained;

      if (specialResult.additionalClears.length > 0) {
        playSpecialSound();
        await wait(ANIMATION_TIMINGS.SPECIAL_EFFECT);
      }

      workingBoard = specialResult.board;

      // Apply gravity
      const { newBoard, falls } = applyGravity(workingBoard);
      
      if (falls.length > 0) {
        setGameState(prev => ({
          ...prev,
          animationState: { falling: falls },
        }));
        
        await wait(ANIMATION_TIMINGS.FALL);
      }

      workingBoard = newBoard;

      // Refill
      workingBoard = refillBoard(workingBoard);
      
      await wait(ANIMATION_TIMINGS.CASCADE_DELAY);
    }

    return { board: workingBoard, score: totalScore };
  }, []);

  // Attempt swap
  const attemptSwap = useCallback(async (pos1: Position, pos2: Position) => {
    if (gameState.animating || gameState.gameOver || gameState.levelComplete) return;
    if (!areAdjacent(pos1, pos2)) return;

    setGameState(prev => ({ ...prev, animating: true }));

    // Check for special combo
    const combo = detectSpecialCombo(gameState.board, pos1, pos2);
    
    if (combo) {
      // Special combo activation
      setGameState(prev => ({
        ...prev,
        animationState: { specialEffect: { type: combo.type, position: pos1, targets: combo.targets } },
      }));
      
      await wait(ANIMATION_TIMINGS.SPECIAL_EFFECT);
      playSpecialSound();

      // Clear targets
      const newBoard = gameState.board.map(row => [...row]);
      combo.targets.forEach(pos => {
        newBoard[pos.row][pos.col] = null;
      });

      const scoreGained = calculateScore(combo.targets.length, true);
      const newScore = gameState.score + scoreGained;

      // Continue with cascade
      const { board: finalBoard, score: finalScore } = await resolveCascade(newBoard, newScore);

      const newMoves = gameState.moves - 1;
      const isLevelComplete = checkLevelComplete(finalScore, gameState.targetScore);
      const isGameOver = newMoves <= 0 && !isLevelComplete;

      setGameState(prev => ({
        ...prev,
        board: finalBoard,
        score: finalScore,
        moves: newMoves,
        animating: false,
        animationState: {},
        selectedCell: null,
        levelComplete: isLevelComplete,
        gameOver: isGameOver,
      }));

      return;
    }

    // Regular swap
    const tempBoard = gameState.board.map(row => [...row]);
    const temp = tempBoard[pos1.row][pos1.col];
    tempBoard[pos1.row][pos1.col] = tempBoard[pos2.row][pos2.col];
    tempBoard[pos2.row][pos2.col] = temp;

    // Animate swap
    setGameState(prev => ({
      ...prev,
      animationState: { swapping: { from: pos1, to: pos2 } },
    }));
    
    await wait(ANIMATION_TIMINGS.SWAP);

    // Check if swap creates match
    const createsMatch = wouldCreateMatch(gameState.board, pos1, pos2);

    if (!createsMatch) {
      // Swap back
      setGameState(prev => ({
        ...prev,
        board: tempBoard,
        animationState: { swappingBack: { from: pos2, to: pos1 } },
      }));
      
      await wait(ANIMATION_TIMINGS.SWAP_BACK);
      
      setGameState(prev => ({
        ...prev,
        board: gameState.board,
        animating: false,
        animationState: {},
        selectedCell: null,
      }));
      
      return;
    }

    // Valid swap - play sound and resolve
    playSwapSound();
    
    const { board: finalBoard, score: finalScore } = await resolveCascade(tempBoard, gameState.score);

    const newMoves = gameState.moves - 1;
    const isLevelComplete = checkLevelComplete(finalScore, gameState.targetScore);
    const isGameOver = newMoves <= 0 && !isLevelComplete;

    // Check for no legal moves
    let boardToUse = finalBoard;
    if (!isGameOver && !isLevelComplete && !hasLegalMoves(finalBoard)) {
      boardToUse = reshuffleBoard(finalBoard);
    }

    setGameState(prev => ({
      ...prev,
      board: boardToUse,
      score: finalScore,
      moves: newMoves,
      animating: false,
      animationState: {},
      selectedCell: null,
      levelComplete: isLevelComplete,
      gameOver: isGameOver,
    }));
  }, [gameState, resolveCascade]);

  // Select cell
  const selectCell = useCallback((pos: Position) => {
    if (gameState.animating || gameState.gameOver || gameState.levelComplete) return;

    if (!gameState.selectedCell) {
      setGameState(prev => ({ ...prev, selectedCell: pos }));
    } else {
      if (gameState.selectedCell.row === pos.row && gameState.selectedCell.col === pos.col) {
        setGameState(prev => ({ ...prev, selectedCell: null }));
      } else if (areAdjacent(gameState.selectedCell, pos)) {
        attemptSwap(gameState.selectedCell, pos);
      } else {
        setGameState(prev => ({ ...prev, selectedCell: pos }));
      }
    }
  }, [gameState, attemptSwap]);

  // Highlight cell
  const highlightCell = useCallback((pos: Position | null) => {
    setGameState(prev => ({ ...prev, highlightedCell: pos }));
  }, []);

  return {
    gameState,
    startNewGame,
    nextLevel,
    attemptSwap,
    selectCell,
    highlightCell,
  };
}
