import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useCheckRoomExists(roomId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['checkRoomExists', roomId],
    queryFn: async () => {
      if (!actor || !roomId) return false;
      return actor.checkRoomExists(roomId);
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

export function useGetRoomState(roomId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['roomState', roomId],
    queryFn: async () => {
      if (!actor || !roomId) return null;
      return actor.getRoomState(roomId);
    },
    enabled: !!actor && !isFetching && !!roomId,
    refetchInterval: 100, // Poll every 100ms
  });
}
