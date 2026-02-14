import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import type { MultiplayerRoom } from '@/backend';

const POLL_INTERVAL = 100;

export function useRoomPolling(roomCode: string | null, enabled: boolean) {
  const { actor } = useActor();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const { data: roomState, error, refetch } = useQuery<MultiplayerRoom | null>({
    queryKey: ['roomState', roomCode],
    queryFn: async () => {
      if (!actor || !roomCode) return null;
      
      const roomId = roomCode.replace('MP-', '');
      const state = await actor.getRoomState(roomId);
      
      if (state) {
        setConsecutiveFailures(0);
        setIsInitialLoad(false);
      }
      
      return state;
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
