import { io, Socket } from 'socket.io-client';
import {
  InputState,
  GameState,
  MatchResults,
  ServerToClientEvents,
  ClientToServerEvents,
} from '@shared/types';

type EventCallback = (...args: any[]) => void;

export class NetworkManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private eventHandlers: Map<string, EventCallback[]> = new Map();

  public connect(): void {
    // Connect to server (use environment variable in production)
    const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
    });

    // Set up socket event listeners
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.emit('connect');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.emit('disconnect');
    });

    this.socket.on('gameState', (state: GameState) => {
      this.emit('gameState', state);
    });

    this.socket.on('playerJoined', (playerId: string) => {
      this.emit('playerJoined', playerId);
    });

    this.socket.on('playerLeft', (playerId: string) => {
      this.emit('playerLeft', playerId);
    });

    this.socket.on('matchStart', (startTime: number) => {
      this.emit('matchStart', startTime);
    });

    this.socket.on('matchEnd', (results: MatchResults) => {
      this.emit('matchEnd', results);
    });

    this.socket.on('error', (message: string) => {
      console.error('Server error:', message);
      this.emit('error', message);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinGame(playerName?: string): void {
    if (this.socket) {
      this.socket.emit('requestJoinGame', playerName);
    }
  }

  public sendInput(input: InputState): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('playerInput', input);
    }
  }

  // Event emitter pattern for internal events
  public on(event: string, callback: EventCallback): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  private emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
    }
  }
}
