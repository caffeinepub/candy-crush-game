import { useState, useEffect, RefObject } from 'react';

export interface CanvasViewport {
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  dpr: number;
}

/**
 * Hook that measures the playfield container and provides responsive viewport sizing
 * with devicePixelRatio support for crisp canvas rendering.
 * Stabilizes measurements to minimize resize/layout thrashing.
 */
export function useCanvasViewport(
  containerRef: RefObject<HTMLElement | null>
): CanvasViewport {
  const [viewport, setViewport] = useState<CanvasViewport>({
    width: 800,
    height: 450,
    canvasWidth: 800,
    canvasHeight: 450,
    dpr: 1,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;
    let pendingUpdate = false;

    const updateViewport = () => {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Round to avoid sub-pixel jitter
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      const canvasWidth = Math.round(width * dpr);
      const canvasHeight = Math.round(height * dpr);

      // Only update if values materially changed (avoid thrashing)
      setViewport((prev) => {
        if (
          Math.abs(prev.width - width) < 1 &&
          Math.abs(prev.height - height) < 1 &&
          Math.abs(prev.dpr - dpr) < 0.01
        ) {
          return prev; // No material change
        }
        return { width, height, canvasWidth, canvasHeight, dpr };
      });

      pendingUpdate = false;
    };

    const scheduleUpdate = () => {
      if (pendingUpdate) return;
      pendingUpdate = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateViewport);
    };

    // Initial measurement
    updateViewport();

    // ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);

    // Window resize and orientation change (for DPR changes on zoom/rotate)
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [containerRef]);

  return viewport;
}
