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
      
      // Join the room immediately after creating
      const joinResult = await actor.joinRoom(code.replace('MP-', ''), nickname);
      
      if ('Success' in joinResult) {
        setRoomCode(code);
        setRoomStatus('joined');
        return code;
      } else if ('AlreadyJoined' in joinResult) {
        setRoomCode(code);
        setRoomStatus('joined');
        return code;
      } else {
        setError('Failed to join created room');
        setRoomStatus('idle');
        return null;
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      setError('Failed to create room. Please try again.');
      setRoomStatus('idle');
      return null;
    }
  };

  const joinRoom = async (code: string, nickname: string): Promise<boolean> => {
    if (!actor) {
      setError('Backend not ready. Please wait and try again.');
      return false;
    }

    setRoomStatus('joining');
    setError(null);

    try {
      const roomId = code.replace('MP-', '');
      
      // Check if room exists
      const exists = await actor.checkRoomExists(roomId);
      if (!exists) {
        setError('Room not found or inactive');
        setRoomStatus('idle');
        return false;
      }

      // Join the room
      const joinResult = await actor.joinRoom(roomId, nickname);
      
      if ('Success' in joinResult) {
        setRoomCode(code);
        setRoomStatus('joined');
        return true;
      } else if ('AlreadyJoined' in joinResult) {
        setRoomCode(code);
        setRoomStatus('joined');
        return true;
      } else if ('RoomNotFoundOrInactive' in joinResult) {
        setError('Room not found or inactive');
        setRoomStatus('idle');
        return false;
      } else {
        setError('Failed to join room');
        setRoomStatus('idle');
        return false;
      }
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
