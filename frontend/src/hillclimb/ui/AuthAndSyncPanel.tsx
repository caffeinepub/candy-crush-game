import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useActor } from '@/hooks/useActor';
import { Cloud, CloudOff, LogIn, LogOut, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { GameState } from '../progression/storage';
import { saveGameState } from '../progression/storage';
import type { GameState as BackendGameState } from '@/backend';

interface AuthAndSyncPanelProps {
  gameState: GameState;
  onCloudSyncUpdate: (newState: GameState) => void;
}

// Convert frontend GameState to backend GameState
function toBackendGameState(state: GameState): BackendGameState {
  return {
    coinBalance: BigInt(state.coinBalance),
    unlockedVehicles: state.unlockedVehicles,
    upgradeLevels: BigInt(Object.keys(state.upgradeLevels).length), // Backend uses single number
    dailyClaimHistory: state.dailyClaimHistory
  };
}

// Convert backend GameState to frontend GameState
function fromBackendGameState(backendState: BackendGameState): GameState {
  return {
    coinBalance: Number(backendState.coinBalance),
    unlockedVehicles: backendState.unlockedVehicles,
    upgradeLevels: {}, // Backend doesn't store detailed upgrade levels, use empty object
    dailyClaimHistory: backendState.dailyClaimHistory,
    unlockedPhotos: ['photo-1'], // Backend doesn't store photos, default to first photo unlocked
    lastUpdated: Date.now()
  };
}

export default function AuthAndSyncPanel({ gameState, onCloudSyncUpdate }: AuthAndSyncPanelProps) {
  const { login, clear, identity } = useInternetIdentity();
  const { actor } = useActor();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const isAuthenticated = !!identity;

  const handleLogin = async () => {
    try {
      await login();
      // Check if user has profile
      if (actor) {
        const profile = await actor.getCallerUserProfile();
        if (!profile) {
          setShowProfileSetup(true);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    }
  };

  const handleLogout = async () => {
    await clear();
    toast.success('Logged out');
  };

  const handleSaveProfile = async () => {
    if (!actor || !username.trim()) return;
    
    try {
      await actor.saveCallerUserProfile({
        username: username.trim(),
        gameState: toBackendGameState(gameState)
      });
      setShowProfileSetup(false);
      toast.success('Profile created!');
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error('Failed to save profile');
    }
  };

  const handleCloudSave = async () => {
    if (!actor) return;
    
    setIsSyncing(true);
    try {
      await actor.saveGameState(toBackendGameState(gameState));
      toast.success('Game saved to cloud');
    } catch (error) {
      console.error('Cloud save error:', error);
      toast.error('Failed to save to cloud');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCloudLoad = async () => {
    if (!actor) return;
    
    setIsSyncing(true);
    try {
      const cloudState = await actor.getGameState();
      
      // Simple last-write-wins: compare timestamps if available, or let user choose
      const useCloud = confirm('Load game state from cloud? This will replace your local progress.');
      
      if (useCloud) {
        const newState = fromBackendGameState(cloudState);
        
        // Merge with current upgrade levels and photos since backend doesn't store them in detail
        newState.upgradeLevels = gameState.upgradeLevels;
        newState.unlockedPhotos = gameState.unlockedPhotos;
        
        onCloudSyncUpdate(newState);
        saveGameState(newState);
        toast.success('Game loaded from cloud');
      }
    } catch (error) {
      console.error('Cloud load error:', error);
      toast.error('Failed to load from cloud');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <Card className="hillclimb-sync-panel">
        <CardHeader>
          <CardTitle className="text-sm">Cloud Sync (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!isAuthenticated ? (
            <Button onClick={handleLogin} variant="outline" size="sm" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Login to Sync
            </Button>
          ) : (
            <>
              <div className="flex gap-2">
                <Button onClick={handleCloudSave} variant="outline" size="sm" disabled={isSyncing} className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button onClick={handleCloudLoad} variant="outline" size="sm" disabled={isSyncing} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Load
                </Button>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Profile</DialogTitle>
            <DialogDescription>
              Choose a username for your profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                maxLength={20}
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={!username.trim()} className="w-full">
              Create Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
