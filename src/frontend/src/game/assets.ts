// Asset mapping for static generated images

export const ASSETS = {
  background: '/assets/generated/candy-bg-tile.dim_512x512.png',
  candySet: '/assets/generated/candy-set-6-v2.dim_256x256.png',
  stripedVariants: '/assets/generated/candy-striped-variants-v2.dim_256x256.png',
  wrapped: '/assets/generated/candy-wrapped-v2.dim_256x256.png',
  colorBomb: '/assets/generated/candy-color-bomb-v2.dim_256x256.png',
  panelFrame: '/assets/generated/ui-panel-frame.dim_1200x300.png',
} as const;

// Helper to get candy sprite position (assuming 6 candies in a row)
export function getCandySpritePosition(type: number): { x: number; y: number } {
  return {
    x: (type % 6) * (256 / 6),
    y: 0,
  };
}
