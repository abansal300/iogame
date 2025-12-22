# Fuel.io - Multiplayer Survival Racing Game MVP

A real-time multiplayer game built with TypeScript, Socket.IO, HTML5 Canvas, and Node.js. Players compete in a fuel-management racing game where strategy and aggression determine the winner.

## 🎮 Game Concept

Fuel.io is a competitive multiplayer arena game where players must balance speed, fuel conservation, and combat:
- Start with limited fuel
- Fuel depletes faster when driving fast
- Ram other players to steal their fuel
- Collect fuel pickups scattered across the arena
- Run out of fuel? Enter "crawl mode" at reduced speed
- Winner: Player who travels the furthest distance in 3 minutes

## 🏗️ Architecture

### Monorepo Structure
```
fuel-io/
├── client/          # Vite + TypeScript frontend
├── server/          # Express + Socket.IO backend
├── shared/          # Shared types and utilities
└── package.json     # Workspace configuration
```

### Tech Stack

**Frontend:**
- **Vite** - Ultra-fast build tool with HMR
- **TypeScript** - Type-safe JavaScript
- **HTML5 Canvas** - 2D rendering
- **Socket.IO Client** - Real-time WebSocket communication

**Backend:**
- **Node.js** - JavaScript runtime
- **Express** - HTTP server
- **Socket.IO** - WebSocket server with auto-reconnection
- **TypeScript** - Shared type definitions

**Key Patterns:**
- **Authoritative Server** - All game logic runs on server to prevent cheating
- **Client-Side Rendering** - Smooth 60 FPS canvas rendering
- **State Synchronization** - Server broadcasts game state 60 times/second
- **Monorepo** - Shared code between client/server

## 🎯 Key Features Implemented

### Phase 1: Infrastructure ✅
- Monorepo setup with npm workspaces
- TypeScript configuration for client & server
- Vite development environment
- Express + Socket.IO server
- WebSocket connection handling

### Phase 2: Client Rendering ✅
- HTML5 Canvas rendering system
- Car entities with visual representation
- Keyboard input handling (WASD/Arrow keys)
- Camera system that follows player
- Grid and arena bounds visualization

### Phase 3: Multiplayer Networking ✅
- Authoritative game loop (60 tick rate)
- Server-side car physics (acceleration, rotation, friction)
- Real-time state synchronization
- Player join/leave handling
- Match start/end logic

### Phase 4: Core Gameplay ✅
- **Fuel System:** Depletes based on speed
- **Collision Detection:** Circle-based collision between cars
- **Ram Mechanics:** Steal 15% of victim's fuel on collision
- **Fuel Pickups:** Spawn randomly across arena
- **Distance Tracking:** Measures total travel distance
- **Crawl Mode:** Reduced speed when out of fuel

### Phase 5: UI & Polish ✅
- **HUD:** Real-time fuel gauge, distance counter, player count, match timer
- **Minimap:** Shows player positions and fuel pickups
- **Waiting Screen:** Pre-match lobby
- **Game Over Screen:** Final rankings and winner announcement
- **Visual Effects:** Fuel bars on cars, glowing pickups, pulsing animations

## 🔧 Technical Highlights for Interviews

### 1. Real-Time Multiplayer Architecture
**Challenge:** How do you prevent cheating in a multiplayer game?

**Solution:** Implemented an **authoritative server** pattern where:
- Client only sends inputs (keyboard presses)
- Server runs all game logic and physics
- Server broadcasts authoritative game state
- Client renders what server tells it

This prevents speed hacks, teleportation, and fuel cheats.

### 2. Network Optimization
**Challenge:** How do you keep a real-time game smooth with network latency?

**Solution:**
- Server runs at fixed 60 tick rate for consistent physics
- State updates broadcast 60 times/second
- Socket.IO handles automatic reconnection and transport fallbacks
- Efficient state serialization (only changed data)

### 3. Game Loop Design
**Challenge:** How do you ensure consistent physics across different frame rates?

**Solution:**
```typescript
// Delta time calculation for frame-rate independent physics
const deltaTime = (now - lastUpdateTime) / 1000; // Convert to seconds
player.update(deltaTime); // Movement scaled by time elapsed
```

This ensures game runs identically on 60Hz and 144Hz monitors.

### 4. Type Safety Across Network Boundary
**Challenge:** How do you ensure client and server speak the same language?

**Solution:** Shared TypeScript types in monorepo:
```typescript
// shared/src/types.ts
export interface GameState {
  players: Record<string, PlayerState>;
  fuelPickups: FuelPickup[];
  // ... strongly typed for both client and server
}
```

Compile-time type checking prevents bugs from API mismatches.

### 5. Canvas Rendering Performance
**Challenge:** How do you render 60 FPS with multiple entities?

**Solution:**
- Camera transformation (only draw visible area)
- Efficient clear/draw cycle
- Minimized canvas state changes
- Sprite batching for multiple cars

### 6. Collision Detection
**Challenge:** How do you detect collisions between cars?

**Solution:** Simple circle-circle collision:
```typescript
function circleCollision(pos1, radius1, pos2, radius2) {
  const dist = distance(pos1, pos2);
  return dist < radius1 + radius2;
}
```

Fast O(n²) for small player counts. Could optimize to spatial partitioning for 100+ players.

## 📊 System Design Decisions

### Why Socket.IO over plain WebSockets?
- Auto-reconnection handling
- Fallback transports (WebSocket → long-polling)
- Room support for multiple game instances
- Built-in heartbeat/ping mechanism

### Why Canvas over WebGL/Three.js?
- Simpler 2D rendering API
- Better browser compatibility
- Lower learning curve
- Sufficient performance for top-down 2D game

### Why Monorepo?
- Shared types prevent client/server desync
- Atomic commits across frontend/backend
- Single source of truth for game constants
- Easier refactoring

## 🚀 Running the Game

```bash
# Install dependencies
npm install

# Run both client and server
npm run dev

# Client: http://localhost:3000
# Server: http://localhost:3001
```

## 🎓 Interview Talking Points

1. **Scalability:** "To scale beyond one server, I'd add Redis pub/sub for cross-server communication and use consistent hashing for player-to-server assignment."

2. **Latency:** "Current implementation is server-authoritative. For lower latency, I'd add client-side prediction where the client simulates physics locally and reconciles with server state."

3. **Database:** "For persistence, I'd add PostgreSQL with Prisma ORM to store user accounts, match history, and leaderboards."

4. **Security:** "Server validates all inputs, rate-limits requests, and uses JWT for authentication. All game logic is server-side to prevent tampering."

5. **Monitoring:** "In production, I'd add Sentry for error tracking, Grafana for metrics (player count, tick rate, latency), and structured logging with Winston."

## 📈 Future Enhancements

- Client-side prediction for smoother movement
- Interpolation for other players' movement
- Power-ups and special abilities
- Multiple game modes
- Matchmaking system
- Persistent player accounts
- Leaderboards
- Mobile touch controls
- Sound effects and music

## 🐛 Known Issues & Solutions

### Module Resolution (Development Note)
Current tsx/TypeScript ES modules configuration requires specific import paths. In production, this would be resolved by:
- Compiling TypeScript to JavaScript
- Using a module bundler (Webpack/Rollup)
- Or configuring paths in tsconfig.json

This is a development environment issue, not a game logic issue.

---

**Built with ❤️ as a learning project to demonstrate full-stack TypeScript, real-time networking, and game development skills.**
