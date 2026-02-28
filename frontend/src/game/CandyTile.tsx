import { type Candy, type Position } from './types';
import { ASSETS, getCandySpritePosition } from './assets';

interface CandyTileProps {
  candy: Candy | null;
  position: Position;
  isSelected: boolean;
  isHighlighted: boolean;
  isClearing: boolean;
  isFalling: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export default function CandyTile({
  candy,
  position,
  isSelected,
  isHighlighted,
  isClearing,
  isFalling,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
}: CandyTileProps) {
  if (!candy) {
    return (
      <div className="candy-tile candy-tile-empty">
        <div className="candy-tile-inner" />
      </div>
    );
  }

  const spritePos = getCandySpritePosition(candy.type);
  
  let imageStyle: React.CSSProperties = {
    backgroundImage: `url(${ASSETS.candySet})`,
    backgroundPosition: `-${spritePos.x}px ${spritePos.y}px`,
    backgroundSize: '256px 256px',
  };

  // Override for special candies
  if (candy.special === 'striped-h' || candy.special === 'striped-v') {
    imageStyle = {
      backgroundImage: `url(${ASSETS.stripedVariants})`,
      backgroundPosition: candy.special === 'striped-h' ? '0 0' : '-128px 0',
      backgroundSize: '256px 256px',
    };
  } else if (candy.special === 'wrapped') {
    imageStyle = {
      backgroundImage: `url(${ASSETS.wrapped})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
    };
  } else if (candy.special === 'color-bomb') {
    imageStyle = {
      backgroundImage: `url(${ASSETS.colorBomb})`,
      backgroundSize: 'contain',
      backgroundPosition: 'center',
    };
  }

  return (
    <div
      className={`candy-tile ${isSelected ? 'candy-tile-selected' : ''} ${isHighlighted ? 'candy-tile-highlighted' : ''} ${isClearing ? 'candy-tile-clearing' : ''} ${isFalling ? 'candy-tile-falling' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="candy-tile-inner" style={imageStyle} />
    </div>
  );
}
