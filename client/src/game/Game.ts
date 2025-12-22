import { GameState, PlayerState } from '@shared/types';
import { Renderer } from './Renderer';
import { InputManager } from './InputManager';
import { NetworkManager } from '../network/NetworkManager';
import { HUD } from '../ui/HUD';

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private inputManager: InputManager;
  private networkManager: NetworkManager;
  private hud: HUD;

  private gameState: GameState | null = null;
  private myPlayerId: string | null = null;
  private lastUpdateTime: number = 0;
  private animationFrameId: number | null = null;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }

    // Initialize subsystems
    this.renderer = new Renderer(this.canvas);
    this.inputManager = new InputManager();
    this.hud = new HUD();
    this.networkManager = new NetworkManager();

    // Set up event listeners
    this.setupNetworkListeners();
    this.handleResize();
  }

  private setupNetworkListeners(): void {
    // Handle game state updates from server
    this.networkManager.on('gameState', (state: GameState) => {
      this.gameState = state;
      this.hud.updatePlayerCount(Object.keys(state.players).length);
      this.hud.updateMatchTime(state.matchStartTime, state.matchEndTime);
    });

    // Handle player joined
    this.networkManager.on('playerJoined', (playerId: string) => {
      if (!this.myPlayerId) {
        this.myPlayerId = playerId;
        console.log('Joined game as player:', playerId);
      }
    });

    // Handle connection status
    this.networkManager.on('connect', () => {
      this.hud.setConnectionStatus(true);
    });

    this.networkManager.on('disconnect', () => {
      this.hud.setConnectionStatus(false);
    });

    // Handle match start
    this.networkManager.on('matchStart', () => {
      this.hud.hideWaitingScreen();
    });

    // Handle match end
    this.networkManager.on('matchEnd', (results) => {
      this.hud.showGameOver(results);
    });
  }

  public start(): void {
    console.log('Game starting...');

    // Connect to server
    this.networkManager.connect();

    // Request to join game
    this.networkManager.joinGame();

    // Start game loop
    this.lastUpdateTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    const now = performance.now();
    const deltaTime = (now - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = now;

    // Update
    this.update(deltaTime);

    // Render
    this.render();

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Send input to server
    const input = this.inputManager.getInputState();
    this.networkManager.sendInput(input);

    // Update HUD with my player's data
    if (this.gameState && this.myPlayerId) {
      const myPlayer = this.gameState.players[this.myPlayerId];
      if (myPlayer) {
        this.hud.updateFuel(myPlayer.fuel);
        this.hud.updateDistance(myPlayer.distance);
      }
    }
  }

  private render(): void {
    if (!this.gameState || !this.myPlayerId) {
      this.renderer.clear();
      return;
    }

    const myPlayer = this.gameState.players[this.myPlayerId];
    this.renderer.render(this.gameState, myPlayer);
  }

  public handleResize(): void {
    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.9;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.networkManager.disconnect();
  }
}
