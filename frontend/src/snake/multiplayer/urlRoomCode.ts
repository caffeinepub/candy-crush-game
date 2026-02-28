/**
 * URL helper to read/write room code from URL for invite links
 */

export function getRoomCodeFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  
  const params = new URLSearchParams(window.location.search);
  return params.get('room');
}

export function setRoomCodeInURL(roomCode: string): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  url.searchParams.set('room', roomCode);
  window.history.replaceState({}, '', url.toString());
}

export function clearRoomCodeFromURL(): void {
  if (typeof window === 'undefined') return;
  
  const url = new URL(window.location.href);
  url.searchParams.delete('room');
  window.history.replaceState({}, '', url.toString());
}

export function buildInviteURL(roomCode: string): string {
  if (typeof window === 'undefined') return '';
  
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('room', roomCode);
  return url.toString();
}
