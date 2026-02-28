import { type Position } from './types';

export interface SwipeResult {
  direction: 'up' | 'down' | 'left' | 'right';
  startPos: Position;
}

const SWIPE_THRESHOLD = 30; // Minimum distance for a swipe

export function detectSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): 'up' | 'down' | 'left' | 'right' | null {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);
  
  // Check if swipe is long enough
  if (absDeltaX < SWIPE_THRESHOLD && absDeltaY < SWIPE_THRESHOLD) {
    return null;
  }
  
  // Determine primary direction
  if (absDeltaX > absDeltaY) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
}
