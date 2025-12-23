// Game configuration constants
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
  speed: number; // Current speed
  speedBoostCount: number; // Number of speed boosts collected (permanent)
}

// Fuel pickup entity
export interface FuelPickup {
  id: string;
  position: Vector2D;
  amount: number;
  active: boolean;
}

// Speed boost entity
export interface SpeedBoost {
  id: string;
  position: Vector2D;
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
  speedBoosts: SpeedBoost[];
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
