# Specification

## Summary
**Goal:** Add landscape orientation enforcement and gyroscope/tilt steering controls to the Space Snake mobile gameplay experience.

**Planned changes:**
- When a mobile device is in portrait mode during gameplay, show the existing `RotateToLandscapeOverlay`, hide all game UI, and pause the game loop; resume automatically when rotated to landscape using the existing `useLandscapeOrientation` hook.
- Implement gyroscope/tilt steering using the DeviceOrientation API (gamma axis) with a ±5° deadzone to steer the snake left/right in landscape mode, feeding into the same steering pipeline as the virtual joystick.
- Handle iOS 13+ DeviceOrientation permission prompts on first interaction or game start; silently skip tilt on unsupported devices.
- Add a small tilt toggle button in the in-game HUD (visible on mobile only) that shows active/inactive tilt state, toggles tilt steering on/off, and persists the preference to localStorage.

**User-visible outcome:** Mobile players can rotate their phone to landscape to play Space Snake, steer the snake by tilting the device left/right, and toggle tilt controls on or off via a HUD button whose state is remembered across sessions.
