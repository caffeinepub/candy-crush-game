# Specification

## Summary
**Goal:** Fix Snake Arena gameplay glitches (snake movement/physics and pickups) and tune the default snake speed to a consistent medium across devices.

**Planned changes:**
- Correct snake segment follow logic to ensure smooth, consistent spacing during straight movement, turning, and world-edge wrap-around (eliminate jitter/teleporting/kinks).
- Adjust the Snake Arena update loop speed handling (constants and/or delta-time scaling) so the default player speed is a stable “medium” and consistent across different frame rates while using the joystick.
- Fix pickup generation/collection state issues by ensuring pickup IDs are unique and stable to prevent flicker, duplication, and incorrect reappearing; ensure collection applies exactly once per pickup.

**User-visible outcome:** Snake movement looks smooth and continuous (including turns and edge wrap), default speed feels medium and consistent across devices, and pickups spawn/collect reliably without flickering or duplicating.
