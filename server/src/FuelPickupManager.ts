import {
  FuelPickup,
  Vector2D,
  GAME_CONFIG,
  randomPosition,
  distance,
} from './shared-imports.js';

export class FuelPickupManager {
  private pickups: FuelPickup[] = [];
  private nextPickupId: number = 0;
  private timeSinceLastSpawn: number = 0;

  public spawnInitialPickups(): void {
    // Spawn initial fuel pickups
    for (let i = 0; i < GAME_CONFIG.MAX_FUEL_PICKUPS; i++) {
      this.spawnPickup();
    }
    console.log(`Spawned ${GAME_CONFIG.MAX_FUEL_PICKUPS} initial fuel pickups`);
  }

  public update(deltaTime: number): void {
    this.timeSinceLastSpawn += deltaTime * 1000; // Convert to milliseconds

    // Spawn new pickups periodically
    if (
      this.timeSinceLastSpawn >= GAME_CONFIG.FUEL_PICKUP_SPAWN_INTERVAL &&
      this.getActivePickupCount() < GAME_CONFIG.MAX_FUEL_PICKUPS
    ) {
      this.spawnPickup();
      this.timeSinceLastSpawn = 0;
    }
  }

  private spawnPickup(): void {
    const position = randomPosition(
      GAME_CONFIG.ARENA_WIDTH,
      GAME_CONFIG.ARENA_HEIGHT,
      100 // Padding from edges
    );

    const pickup: FuelPickup = {
      id: `fuel-${this.nextPickupId++}`,
      position,
      amount: GAME_CONFIG.FUEL_PICKUP_AMOUNT,
      active: true,
    };

    this.pickups.push(pickup);
  }

  public checkCollision(playerPosition: Vector2D): FuelPickup | null {
    const collectionRadius = 50; // How close player needs to be

    for (const pickup of this.pickups) {
      if (!pickup.active) continue;

      const dist = distance(playerPosition, pickup.position);
      if (dist < collectionRadius) {
        pickup.active = false;
        return pickup;
      }
    }

    return null;
  }

  private getActivePickupCount(): number {
    return this.pickups.filter((p) => p.active).length;
  }

  public getPickups(): FuelPickup[] {
    return this.pickups;
  }
}
