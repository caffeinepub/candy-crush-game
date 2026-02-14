import { WifiOff, Wifi } from 'lucide-react';

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

interface MultiplayerConnectionIndicatorProps {
  status: ConnectionStatus;
}

export default function MultiplayerConnectionIndicator({ status }: MultiplayerConnectionIndicatorProps) {
  if (status === 'connected') {
    return null;
  }

  return (
    <div className="multiplayer-connection-indicator">
      <div className="multiplayer-connection-content">
        {status === 'reconnecting' ? (
          <>
            <Wifi size={16} className="multiplayer-connection-icon animate-pulse" />
            <span>Reconnecting...</span>
          </>
        ) : (
          <>
            <WifiOff size={16} className="multiplayer-connection-icon" />
            <span>Disconnected</span>
          </>
        )}
      </div>
    </div>
  );
}
