import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, RotateCcw, Home, Skull } from 'lucide-react';

interface SpaceSnakeGameOverOverlayProps {
  score: number;
  deathReason?: string;
  onPlayAgain: () => void;
  onGoToMenu: () => void;
}

export default function SpaceSnakeGameOverOverlay({
  score,
  deathReason,
  onPlayAgain,
  onGoToMenu,
}: SpaceSnakeGameOverOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-black/80 p-8 shadow-2xl"
        style={{ minWidth: 280 }}
      >
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-900/40 border border-red-500/40">
          <Skull className="h-8 w-8 text-red-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold tracking-widest text-white uppercase">
          Game Over
        </h2>

        {/* Death reason */}
        {deathReason && (
          <p className="text-sm text-red-300 text-center max-w-xs">{deathReason}</p>
        )}

        {/* Score */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-yellow-400">
            <Trophy className="h-5 w-5" />
            <span className="text-3xl font-bold tabular-nums">{score}</span>
          </div>
          <span className="text-xs text-white/50 uppercase tracking-widest">Final Score</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <Button
            onClick={onPlayAgain}
            className="w-full gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 text-base"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
          <Button
            onClick={onGoToMenu}
            variant="outline"
            className="w-full gap-2 border-white/20 text-white hover:bg-white/10 py-3 text-base"
          >
            <Home className="h-4 w-4" />
            Go to Menu
          </Button>
        </div>
      </div>
    </div>
  );
}
