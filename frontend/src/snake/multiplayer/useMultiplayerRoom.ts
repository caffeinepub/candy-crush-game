import { useMultiplayerRoomContext } from './MultiplayerRoomContext';

/**
 * Hook for accessing multiplayer room state and actions.
 * This is now a thin wrapper around the shared context.
 */
export function useMultiplayerRoom() {
  return useMultiplayerRoomContext();
}
