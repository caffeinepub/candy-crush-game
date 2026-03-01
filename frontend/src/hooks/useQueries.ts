import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

// Room existence check — not available in current backend; always returns false
export function useCheckRoomExists(roomId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['checkRoomExists', roomId],
    queryFn: async (): Promise<boolean> => {
      // Backend does not expose checkRoomExists; return false as safe default
      return false;
    },
    enabled: !!actor && !isFetching && !!roomId,
  });
}

export function useCreateRoom() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createRoom(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

// Room state polling — not available in current backend; returns null
export function useGetRoomState(roomId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['roomState', roomId],
    queryFn: async (): Promise<null> => {
      // Backend does not expose getRoomState; return null as safe default
      return null;
    },
    enabled: !!actor && !isFetching && !!roomId,
    refetchInterval: 100,
  });
}
