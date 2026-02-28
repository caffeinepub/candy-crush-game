import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface MultiplayerRoomCodePanelProps {
  roomCode: string;
}

export default function MultiplayerRoomCodePanel({ roomCode }: MultiplayerRoomCodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setCopyError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy room code:', err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  if (!roomCode) return null;

  return (
    <div className="multiplayer-room-code-panel">
      <div className="multiplayer-room-code-content">
        <div>
          <div className="multiplayer-room-code-label">Room Code</div>
          <div className="multiplayer-room-code-value">{roomCode}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-8 w-8"
          aria-label={copied ? 'Room code copied' : 'Copy room code'}
          aria-live="polite"
        >
          {copied ? (
            <Check size={16} className="text-green-400" />
          ) : (
            <Copy size={16} />
          )}
        </Button>
      </div>
      {copyError && (
        <div className="multiplayer-room-code-error">
          Failed to copy
        </div>
      )}
    </div>
  );
}
