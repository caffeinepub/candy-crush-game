// Animation timing constants (in milliseconds)

export const ANIMATION_TIMINGS = {
  SWAP: 300,
  SWAP_BACK: 300,
  CLEAR: 400,
  FALL: 300,
  SPECIAL_EFFECT: 500,
  CASCADE_DELAY: 200,
} as const;

export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
