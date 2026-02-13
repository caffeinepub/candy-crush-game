import { Button } from '@/components/ui/button';
import { WZ_ASSETS } from './wzAssets';

interface SnakeMainMenuProps {
  onStartGame: () => void;
}

export default function SnakeMainMenu({ onStartGame }: SnakeMainMenuProps) {
  return (
    <div className="snake-main-menu">
      <div className="snake-menu-content">
        {/* Logo */}
        <div className="snake-menu-logo">
          <img 
            src={WZ_ASSETS.gameLogo}
            alt="Snake Arena"
            className="snake-menu-logo-img"
          />
        </div>

        {/* Instructions */}
        <div className="snake-menu-instructions">
          <p className="snake-menu-instructions-text">
            Control your worm with the joystick, keyboard (WASD/Arrows), or tilt controls. 
            Collect food to grow longer and eliminate opponents by making them crash into your body. 
            Complete missions to earn coins and dominate the arena!
          </p>
        </div>

        {/* Primary CTA */}
        <button 
          onClick={onStartGame}
          className="snake-menu-primary-btn"
          style={{ backgroundImage: `url(${WZ_ASSETS.btnPrimaryGreen})` }}
        >
          <span className="snake-menu-btn-text">To battle!</span>
        </button>

        {/* Secondary buttons */}
        <div className="snake-menu-secondary-btns">
          <Button 
            variant="outline" 
            size="lg"
            className="snake-menu-secondary-btn"
          >
            Worm wardrobe
          </Button>
        </div>
      </div>
    </div>
  );
}
