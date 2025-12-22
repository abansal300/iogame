// Game configuration constants
export const GAME_CONFIG = {
  ARENA_WIDTH: 4000,
  ARENA_HEIGHT: 4000,
  CAR_WIDTH: 40,
  CAR_HEIGHT: 60,
  INITIAL_FUEL: 100,
  MAX_FUEL: 150,
  FUEL_DEPLETION_RATE: 0.5, // Base fuel per second
  SPEED_FUEL_MULTIPLIER: 0.015, // Extra fuel cost per unit of speed
  MAX_SPEED: 300,
  ACCELERATION: 200,
  FRICTION: 0.85,
  ROTATION_SPEED: 3.5,
  CRAWL_SPEED: 30, // Speed when out of fuel
  FUEL_PICKUP_AMOUNT: 40,
  FUEL_PICKUP_SPAWN_INTERVAL: 5000, // 5 seconds
  MAX_FUEL_PICKUPS: 15,
  RAM_FUEL_STEAL_PERCENT: 0.15, // Steal 15% of victim's fuel
  RAM_COOLDOWN: 1000, // 1 second between rams
  TICK_RATE: 60, // Server updates per second
  MATCH_DURATION: 180000, // 3 minutes in milliseconds
} as const;

// Vector2D for positions and velocities
export interface Vector2D {
  x: number;
  y: number;
}

// Player/Car state shared between client and server
export interface PlayerState {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  rotation: number; // Radians
  fuel: number;
  distance: number; // Total distance traveled
  isAlive: boolean;
  lastRamTime: number;
  color: string; // Hex color for car
}

// Fuel pickup entity
export interface FuelPickup {
  id: string;
  position: Vector2D;
  amount: number;
  active: boolean;
}

// Input state from client
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  timestamp: number;
}

// Full game state sent from server
export interface GameState {
  players: Record<string, PlayerState>;
  fuelPickups: FuelPickup[];
  matchStartTime: number;
  matchEndTime: number;
  isMatchActive: boolean;
}

// Socket.IO event types for type safety
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

// Match end results
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
