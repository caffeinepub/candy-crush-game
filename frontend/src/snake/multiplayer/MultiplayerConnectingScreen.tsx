import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, WifiOff, RotateCcw } from 'lucide-react';

interface MultiplayerConnectingScreenProps {
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected';
  isInitialLoad: boolean;
  onRetry: () => void;
  onLeave: () => void;
}

export default function MultiplayerConnectingScreen({
  connectionStatus,
  isInitialLoad,
  onRetry,
  onLeave,
}: MultiplayerConnectingScreenProps) {
  const isConnecting = connectionStatus === 'connected' || connectionStatus === 'reconnecting';
  const isDisconnected = connectionStatus === 'disconnected';

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnecting && <Loader2 className="animate-spin" size={24} />}
            {isDisconnected && <WifiOff size={24} />}
            {isConnecting ? 'Connecting to Room' : 'Connection Failed'}
          </CardTitle>
          <CardDescription>
            {isInitialLoad && isConnecting && 'Joining multiplayer room...'}
            {!isInitialLoad && isConnecting && 'Reconnecting to room...'}
            {isDisconnected && 'Unable to connect to the multiplayer room'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnecting && (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          )}
          
          {isDisconnected && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                The room may no longer exist or the connection was lost.
              </p>
              <div className="flex gap-2">
                <Button onClick={onRetry} className="flex-1">
                  <RotateCcw size={16} className="mr-2" />
                  Retry
                </Button>
                <Button onClick={onLeave} variant="outline" className="flex-1">
                  Leave Room
                </Button>
              </div>
            </div>
          )}

          {isConnecting && (
            <Button onClick={onLeave} variant="outline" className="w-full">
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
