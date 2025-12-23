import {
  PlayerState,
  InputState,
  Vector2D,
  GAME_CONFIG,
  magnitude,
  clamp,
  distance,
} from './shared-imports.js';

export class Player {
  private state: PlayerState;
  private currentInput: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    timestamp: 0,
  };

  constructor(id: string, position: Vector2D, color: string) {
    this.state = {
      id,
      position,
      velocity: { x: 0, y: 0 },
      rotation: 0,
      fuel: GAME_CONFIG.INITIAL_FUEL,
      distance: 0,
      isAlive: true,
      lastRamTime: 0,
      color,
      speed: 0,
      speedBoostCount: 0, // Start with no speed boosts
    };
  }

  public setInput(input: InputState): void {
    this.currentInput = input;
  }

  public update(deltaTime: number, isMatchActive: boolean): void {
    if (!this.state.isAlive || !isMatchActive) return;

    // Update rotation based on input
    if (this.currentInput.left) {
      this.state.rotation -= GAME_CONFIG.ROTATION_SPEED * deltaTime;
    }
    if (this.currentInput.right) {
      this.state.rotation += GAME_CONFIG.ROTATION_SPEED * deltaTime;
    }

    // Calculate forward direction
    const forwardX = Math.sin(this.state.rotation);
    const forwardY = -Math.cos(this.state.rotation);

    // Apply acceleration/braking
    const hasFuel = this.state.fuel > 0;
    const effectiveAcceleration = hasFuel
      ? GAME_CONFIG.ACCELERATION
      : GAME_CONFIG.ACCELERATION * 0.1; // Much slower when out of fuel

    if (this.currentInput.up) {
      this.state.velocity.x += forwardX * effectiveAcceleration * deltaTime;
      this.state.velocity.y += forwardY * effectiveAcceleration * deltaTime;
    }

    if (this.currentInput.down) {
      // Reverse/brake
      this.state.velocity.x -= forwardX * effectiveAcceleration * 0.5 * deltaTime;
      this.state.velocity.y -= forwardY * effectiveAcceleration * 0.5 * deltaTime;
    }

    // Apply friction
    this.state.velocity.x *= GAME_CONFIG.FRICTION;
    this.state.velocity.y *= GAME_CONFIG.FRICTION;

    // Calculate max speed based on fuel level and speed boosts collected
    const currentSpeed = magnitude(this.state.velocity);
    this.state.speed = currentSpeed; // Track current speed

    // Fuel-based max speed: more fuel = higher max speed
    let fuelBasedMaxSpeed = GAME_CONFIG.MAX_SPEED;
    if (hasFuel) {
      const fuelPercent = this.state.fuel / GAME_CONFIG.MAX_FUEL;
      // Interpolate between MIN_SPEED and MAX_SPEED based on fuel
      fuelBasedMaxSpeed = GAME_CONFIG.MIN_SPEED_AT_LOW_FUEL +
        (GAME_CONFIG.MAX_SPEED - GAME_CONFIG.MIN_SPEED_AT_LOW_FUEL) * fuelPercent;
    } else {
      fuelBasedMaxSpeed = GAME_CONFIG.CRAWL_SPEED;
    }

    // Add speed from collected boosts (additive, not multiplicative)
    const speedBoostBonus = this.state.speedBoostCount * GAME_CONFIG.SPEED_BOOST_AMOUNT;
    let maxSpeed = fuelBasedMaxSpeed + speedBoostBonus;

    // Apply absolute max speed cap
    maxSpeed = Math.min(maxSpeed, GAME_CONFIG.ABSOLUTE_MAX_SPEED);

    if (currentSpeed > maxSpeed) {
      const ratio = maxSpeed / currentSpeed;
      this.state.velocity.x *= ratio;
      this.state.velocity.y *= ratio;
    }

    // Update position
    const oldX = this.state.position.x;
    const oldY = this.state.position.y;

    this.state.position.x += this.state.velocity.x * deltaTime;
    this.state.position.y += this.state.velocity.y * deltaTime;

    // Track distance traveled
    const dx = this.state.position.x - oldX;
    const dy = this.state.position.y - oldY;
    const distanceMoved = Math.sqrt(dx * dx + dy * dy);
    this.state.distance += distanceMoved;

    // Deplete fuel based on speed (more speed = more fuel consumption)
    if (this.state.fuel > 0) {
      const speedFactor = currentSpeed / GAME_CONFIG.MAX_SPEED;
      const fuelCost =
        (GAME_CONFIG.FUEL_DEPLETION_RATE +
          speedFactor * GAME_CONFIG.SPEED_FUEL_MULTIPLIER * 100) *
        deltaTime;

      this.state.fuel = Math.max(0, this.state.fuel - fuelCost);
    }
  }

  public checkCollision(other: Player): boolean {
    const dist = distance(this.state.position, other.state.position);
    const collisionRadius = Math.max(GAME_CONFIG.CAR_WIDTH, GAME_CONFIG.CAR_HEIGHT);
    return dist < collisionRadius;
  }

  public stealFuel(victim: Player): void {
    const now = Date.now();

    // Check ram cooldown
    if (now - this.state.lastRamTime < GAME_CONFIG.RAM_COOLDOWN) {
      return;
    }

    const victimState = victim.getState();
    const stolenAmount = victimState.fuel * GAME_CONFIG.RAM_FUEL_STEAL_PERCENT;

    // Steal fuel
    victim.removeFuel(stolenAmount);
    this.addFuel(stolenAmount);

    this.state.lastRamTime = now;

    console.log(
      `Player ${this.state.id} rammed ${victimState.id} and stole ${stolenAmount.toFixed(1)} fuel`
    );
  }

  public bounceAway(other: Player): void {
    // Simple elastic collision - bounce players away from each other
    const dx = this.state.position.x - other.state.position.x;
    const dy = this.state.position.y - other.state.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return;

    // Normalize
    const nx = dx / dist;
    const ny = dy / dist;

    // Separate players
    const overlap = Math.max(GAME_CONFIG.CAR_WIDTH, GAME_CONFIG.CAR_HEIGHT) - dist;
    if (overlap > 0) {
      this.state.position.x += nx * overlap * 0.5;
      this.state.position.y += ny * overlap * 0.5;
      other.state.position.x -= nx * overlap * 0.5;
      other.state.position.y -= ny * overlap * 0.5;
    }

    // Bounce velocity
    const relativeVelocityX = this.state.velocity.x - other.state.velocity.x;
    const relativeVelocityY = this.state.velocity.y - other.state.velocity.y;
    const dotProduct = relativeVelocityX * nx + relativeVelocityY * ny;

    if (dotProduct < 0) {
      // Bounce
      const bounceStrength = 0.5;
      this.state.velocity.x -= dotProduct * nx * bounceStrength;
      this.state.velocity.y -= dotProduct * ny * bounceStrength;
      other.state.velocity.x += dotProduct * nx * bounceStrength;
      other.state.velocity.y += dotProduct * ny * bounceStrength;
    }
  }

  public addFuel(amount: number): void {
    this.state.fuel = Math.min(GAME_CONFIG.MAX_FUEL, this.state.fuel + amount);
  }

  public removeFuel(amount: number): void {
    this.state.fuel = Math.max(0, this.state.fuel - amount);
  }

  public constrainToBounds(width: number, height: number): void {
    // Bounce off walls
    if (this.state.position.x < 0) {
      this.state.position.x = 0;
      this.state.velocity.x = Math.abs(this.state.velocity.x) * 0.5;
    } else if (this.state.position.x > width) {
      this.state.position.x = width;
      this.state.velocity.x = -Math.abs(this.state.velocity.x) * 0.5;
    }

    if (this.state.position.y < 0) {
      this.state.position.y = 0;
      this.state.velocity.y = Math.abs(this.state.velocity.y) * 0.5;
    } else if (this.state.position.y > height) {
      this.state.position.y = height;
      this.state.velocity.y = -Math.abs(this.state.velocity.y) * 0.5;
    }
  }

  public getSpeed(): number {
    return magnitude(this.state.velocity);
  }

  public getState(): PlayerState {
    return this.state;
  }

  public activateSpeedBoost(): void {
    this.state.speedBoostCount++;
    console.log(`Player ${this.state.id} collected speed boost! Total: ${this.state.speedBoostCount}`);
  }

  public getId(): string {
    return this.state.id;
  }
}
