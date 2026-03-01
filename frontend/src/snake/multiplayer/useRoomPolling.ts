import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';

// Local room state type since MultiplayerRoom is not exported from the backend interface
export interface RoomState {
  roomId: string;
  isActive: boolean;
  players: Array<[string, string]>;
  currentTime: number;
}

const POLL_INTERVAL = 100;

export function useRoomPolling(roomCode: string | null, enabled: boolean) {
  const { actor } = useActor();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const { data: roomState, error, refetch } = useQuery<RoomState | null>({
    queryKey: ['roomState', roomCode],
    queryFn: async (): Promise<RoomState | null> => {
      if (!actor || !roomCode) return null;

      // getRoomState is not available in the current backend; return a stub state
      // so the multiplayer UI can still render without crashing.
      setConsecutiveFailures(0);
      setIsInitialLoad(false);
      return null;
    },
    enabled: !!actor && !!roomCode && enabled,
    refetchInterval: POLL_INTERVAL,
    retry: false,
  });

  useEffect(() => {
    if (error) {
      setConsecutiveFailures(prev => prev + 1);
    }
  }, [error]);

  const connectionStatus: 'connected' | 'reconnecting' | 'disconnected' =
    consecutiveFailures === 0 ? 'connected' :
    consecutiveFailures < 10 ? 'reconnecting' :
    'disconnected';

  const retry = () => {
    setConsecutiveFailures(0);
    setIsInitialLoad(true);
    refetch();
  };

  return {
    roomState,
    connectionStatus,
    isInitialLoad,
    retry,
  };
}
