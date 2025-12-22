import {
  SpeedBoost,
  Vector2D,
  GAME_CONFIG,
  randomPosition,
  distance,
} from './shared-imports.js';

export class SpeedBoostManager {
  private boosts: SpeedBoost[] = [];
  private nextBoostId: number = 0;
  private timeSinceLastSpawn: number = 0;

  public spawnInitialBoosts(): void {
    // Spawn initial speed boosts
    for (let i = 0; i < GAME_CONFIG.MAX_SPEED_BOOSTS; i++) {
      this.spawnBoost();
    }
    console.log(`Spawned ${GAME_CONFIG.MAX_SPEED_BOOSTS} initial speed boosts`);
  }

  public update(deltaTime: number): void {
    this.timeSinceLastSpawn += deltaTime * 1000; // Convert to milliseconds

    // Spawn new boosts periodically
    if (
      this.timeSinceLastSpawn >= GAME_CONFIG.SPEED_BOOST_SPAWN_INTERVAL &&
      this.getActiveBoostCount() < GAME_CONFIG.MAX_SPEED_BOOSTS
    ) {
      this.spawnBoost();
      this.timeSinceLastSpawn = 0;
    }
  }

  private spawnBoost(): void {
    const position = randomPosition(
      GAME_CONFIG.ARENA_WIDTH,
      GAME_CONFIG.ARENA_HEIGHT,
      100 // Padding from edges
    );

    const boost: SpeedBoost = {
      id: `speed-${this.nextBoostId++}`,
      position,
      active: true,
    };

    this.boosts.push(boost);
  }

  public checkCollision(playerPosition: Vector2D): SpeedBoost | null {
    const collectionRadius = 50; // How close player needs to be

    for (const boost of this.boosts) {
      if (!boost.active) continue;

      const dist = distance(playerPosition, boost.position);
      if (dist < collectionRadius) {
        boost.active = false;
        return boost;
      }
    }

    return null;
  }

  private getActiveBoostCount(): number {
    return this.boosts.filter((b) => b.active).length;
  }

  public getBoosts(): SpeedBoost[] {
    return this.boosts;
  }
}
