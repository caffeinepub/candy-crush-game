import { audioManager } from './audioManager';

export function playSwapSound() {
  audioManager.play('swap', 0.5);
}

export function playMatchSound() {
  audioManager.play('match', 0.6);
}

export function playSpecialSound() {
  audioManager.play('special', 0.7);
}

export function playLevelCompleteSound() {
  audioManager.play('levelComplete', 0.8);
}

export function playGameOverSound() {
  audioManager.play('gameOver', 0.6);
}
