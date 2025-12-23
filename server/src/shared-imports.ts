// Temporary workaround: Direct imports to bypass module resolution
// In production, this would be handled by proper build configuration

// Re-export everything from shared for server use
export const GAME_CONFIG = {
  ARENA_WIDTH: 4000,
  ARENA_HEIGHT: 4000,
  CAR_WIDTH: 40,
  CAR_HEIGHT: 60,
  INITIAL_FUEL: 100,
  MAX_FUEL: 150,
  FUEL_DEPLETION_RATE: 2.5, // Increased from 0.5 - fuel runs out much faster
  SPEED_FUEL_MULTIPLIER: 0.03, // Doubled from 0.015
  MAX_SPEED: 194, // 700 km/h base speed (194 * 3.6 = 698.4 km/h)
  ABSOLUTE_MAX_SPEED: 694, // 2500 km/h hard cap (694 * 3.6 = 2498.4 km/h)
  MIN_SPEED_AT_LOW_FUEL: 83, // 300 km/h minimum (83 * 3.6 = 298.8 km/h)
  ACCELERATION: 1200, // Much higher for quicker acceleration
  FRICTION: 0.96, // Reduced friction (was 0.88) to allow higher speeds
  ROTATION_SPEED: 3.5,
  CRAWL_SPEED: 14, // 50 km/h crawl speed (14 * 3.6 = 50.4 km/h)
  FUEL_PICKUP_AMOUNT: 40,
  FUEL_PICKUP_SPAWN_INTERVAL: 5000,
  MAX_FUEL_PICKUPS: 15,
  SPEED_BOOST_AMOUNT: 28, // +100 km/h per boost (28 * 3.6 = 100.8 km/h)
  SPEED_BOOST_DURATION: 0, // Speed boosts are now permanent (not temporary)
  SPEED_BOOST_SPAWN_INTERVAL: 8000, // 8 seconds
  MAX_SPEED_BOOSTS: 5,
  RAM_FUEL_STEAL_PERCENT: 0.15,
  RAM_COOLDOWN: 1000,
  TICK_RATE: 60,
  MATCH_DURATION: 180000,
} as const;

export interface Vector2D {
  x: number;
  y: number;
}

export interface PlayerState {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number;
  fuel: number;
  distance: number;
  isAlive: boolean;
  lastRamTime: number;
  color: string;
  speed: number; // Current speed
  speedBoostCount: number; // Number of speed boosts collected (permanent)
}

export interface FuelPickup {
  id: string;
  position: Vector2D;
  amount: number;
  active: boolean;
}

export interface SpeedBoost {
  id: string;
  position: Vector2D;
  active: boolean;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  timestamp: number;
}

export interface GameState {
  players: Record<string, PlayerState>;
  fuelPickups: FuelPickup[];
  speedBoosts: SpeedBoost[];
  matchStartTime: number;
  matchEndTime: number;
  isMatchActive: boolean;
}

export interface ServerToClientEvents {
  gameState: (state: GameState) => void;
  playerJoined: (playerId: string) => void;
  playerLeft: (playerId: string) => void;
  matchStart: (startTime: number) => void;
  matchEnd: (results: MatchResults) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  playerInput: (input: InputState) => void;
  requestJoinGame: (playerName?: string) => void;
}

export interface MatchResults {
  winner: {
    id: string;
    distance: number;
  };
  rankings: Array<{
    id: string;
    distance: number;
    rank: number;
  }>;
}

// Utility functions
export function distance(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function magnitude(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v: Vector2D): Vector2D {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

export function add(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function multiply(v: Vector2D, scalar: number): Vector2D {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpVector(a: Vector2D, b: Vector2D, t: number): Vector2D {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
  };
}

export function circleCollision(
  pos1: Vector2D,
  radius1: number,
  pos2: Vector2D,
  radius2: number
): boolean {
  return distance(pos1, pos2) < radius1 + radius2;
}

export function randomPosition(width: number, height: number, padding: number = 0): Vector2D {
  return {
    x: padding + Math.random() * (width - 2 * padding),
    y: padding + Math.random() * (height - 2 * padding),
  };
}

export function randomColor(): string {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#FFA07A',
    '#98D8C8',
    '#F7DC6F',
    '#BB8FCE',
    '#85C1E2',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
