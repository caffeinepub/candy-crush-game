import { Smartphone } from 'lucide-react';

interface RotateToLandscapeOverlayProps {
  visible: boolean;
}

/**
 * Full-screen overlay that blocks gameplay in portrait mode and prompts
 * the user to rotate their device to landscape orientation.
 */
export default function RotateToLandscapeOverlay({ visible }: RotateToLandscapeOverlayProps) {
  if (!visible) return null;

  return (
    <div className="rotate-overlay">
      <div className="rotate-overlay-content">
        <div className="rotate-overlay-icon">
          <Smartphone size={64} className="rotate-icon-animate" />
        </div>
        <h2 className="rotate-overlay-title">Rotate your phone to play</h2>
        <p className="rotate-overlay-text">
          This game is best played in landscape mode
        </p>
      </div>
    </div>
  );
}
