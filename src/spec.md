# Specification

## Summary
**Goal:** Add an offline-first in-game Photo Gallery with coin-based unlocks (first photo free) and fix the issue where the vehicle doesn’t move/respond at run start.

**Planned changes:**
- Add a new Photo Gallery entry point in the Hill Climb UI (accessible without login).
- Implement a gallery screen showing photo thumbnails with clear locked/unlocked states, with Photo #1 unlocked by default.
- Add tap behavior: open a full-screen/modal viewer for unlocked photos; show an unlock confirmation prompt for locked photos.
- Persist photo unlock state locally (localStorage) integrated with the existing Hill Climb progression storage approach.
- Integrate unlock purchasing with the existing coin balance: display cost, block unlock when coins are insufficient, deduct coins on confirmation, and persist both coins and unlocks.
- Add curated static gallery photo assets under `frontend/public/assets/generated` and reference them directly so they work offline.
- Fix gameplay control/physics startup so throttle/brake reliably register on touch and desktop, avoiding stuck/canceled pointer states and ensuring the vehicle accelerates when throttle is held.

**User-visible outcome:** Players can open a Photo Gallery, view the first free photo immediately, unlock additional photos using coins (persisting offline across restarts), and the car reliably moves when holding throttle at the start of a run on mobile and desktop.
