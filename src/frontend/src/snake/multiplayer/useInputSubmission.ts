import { useEffect, useRef } from 'react';
import { useActor } from '@/hooks/useActor';

const SUBMIT_INTERVAL = 50; // 50ms = 20 times per second

export function useInputSubmission(
  roomCode: string | null,
  enabled: boolean,
  currentAngle: number | null
) {
  const { actor } = useActor();
  const lastSubmitRef = useRef<number>(0);
  const angleRef = useRef<number | null>(currentAngle);

  // Update angle ref
  useEffect(() => {
    angleRef.current = currentAngle;
  }, [currentAngle]);

  useEffect(() => {
    if (!enabled || !roomCode || !actor) {
      return;
    }

    const roomId = roomCode.replace('MP-', '');

    const submitInput = async () => {
      const now = Date.now();
      if (now - lastSubmitRef.current < SUBMIT_INTERVAL) {
        return;
      }

      const angle = angleRef.current;
      if (angle === null) {
        return;
      }

      lastSubmitRef.current = now;

      try {
        // Note: Backend doesn't have submitInput method yet
        // This is a placeholder for when it's implemented
        // await actor.submitInput(roomId, angle);
      } catch (err) {
        // Silently fail - polling will continue
        console.error('Failed to submit input:', err);
      }
    };

    const intervalId = window.setInterval(submitInput, SUBMIT_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, roomCode, actor]);
}
