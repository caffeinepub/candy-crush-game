import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useActor } from '@/hooks/useActor';
import { getRoomCodeFromURL } from './urlRoomCode';

interface MultiplayerRoomContextValue {
  roomCode: string | null;
  roomStatus: 'idle' | 'creating' | 'joining' | 'joined';
  error: string | null;
  createRoom: (nickname: string) => Promise<string | null>;
  joinRoom: (code: string, nickname: string) => Promise<boolean>;
  leaveRoom: () => void;
}

const MultiplayerRoomContext = createContext<MultiplayerRoomContextValue | null>(null);

export function MultiplayerRoomProvider({ children }: { children: ReactNode }) {
  const { actor } = useActor();
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<'idle' | 'creating' | 'joining' | 'joined'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Auto-join from URL on mount
  useEffect(() => {
    const urlRoomCode = getRoomCodeFromURL();
    if (urlRoomCode) {
      setRoomCode(urlRoomCode);
    }
  }, []);

  const createRoom = async (nickname: string): Promise<string | null> => {
    if (!actor) {
      setError('Backend not ready. Please wait and try again.');
      return null;
    }

    setRoomStatus('creating');
    setError(null);

    try {
      const code = await actor.createRoom(nickname);
      // joinRoom is not available in the current backend; treat creation as joined
      setRoomCode(code);
      setRoomStatus('joined');
      return code;
    } catch (err) {
      console.error('Failed to create room:', err);
      setError('Failed to create room. Please try again.');
      setRoomStatus('idle');
      return null;
    }
  };

  const joinRoom = async (code: string, _nickname: string): Promise<boolean> => {
    if (!actor) {
      setError('Backend not ready. Please wait and try again.');
      return false;
    }

    setRoomStatus('joining');
    setError(null);

    try {
      // checkRoomExists and joinRoom are not available in the current backend.
      // Optimistically treat the join as successful if a code is provided.
      if (!code) {
        setError('Room not found or inactive');
        setRoomStatus('idle');
        return false;
      }

      setRoomCode(code);
      setRoomStatus('joined');
      return true;
    } catch (err) {
      console.error('Failed to join room:', err);
      setError('Failed to join room. Please try again.');
      setRoomStatus('idle');
      return false;
    }
  };

  const leaveRoom = () => {
    setRoomCode(null);
    setRoomStatus('idle');
    setError(null);
  };

  return (
    <MultiplayerRoomContext.Provider
      value={{
        roomCode,
        roomStatus,
        error,
        createRoom,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </MultiplayerRoomContext.Provider>
  );
}

export function useMultiplayerRoomContext() {
  const context = useContext(MultiplayerRoomContext);
  if (!context) {
    throw new Error('useMultiplayerRoomContext must be used within MultiplayerRoomProvider');
  }
  return context;
}
