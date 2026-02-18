import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { WZ_ASSETS } from './wzAssets';
import { useNickname } from './multiplayer/useNickname';
import { useMultiplayerRoom } from './multiplayer/useMultiplayerRoom';
import { buildInviteURL } from './multiplayer/urlRoomCode';
import { Copy, Check, Users, Play, AlertCircle } from 'lucide-react';

interface SnakeMainMenuProps {
  onStartGame: () => void;
  onStartMultiplayer?: (roomCode: string, nickname: string) => void;
}

export default function SnakeMainMenu({ onStartGame, onStartMultiplayer }: SnakeMainMenuProps) {
  const { nickname, setNickname, error: nicknameError, isValid } = useNickname();
  const { roomCode, roomStatus, error: roomError, createRoom, joinRoom } = useMultiplayerRoom();
  const [joinCode, setJoinCode] = useState('');
  const [joinCodeError, setJoinCodeError] = useState('');
  const [copied, setCopied] = useState(false);

  const normalizeRoomCode = (code: string): string => {
    // Trim whitespace and convert to uppercase
    let normalized = code.trim().toUpperCase();
    
    // Remove MP- prefix if present for validation, we'll add it back if needed
    if (normalized.startsWith('MP-')) {
      normalized = normalized.substring(3);
    }
    
    return normalized;
  };

  const validateJoinCode = (code: string): boolean => {
    const normalized = normalizeRoomCode(code);
    
    if (!normalized) {
      setJoinCodeError('Please enter a room code');
      return false;
    }
    
    // Check if it's a valid number
    if (!/^\d+$/.test(normalized)) {
      setJoinCodeError('Room code must contain only numbers');
      return false;
    }
    
    setJoinCodeError('');
    return true;
  };

  const handleCreateRoom = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isValid()) return;
    
    const code = await createRoom(nickname.trim());
    if (code && onStartMultiplayer) {
      onStartMultiplayer(code, nickname.trim());
    }
  };

  const handleJoinRoom = async () => {
    if (!isValid()) return;
    
    if (!validateJoinCode(joinCode)) return;
    
    // Normalize and ensure MP- prefix
    const normalized = normalizeRoomCode(joinCode);
    const fullCode = `MP-${normalized}`;
    
    const success = await joinRoom(fullCode, nickname.trim());
    if (success && onStartMultiplayer) {
      onStartMultiplayer(fullCode, nickname.trim());
    }
  };

  const handleJoinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJoinCode(e.target.value);
    setJoinCodeError('');
  };

  const handleCopyInvite = () => {
    if (!roomCode) return;
    
    const inviteURL = buildInviteURL(roomCode);
    navigator.clipboard.writeText(inviteURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isJoinDisabled = !isValid() || !joinCode.trim() || roomStatus === 'joining';

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

        {/* Game Mode Selection */}
        <Tabs defaultValue="single" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger 
              value="single"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Play size={16} className="mr-2" />
              Single Player
            </TabsTrigger>
            <TabsTrigger 
              value="multi"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users size={16} className="mr-2" />
              Multiplayer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Play Solo</CardTitle>
                <CardDescription>
                  Battle against AI opponents and complete missions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <button 
                  type="button"
                  onClick={onStartGame}
                  className="snake-menu-primary-btn w-full"
                  style={{ backgroundImage: `url(${WZ_ASSETS.btnPrimaryGreen})` }}
                >
                  <span className="snake-menu-btn-text">To battle!</span>
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multi" className="space-y-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Multiplayer Arena</CardTitle>
                <CardDescription>
                  Create or join a room to play with friends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nickname Input */}
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input
                    id="nickname"
                    placeholder="Enter your nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                    className="bg-white"
                  />
                  {nicknameError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle size={14} />
                      {nicknameError}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Create Room */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={handleCreateRoom}
                    disabled={!isValid() || roomStatus === 'creating'}
                    className="w-full"
                  >
                    {roomStatus === 'creating' ? 'Creating...' : 'Create Room'}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                {/* Join Room */}
                <div className="space-y-2">
                  <Label htmlFor="joinCode">Join with Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="joinCode"
                      placeholder="Enter room code (e.g., MP-123 or 123)"
                      value={joinCode}
                      onChange={handleJoinCodeChange}
                      className="bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isJoinDisabled) {
                          handleJoinRoom();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={handleJoinRoom}
                      disabled={isJoinDisabled}
                    >
                      {roomStatus === 'joining' ? 'Joining...' : 'Join'}
                    </Button>
                  </div>
                  {joinCodeError && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle size={14} />
                      {joinCodeError}
                    </p>
                  )}
                </div>

                {roomError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle size={14} />
                    {roomError}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Secondary buttons */}
        <div className="snake-menu-secondary-btns">
          <Button 
            type="button"
            variant="outline" 
            size="lg"
            className="snake-menu-secondary-btn bg-white"
          >
            Worm wardrobe
          </Button>
        </div>
      </div>
    </div>
  );
}
