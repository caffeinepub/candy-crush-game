// Simple audio manager for game sound effects

class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private muted: boolean = false;

  loadSound(name: string, url: string) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }

  play(name: string, volume: number = 1.0) {
    if (this.muted) return;
    
    const sound = this.sounds.get(name);
    if (sound) {
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = volume;
      clone.play().catch(() => {
        // Ignore play errors (e.g., user hasn't interacted yet)
      });
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted(): boolean {
    return this.muted;
  }
}

export const audioManager = new AudioManager();

// Initialize with placeholder sounds (using data URIs for silent audio)
// In a real implementation, you would load actual sound files
const silentAudio = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

audioManager.loadSound('swap', silentAudio);
audioManager.loadSound('match', silentAudio);
audioManager.loadSound('special', silentAudio);
audioManager.loadSound('levelComplete', silentAudio);
audioManager.loadSound('gameOver', silentAudio);
