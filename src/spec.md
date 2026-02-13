# Specification

## Summary
**Goal:** Make the Snake Arena gameplay area appear medium-sized on desktop/tablet while still fitting fully within the viewport, and keep canvas sizing/rendering accurate after the change.

**Planned changes:**
- Update responsive sizing rules for the main gameplay container (`.game-container.snake-game-container`) so it uses more of the available viewport on typical desktop/tablet screens while maintaining a sensible (16:9) aspect ratio and staying fully visible without scrolling.
- Ensure `useCanvasViewport` / `SnakeCanvas` continue to receive accurate `viewportWidth/viewportHeight` and that the canvas scales crisply to fill the resized container, including correct updates on browser resize.

**User-visible outcome:** On desktop/tablet, the Snake Arena game board looks noticeably larger (medium-sized) while still fully fitting on-screen; on mobile it remains stable and non-overflowing, and the canvas stays crisp and correctly sized when resizing the window.
