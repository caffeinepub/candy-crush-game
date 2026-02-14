# Specification

## Summary
**Goal:** Add a multiplayer room-code join flow in the main menu, show the active room code in-game during multiplayer, and remove the right-side coin HUD panel from gameplay.

**Planned changes:**
- Update the main menu Multiplayer tab to include a clearly visible “Join with Code” input and Join button that uses existing multiplayer join behavior, with simple English validation for empty/invalid codes.
- During multiplayer gameplay, add a persistent “Room Code” panel that displays the active room code and provides a copy-to-clipboard action with clear feedback.
- Remove the standalone right-side/top coin HUD photo/panel from gameplay UI, ensuring remaining HUD elements (e.g., leaderboard/mission HUD) still render correctly without layout gaps/overlap.

**User-visible outcome:** Players can join multiplayer using a room code from the main menu, can always view/copy the current room code during multiplayer gameplay, and the right-side coin image panel no longer appears during gameplay.
