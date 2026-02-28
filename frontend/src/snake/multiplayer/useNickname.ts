import { useState, useEffect } from 'react';

const NICKNAME_KEY = 'snake_arena_nickname';
const MIN_LENGTH = 2;
const MAX_LENGTH = 20;

export function useNickname() {
  const [nickname, setNickname] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(NICKNAME_KEY);
    if (stored) {
      setNickname(stored);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (nickname.trim()) {
      localStorage.setItem(NICKNAME_KEY, nickname.trim());
    }
  }, [nickname]);

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    
    if (trimmed.length < MIN_LENGTH) {
      return `Nickname must be at least ${MIN_LENGTH} characters`;
    }
    
    if (trimmed.length > MAX_LENGTH) {
      return `Nickname must be at most ${MAX_LENGTH} characters`;
    }
    
    return null;
  };

  const handleSetNickname = (value: string) => {
    setNickname(value);
    const validationError = validate(value);
    setError(validationError);
  };

  const isValid = (): boolean => {
    return validate(nickname) === null;
  };

  return {
    nickname,
    setNickname: handleSetNickname,
    error,
    isValid,
  };
}
