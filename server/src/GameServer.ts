import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  GameState,
  PlayerState,
  InputState,
  GAME_CONFIG,
  MatchResults,
  randomPosition,
  randomColor,
} from './shared-imports.js';
import { Player } from './Player.js';
import { FuelPickupManager } from './FuelPickupManager.js';

type ClientSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export class GameServer {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
  private players: Map<string, Player> = new Map();
  private fuelPickupManager: FuelPickupManager;

  private gameLoopInterval: NodeJS.Timeout | null = null;
  private lastUpdateTime: number = Date.now();

  private matchStartTime: number = 0;
  private matchEndTime: number = 0;
  private isMatchActive: boolean = false;
  private hasMatchEnded: boolean = false;

  constructor(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
    this.fuelPickupManager = new FuelPickupManager();

    this.setupSocketHandlers();
    this.startGameLoop();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: ClientSocket) => {
      console.log(`Player connected: ${socket.id}`);

      socket.on('requestJoinGame', () => {
        this.addPlayer(socket);
      });

      socket.on('playerInput', (input: InputState) => {
        const player = this.players.get(socket.id);
        if (player) {
          player.setInput(input);
        }
      });

      socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        this.removePlayer(socket.id);
      });
    });
  }

  private addPlayer(socket: ClientSocket): void {
    // Create new player at random position
    const position = randomPosition(
      GAME_CONFIG.ARENA_WIDTH,
      GAME_CONFIG.ARENA_HEIGHT,
      200 // Padding from edges
    );

    const player = new Player(socket.id, position, randomColor());
    this.players.set(socket.id, player);

    console.log(`Player ${socket.id} joined. Total players: ${this.players.size}`);

    // Notify client
    socket.emit('playerJoined', socket.id);

    // Check if we should start the match
    if (!this.isMatchActive && this.players.size >= 2) {
      this.startMatch();
    }
  }

  private removePlayer(playerId: string): void {
    this.players.delete(playerId);
    this.io.emit('playerLeft', playerId);
  }

  private startMatch(): void {
    console.log('Match starting!');
    this.isMatchActive = true;
    this.matchStartTime = Date.now();
    this.matchEndTime = this.matchStartTime + GAME_CONFIG.MATCH_DURATION;
    this.hasMatchEnded = false;

    // Spawn initial fuel pickups
    this.fuelPickupManager.spawnInitialPickups();

    // Notify all clients
    this.io.emit('matchStart', this.matchStartTime);
  }

  private endMatch(): void {
    if (this.hasMatchEnded) return;

    console.log('Match ended!');
    this.hasMatchEnded = true;
    this.isMatchActive = false;

    // Calculate rankings
    const rankings = Array.from(this.players.values())
      .map((player) => ({
        id: player.getId(),
        distance: player.getState().distance,
      }))
      .sort((a, b) => b.distance - a.distance)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
      }));

    const results: MatchResults = {
      winner: rankings[0] || { id: 'none', distance: 0 },
      rankings,
    };

    // Notify all clients
    this.io.emit('matchEnd', results);

    console.log('Winner:', results.winner);
  }

  private startGameLoop(): void {
    const tickRate = 1000 / GAME_CONFIG.TICK_RATE; // 60 FPS = ~16.67ms per tick

    this.gameLoopInterval = setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
      this.lastUpdateTime = now;

      this.update(deltaTime);
      this.broadcastGameState();
    }, tickRate);

    console.log(`Game loop started at ${GAME_CONFIG.TICK_RATE} ticks/second`);
  }

  private update(deltaTime: number): void {
    // Check if match should end
    if (this.isMatchActive && Date.now() >= this.matchEndTime) {
      this.endMatch();
      return;
    }

    // Update all players
    this.players.forEach((player) => {
      player.update(deltaTime, this.isMatchActive);

      // Keep player in bounds
      const pos = player.getState().position;
      if (
        pos.x < 0 ||
        pos.x > GAME_CONFIG.ARENA_WIDTH ||
        pos.y < 0 ||
        pos.y > GAME_CONFIG.ARENA_HEIGHT
      ) {
        player.constrainToBounds(GAME_CONFIG.ARENA_WIDTH, GAME_CONFIG.ARENA_HEIGHT);
      }
    });

    // Check collisions between players
    this.checkPlayerCollisions();

    // Check fuel pickup collections
    this.checkFuelPickupCollisions();

    // Update fuel pickups
    if (this.isMatchActive) {
      this.fuelPickupManager.update(deltaTime);
    }
  }

  private checkPlayerCollisions(): void {
    const playerArray = Array.from(this.players.values());

    for (let i = 0; i < playerArray.length; i++) {
      for (let j = i + 1; j < playerArray.length; j++) {
        const player1 = playerArray[i];
        const player2 = playerArray[j];

        if (player1.checkCollision(player2)) {
          // Ram mechanic - faster player steals fuel
          const speed1 = player1.getSpeed();
          const speed2 = player2.getSpeed();

          if (speed1 > speed2) {
            player1.stealFuel(player2);
          } else if (speed2 > speed1) {
            player2.stealFuel(player1);
          }

          // Bounce players apart
          player1.bounceAway(player2);
        }
      }
    }
  }

  private checkFuelPickupCollisions(): void {
    this.players.forEach((player) => {
      const collected = this.fuelPickupManager.checkCollision(player.getState().position);
      if (collected) {
        player.addFuel(collected.amount);
        console.log(`Player ${player.getId()} collected fuel: +${collected.amount}`);
      }
    });
  }

  private broadcastGameState(): void {
    const state: GameState = {
      players: Object.fromEntries(
        Array.from(this.players.entries()).map(([id, player]) => [id, player.getState()])
      ),
      fuelPickups: this.fuelPickupManager.getPickups(),
      matchStartTime: this.matchStartTime,
      matchEndTime: this.matchEndTime,
      isMatchActive: this.isMatchActive,
    };

    this.io.emit('gameState', state);
  }

  public getPlayerCount(): number {
    return this.players.size;
  }
}
