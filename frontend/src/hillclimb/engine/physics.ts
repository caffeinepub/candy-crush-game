export interface Vector2 {
  x: number;
  y: number;
}

export function vec2(x: number, y: number): Vector2 {
  return { x, y };
}

export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v: Vector2, s: number): Vector2 {
  return { x: v.x * s, y: v.y * s };
}

export function length(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v: Vector2): Vector2 {
  const len = length(v);
  return len > 0 ? scale(v, 1 / len) : vec2(0, 0);
}

export function dot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

export function integrate(pos: Vector2, vel: Vector2, dt: number): Vector2 {
  return add(pos, scale(vel, dt));
}
