import { useEffect, useRef } from 'react';

export function useFixedTimestep(step: (dt: number) => void, dt: number) {
  const accumulatorRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      accumulatorRef.current += deltaTime;

      // Fixed timestep with accumulator
      while (accumulatorRef.current >= dt) {
        step(dt);
        accumulatorRef.current -= dt;
      }

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [step, dt]);
}
