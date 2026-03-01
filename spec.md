# Specification

## Summary
**Goal:** Fix the coin counter bug and reposition the minimap and joystick in the Space Snake game HUD.

**Planned changes:**
- Fix the coin collection counter so it initializes at 0 and increments correctly by 1 per coin pickup, preventing negative or overflow values like "-203223/30"
- Move the minimap from the right side of the screen to the top-left corner
- Move the joystick slightly upward from the very bottom edge of the screen

**User-visible outcome:** The coin counter displays correctly (e.g., "1/30"), the minimap appears in the top-left corner, and the joystick is raised slightly from the bottom edge for easier access.
