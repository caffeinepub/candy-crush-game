export interface InputState {
  throttle: number; // 0-1
  brake: number; // 0-1
}

export function getInputState(): InputState {
  return { throttle: 0, brake: 0 };
}
