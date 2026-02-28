/**
 * Joystick steering filter utilities for stable angle output.
 * Implements deadzone, angular hysteresis, and smoothing to prevent
 * unintended rotation during circular thumb motion.
 */

export interface SteeringFilterConfig {
  deadzone: number; // Minimum distance from center to register input (0-1)
  minAngleChange: number; // Minimum angle change in radians to update direction
  smoothingFactor: number; // 0-1, higher = more smoothing (0 = no smoothing)
}

export const DEFAULT_STEERING_CONFIG: SteeringFilterConfig = {
  deadzone: 0.15, // 15% of max distance
  minAngleChange: Math.PI / 16, // ~11.25 degrees
  smoothingFactor: 0.3,
};

/**
 * Normalizes an angle to the range [-PI, PI]
 */
function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

/**
 * Calculates the shortest angular distance between two angles
 */
function angleDifference(from: number, to: number): number {
  const diff = normalizeAngle(to - from);
  return diff;
}

/**
 * Smoothly interpolates between two angles using the shortest path
 */
function lerpAngle(from: number, to: number, t: number): number {
  const diff = angleDifference(from, to);
  return normalizeAngle(from + diff * t);
}

export class SteeringFilter {
  private config: SteeringFilterConfig;
  private lastEmittedAngle: number | null = null;
  private smoothedAngle: number | null = null;

  constructor(config: Partial<SteeringFilterConfig> = {}) {
    this.config = { ...DEFAULT_STEERING_CONFIG, ...config };
  }

  /**
   * Process raw joystick input and return a stable angle or null
   * @param dx - X offset from center (-1 to 1 normalized)
   * @param dy - Y offset from center (-1 to 1 normalized)
   * @returns Filtered angle in radians or null if within deadzone
   */
  process(dx: number, dy: number): number | null {
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Apply deadzone
    if (distance < this.config.deadzone) {
      this.lastEmittedAngle = null;
      this.smoothedAngle = null;
      return null;
    }

    // Calculate raw angle
    const rawAngle = Math.atan2(dy, dx);

    // If this is the first input or we were in deadzone, emit immediately
    if (this.lastEmittedAngle === null) {
      this.lastEmittedAngle = rawAngle;
      this.smoothedAngle = rawAngle;
      return rawAngle;
    }

    // Apply smoothing
    const targetAngle = this.config.smoothingFactor > 0
      ? lerpAngle(this.smoothedAngle!, rawAngle, 1 - this.config.smoothingFactor)
      : rawAngle;

    this.smoothedAngle = targetAngle;

    // Apply angular hysteresis - only emit if angle changed significantly
    const angleDiff = Math.abs(angleDifference(this.lastEmittedAngle, targetAngle));
    
    if (angleDiff >= this.config.minAngleChange) {
      this.lastEmittedAngle = targetAngle;
      return targetAngle;
    }

    // Return last emitted angle (no change)
    return this.lastEmittedAngle;
  }

  /**
   * Reset the filter state
   */
  reset(): void {
    this.lastEmittedAngle = null;
    this.smoothedAngle = null;
  }
}
