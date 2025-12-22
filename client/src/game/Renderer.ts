import { GameState, PlayerState, FuelPickup, GAME_CONFIG } from '@shared/types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private cameraX: number = 0;
  private cameraY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;
  }

  public clear(): void {
    this.ctx.fillStyle = '#2d2d2d';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public render(gameState: GameState, myPlayer: PlayerState | undefined): void {
    // Clear canvas
    this.clear();

    // Update camera to follow player
    if (myPlayer) {
      this.cameraX = myPlayer.position.x - this.canvas.width / 2;
      this.cameraY = myPlayer.position.y - this.canvas.height / 2;
    }

    // Save context state
    this.ctx.save();

    // Apply camera transform
    this.ctx.translate(-this.cameraX, -this.cameraY);

    // Draw arena bounds
    this.drawArenaBounds();

    // Draw grid for reference
    this.drawGrid();

    // Draw fuel pickups
    gameState.fuelPickups.forEach((pickup) => {
      if (pickup.active) {
        this.drawFuelPickup(pickup);
      }
    });

    // Draw all players
    Object.values(gameState.players).forEach((player) => {
      this.drawPlayer(player, player.id === myPlayer?.id);
    });

    // Restore context state
    this.ctx.restore();

    // Draw minimap (in screen space)
    if (myPlayer) {
      this.drawMinimap(gameState, myPlayer);
    }
  }

  private drawArenaBounds(): void {
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 5;
    this.ctx.strokeRect(0, 0, GAME_CONFIG.ARENA_WIDTH, GAME_CONFIG.ARENA_HEIGHT);

    // Draw corner markers
    this.ctx.fillStyle = '#4ECDC4';
    const markerSize = 50;
    this.ctx.fillRect(0, 0, markerSize, markerSize);
    this.ctx.fillRect(GAME_CONFIG.ARENA_WIDTH - markerSize, 0, markerSize, markerSize);
    this.ctx.fillRect(0, GAME_CONFIG.ARENA_HEIGHT - markerSize, markerSize, markerSize);
    this.ctx.fillRect(
      GAME_CONFIG.ARENA_WIDTH - markerSize,
      GAME_CONFIG.ARENA_HEIGHT - markerSize,
      markerSize,
      markerSize
    );
  }

  private drawGrid(): void {
    const gridSize = 200;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= GAME_CONFIG.ARENA_WIDTH; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, GAME_CONFIG.ARENA_HEIGHT);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= GAME_CONFIG.ARENA_HEIGHT; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(GAME_CONFIG.ARENA_WIDTH, y);
      this.ctx.stroke();
    }
  }

  private drawPlayer(player: PlayerState, isMe: boolean): void {
    const { position, rotation, color, fuel } = player;

    this.ctx.save();
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(rotation);

    // Draw car body
    const carWidth = GAME_CONFIG.CAR_WIDTH;
    const carHeight = GAME_CONFIG.CAR_HEIGHT;

    // Shadow
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(-carWidth / 2 + 3, -carHeight / 2 + 3, carWidth, carHeight);

    // Main body
    this.ctx.fillStyle = color;
    this.ctx.fillRect(-carWidth / 2, -carHeight / 2, carWidth, carHeight);

    // Highlight if it's my car
    if (isMe) {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(-carWidth / 2, -carHeight / 2, carWidth, carHeight);
    }

    // Draw front indicator (triangle)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.moveTo(0, -carHeight / 2 - 10);
    this.ctx.lineTo(-8, -carHeight / 2);
    this.ctx.lineTo(8, -carHeight / 2);
    this.ctx.closePath();
    this.ctx.fill();

    // Draw fuel indicator on car
    const fuelBarWidth = carWidth * 0.8;
    const fuelBarHeight = 4;
    const fuelPercent = fuel / GAME_CONFIG.MAX_FUEL;

    // Background
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(
      -fuelBarWidth / 2,
      carHeight / 2 + 5,
      fuelBarWidth,
      fuelBarHeight
    );

    // Fuel level
    const fuelColor = fuelPercent > 0.3 ? '#2ecc71' : '#e74c3c';
    this.ctx.fillStyle = fuelColor;
    this.ctx.fillRect(
      -fuelBarWidth / 2,
      carHeight / 2 + 5,
      fuelBarWidth * fuelPercent,
      fuelBarHeight
    );

    this.ctx.restore();

    // Draw player name/ID above car (in world space)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      isMe ? 'YOU' : player.id.substring(0, 8),
      position.x,
      position.y - carHeight / 2 - 15
    );
  }

  private drawFuelPickup(pickup: FuelPickup): void {
    const { position } = pickup;
    const size = 25;

    // Pulsing glow effect
    const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
    const glowSize = size * (1 + pulse * 0.5);

    // Glow
    const gradient = this.ctx.createRadialGradient(
      position.x,
      position.y,
      0,
      position.x,
      position.y,
      glowSize
    );
    gradient.addColorStop(0, 'rgba(241, 196, 15, 0.8)');
    gradient.addColorStop(1, 'rgba(241, 196, 15, 0)');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, glowSize, 0, Math.PI * 2);
    this.ctx.fill();

    // Main pickup
    this.ctx.fillStyle = '#f1c40f';
    this.ctx.beginPath();
    this.ctx.arc(position.x, position.y, size, 0, Math.PI * 2);
    this.ctx.fill();

    // Fuel icon (simplified gas can)
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('⛽', position.x, position.y);
  }

  private drawMinimap(gameState: GameState, myPlayer: PlayerState): void {
    const minimapSize = 200;
    const minimapPadding = 20;
    const minimapX = this.canvas.width - minimapSize - minimapPadding;
    const minimapY = this.canvas.height - minimapSize - minimapPadding;

    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);

    // Border
    this.ctx.strokeStyle = '#4ECDC4';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

    // Scale factor
    const scaleX = minimapSize / GAME_CONFIG.ARENA_WIDTH;
    const scaleY = minimapSize / GAME_CONFIG.ARENA_HEIGHT;

    // Draw fuel pickups
    gameState.fuelPickups.forEach((pickup) => {
      if (pickup.active) {
        const x = minimapX + pickup.position.x * scaleX;
        const y = minimapY + pickup.position.y * scaleY;

        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });

    // Draw players
    Object.values(gameState.players).forEach((player) => {
      const x = minimapX + player.position.x * scaleX;
      const y = minimapY + player.position.y * scaleY;

      this.ctx.fillStyle = player.id === myPlayer.id ? '#ffffff' : player.color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, player.id === myPlayer.id ? 5 : 3, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}
