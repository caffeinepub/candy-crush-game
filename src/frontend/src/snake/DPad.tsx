import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Direction } from './types';

interface DPadProps {
  onDirectionChange: (direction: Direction) => void;
  disabled?: boolean;
}

export default function DPad({ onDirectionChange, disabled = false }: DPadProps) {
  const handleDirection = (direction: Direction) => {
    if (!disabled) {
      onDirectionChange(direction);
    }
  };

  return (
    <div className="dpad-container">
      <div className="dpad-grid">
        {/* Top row - Up button */}
        <div className="dpad-cell dpad-cell-top">
          <Button
            variant="outline"
            size="lg"
            className="dpad-button"
            onClick={() => handleDirection('UP')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleDirection('UP');
            }}
            disabled={disabled}
            aria-label="Up"
          >
            <ChevronUp size={32} />
          </Button>
        </div>

        {/* Middle row - Left, Center (empty), Right */}
        <div className="dpad-cell dpad-cell-left">
          <Button
            variant="outline"
            size="lg"
            className="dpad-button"
            onClick={() => handleDirection('LEFT')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleDirection('LEFT');
            }}
            disabled={disabled}
            aria-label="Left"
          >
            <ChevronLeft size={32} />
          </Button>
        </div>

        <div className="dpad-cell dpad-cell-center" />

        <div className="dpad-cell dpad-cell-right">
          <Button
            variant="outline"
            size="lg"
            className="dpad-button"
            onClick={() => handleDirection('RIGHT')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleDirection('RIGHT');
            }}
            disabled={disabled}
            aria-label="Right"
          >
            <ChevronRight size={32} />
          </Button>
        </div>

        {/* Bottom row - Down button */}
        <div className="dpad-cell dpad-cell-bottom">
          <Button
            variant="outline"
            size="lg"
            className="dpad-button"
            onClick={() => handleDirection('DOWN')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleDirection('DOWN');
            }}
            disabled={disabled}
            aria-label="Down"
          >
            <ChevronDown size={32} />
          </Button>
        </div>
      </div>
    </div>
  );
}
