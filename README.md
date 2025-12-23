# ⚡ Fuel.io - Multiplayer Survival Racing Game

> A real-time multiplayer arena racing game where fuel management, speed boosts, and strategic ramming determine the winner.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black.svg)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎮 Game Overview

**Fuel.io** is a competitive multiplayer browser game where players race in a top-down arena, collecting fuel and speed boosts while battling opponents. The goal is simple: **travel the furthest distance in 3 minutes**.

### Core Mechanics

- 🏎️ **Speed Progression:** Start at 700 km/h, collect ⚡ boosts to permanently increase max speed (+100 km/h each, cap at 2500 km/h)
- ⛽ **Fuel Management:** Fuel depletes faster at high speeds - balance aggression with survival
- 💥 **Ramming Combat:** Collide with slower players to steal 15% of their fuel
- 🎯 **Strategic Pickups:** Fuel canisters and speed boosts spawn across the arena
- ⏱️ **3-Minute Matches:** Winner is determined by total distance traveled

---

## 🚀 Live Demo

**Play Now:** [Fuel.io on Render](https://your-app.onrender.com) *(replace with your actual URL)*

> **Note:** First load may take 30-60 seconds (free tier cold start). Need 2+ players to start a match.

---

## 📸 Screenshots

<!-- TODO: Add screenshots -->
```
[Main Game View]  [Speed Boost Pickup]  [Match End Screen]
```

---

## 🛠️ Tech Stack

### Frontend
- **Vite** - Lightning-fast build tool with Hot Module Replacement
- **TypeScript** - Type-safe JavaScript for robust client code
- **HTML5 Canvas API** - 2D rendering engine (60 FPS)
- **Socket.IO Client** - Real-time WebSocket communication

### Backend
- **Node.js 24.x** - JavaScript runtime
- **Express.js** - Minimal web server framework
- **Socket.IO** - Real-time bidirectional event-based communication
- **TypeScript** - Type-safe server implementation
- **tsx** - TypeScript execution engine (replaces ts-node)

### Architecture
- **Monorepo** - npm workspaces for shared code between client/server
- **Authoritative Server** - All game logic server-side to prevent cheating
- **60 Hz Tick Rate** - Consistent physics and state synchronization
- **Type-Safe Networking** - Shared TypeScript interfaces across network boundary

---

## 🏗️ Project Structure

```
iogame-1/
├── client/                    # Frontend application
│   ├── src/
│   │   ├── game/             # Game logic
│   │   │   ├── Game.ts       # Main game controller
│   │   │   ├── Renderer.ts   # Canvas rendering
│   │   │   └── InputManager.ts
│   │   ├── network/
│   │   │   └── NetworkManager.ts  # Socket.IO client
│   │   ├── ui/
│   │   │   └── HUD.ts        # Heads-up display
│   │   └── main.ts
│   ├── index.html
│   └── dist/                 # Production build
│
├── server/                    # Backend application
│   └── src/
│       ├── GameServer.ts     # Main game loop (60 Hz)
│       ├── Player.ts         # Player physics & state
│       ├── FuelPickupManager.ts
│       ├── SpeedBoostManager.ts
│       ├── shared-imports.ts # Module resolution workaround
│       └── index.ts          # Express + Socket.IO server
│
├── shared/                    # Shared types & utilities
│   └── src/
│       ├── types.ts          # Game config, interfaces
│       └── utils.ts          # Shared utility functions
│
└── package.json              # npm workspaces root
```

---

## 🎯 Features

### ✅ Implemented

#### Multiplayer Infrastructure
- [x] Real-time WebSocket communication (Socket.IO)
- [x] Authoritative server pattern (anti-cheat)
- [x] Player join/leave handling
- [x] Connection status indicators
- [x] Automatic reconnection

#### Game Physics
- [x] Delta-time physics (frame-rate independent)
- [x] Acceleration, friction, rotation
- [x] Fuel-based max speed scaling
- [x] Speed boost progression system
- [x] Boundary collision with bounce
- [x] Player-to-player collision

#### Fuel System
- [x] Speed-based fuel depletion (2.5/s base + speed multiplier)
- [x] 15 fuel pickups on map (respawn every 5s)
- [x] Fuel stealing via ramming (15% of victim's fuel)
- [x] Low fuel warning (crawl mode at 0 fuel)

#### Speed Boost System
- [x] Permanent additive boosts (+100 km/h each)
- [x] Visual feedback (⚡ blue lightning with glow)
- [x] Boost counter in HUD
- [x] Hard cap at 2500 km/h

#### Match System
- [x] 3-minute timed matches
- [x] Waiting lobby (2+ players to start)
- [x] Distance-based winner determination
- [x] Post-match rankings screen

#### Rendering & UI
- [x] 60 FPS Canvas rendering
- [x] Camera following player
- [x] Minimap with entities
- [x] Real-time HUD (speed, boosts, fuel, distance, time)
- [x] Visual effects (glow, pulse, rotation)
- [x] Grid and arena boundaries

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.x or higher
- **npm** 9.x or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/iogame-1.git
cd iogame-1

# Install all dependencies (client + server + shared)
npm install
```

### Running Locally

```bash
# Start both client and server concurrently
npm run dev

# Client will be available at: http://localhost:3000
# Server will be running on: http://localhost:3001
```

**To test multiplayer:**
1. Open `http://localhost:3000` in two browser windows
2. Both players will join the same lobby
3. Match starts automatically when 2+ players are connected
4. Play for 3 minutes, winner is player with most distance traveled!

---

## 🌐 Deployment

### Deploy to Render.com

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Create Render Web Service:**
   - Connect your GitHub repository
   - **Build Command:** `npm install && npm run build --workspace=server`
   - **Start Command:** `npm start --workspace=server`
   - **Environment:** Node

3. **Auto-Deploy:**
   - Render automatically redeploys on every `git push`
   - Build time: ~2-3 minutes
   - Cold start: ~30 seconds

### Environment Variables (Optional)
```bash
PORT=3001              # Server port (Render sets automatically)
NODE_ENV=production    # Production mode
```

---

## 🎮 Game Mechanics Deep Dive

### Speed System

The game uses a **progressive speed system** where collecting boosts permanently increases your max speed:

```javascript
// Base speed formula
baseMaxSpeed = 700 km/h (full fuel) → 300 km/h (low fuel)

// Speed boost progression (additive)
totalMaxSpeed = baseSpeed + (boostCount × 100 km/h)
totalMaxSpeed = min(totalMaxSpeed, 2500 km/h)  // Hard cap

// Examples:
// 0 boosts → 700 km/h max
// 3 boosts → 1000 km/h max
// 10 boosts → 1700 km/h max
// 18+ boosts → 2500 km/h (capped)
```

### Fuel Depletion

Fuel depletes **5x faster** than early versions, creating intense resource management:

```javascript
fuelCost = BASE_RATE + (currentSpeed / maxSpeed) × SPEED_MULTIPLIER
fuelCost = 2.5 + (speed ratio) × 0.03 × 100 per second

// At max speed with full fuel:
// ~5-7 fuel/second depletion
// Tank lasts ~20-30 seconds at full throttle
```

### Ramming Mechanics

```javascript
// On collision:
if (speed1 > speed2) {
  stolenFuel = victim.fuel × 0.15;  // 15% of victim's fuel
  attacker.fuel += stolenFuel;
  victim.fuel -= stolenFuel;
  applyBouncePhysics();  // Elastic collision
}

// Cooldown: 1 second between rams
```

---

## 🎓 Technical Highlights

### 1. Authoritative Server Pattern

**Problem:** In multiplayer games, players can modify client-side code to cheat (speed hacks, infinite fuel, teleportation).

**Solution:** Server-authoritative architecture:
- Client sends **only inputs** (W, A, S, D key states)
- Server runs **all game logic** (physics, collisions, fuel)
- Server broadcasts **authoritative state** to all clients
- Clients are "dumb terminals" that render what server says

```typescript
// Client sends:
socket.emit('playerInput', { up: true, left: false, ... });

// Server processes:
player.update(deltaTime);  // Physics, fuel, collisions
broadcastGameState();      // Send truth to all clients

// Client receives and renders:
socket.on('gameState', (state) => renderer.render(state));
```

### 2. Fixed Tick Rate Game Loop

**Problem:** Variable frame rates cause inconsistent physics (faster computers = faster cars).

**Solution:** Server runs at **fixed 60 Hz**, client renders as fast as possible:

```typescript
// Server: Fixed tick rate
setInterval(() => {
  const deltaTime = 1000 / 60 / 1000;  // 16.67ms in seconds
  updateGameState(deltaTime);
  broadcastState();
}, 1000 / 60);

// Client: Delta-time rendering
function gameLoop() {
  const deltaTime = (now - lastFrame) / 1000;
  render(interpolatedState);
  requestAnimationFrame(gameLoop);
}
```

### 3. Type-Safe Networking

**Problem:** Client and server can drift out of sync if types don't match.

**Solution:** Shared TypeScript interfaces in monorepo:

```typescript
// shared/src/types.ts
export interface GameState {
  players: Record<string, PlayerState>;
  fuelPickups: FuelPickup[];
  speedBoosts: SpeedBoost[];
  matchStartTime: number;
  matchEndTime: number;
  isMatchActive: boolean;
}

// Both client and server import the same types
// Compile-time errors if mismatch!
```

### 4. Friction-Based Physics Tuning

**Challenge:** Initial friction (0.88) created terminal velocity of ~56 units/s, preventing cars from reaching max speed.

**Solution:** Reduced friction to 0.96 (4% loss per frame) to allow higher speeds:

```typescript
// Terminal velocity calculation:
// At equilibrium: acceleration = friction_loss
// ACCELERATION × Δt = velocity × (1 - FRICTION)
// 1200 × 0.0167 = velocity × 0.04
// velocity ≈ 500 units/s (achievable)

// Before (0.88 friction): terminal velocity ~56 units/s
// After (0.96 friction): terminal velocity ~500 units/s
```

### 5. Collision Detection Optimization

**Current:** O(n²) brute-force collision check (fine for <10 players)

```typescript
for (let i = 0; i < players.length; i++) {
  for (let j = i + 1; j < players.length; j++) {
    if (circleCollision(players[i], players[j])) {
      handleCollision(players[i], players[j]);
    }
  }
}
```

**Future:** Spatial hash grid for O(n) with 100+ players

---

## 📊 Performance Metrics

| Metric | Value |
|--------|-------|
| Server Tick Rate | 60 Hz (16.67ms) |
| Client Frame Rate | 60 FPS (uncapped) |
| Network Messages | ~60/sec per player |
| Average Latency (local) | <5ms |
| Average Latency (deployed) | 50-100ms |
| Arena Size | 4000×4000 pixels |
| Max Players Tested | 3 concurrent |

---

## 🐛 Troubleshooting

### "Waiting for players..." stuck on screen
- Need at least **2 players** connected to start a match
- Open the game in **two browser windows** to test locally

### Changes not showing after deployment
- Do a **hard refresh** (Cmd+Shift+R / Ctrl+Shift+F5)
- Check if Render build completed successfully
- Verify client `dist/` folder was rebuilt and committed

### Server not starting on Render
- Check `tsx` is in `dependencies` (not `devDependencies`)
- Verify build command: `npm install && npm run build --workspace=server`
- Check Render logs for errors

### Module resolution errors
- Server uses `shared-imports.ts` workaround for production
- Ensure both `shared/src/types.ts` and `server/src/shared-imports.ts` are in sync

---

## 🔮 Future Enhancements

### Performance
- [ ] Client-side prediction for lower perceived latency
- [ ] Interpolation for other players' movement
- [ ] Spatial hash grid for O(n) collision detection
- [ ] WebSocket message compression

### Features
- [ ] Multiple arenas/maps
- [ ] Power-ups (shields, magnets, invincibility)
- [ ] Player names and custom colors
- [ ] Matchmaking system
- [ ] Spectator mode
- [ ] Replay system

### Persistence
- [ ] User accounts (JWT authentication)
- [ ] PostgreSQL database
- [ ] Global leaderboards
- [ ] Match history
- [ ] Player statistics

### UX/Polish
- [ ] Particle effects (exhaust, collisions)
- [ ] Sound effects and music
- [ ] Mobile touch controls
- [ ] Gamepad support
- [ ] Better visual effects (trails, explosions)
- [ ] Animated tutorial

---

## 🎤 Interview Talking Points

### System Design
> **"How would you scale this to 10,000 concurrent players?"**

- **Horizontal Scaling:** Multiple game servers with Redis pub/sub for cross-server communication
- **Sharding:** Hash players to specific servers by region/skill level
- **Load Balancer:** Nginx with sticky sessions (WebSocket requirement)
- **Database:** PostgreSQL with read replicas for leaderboards
- **Caching:** Redis for session management and real-time stats

### Performance
> **"How do you optimize for low latency?"**

- **Client-Side Prediction:** Client simulates physics locally, reconciles with server
- **Lag Compensation:** Rewind server state for hit detection
- **Snapshot Interpolation:** Smooth other players' movement between updates
- **Delta Compression:** Only send changed state, not full game state
- **Regional Servers:** Deploy closer to players (AWS regions)

### Testing
> **"How would you test a real-time multiplayer game?"**

- **Unit Tests:** Physics, collision detection, fuel calculations
- **Integration Tests:** Server-client communication, state synchronization
- **Load Tests:** Artillery.io for 1000+ concurrent connections
- **Chaos Engineering:** Random disconnects, packet loss simulation
- **E2E Tests:** Playwright for browser automation

### Monitoring
> **"How do you monitor production?"**

- **Metrics:** Grafana dashboards (player count, tick rate, latency percentiles)
- **Logging:** Winston with structured JSON logs → ELK stack
- **Errors:** Sentry for exception tracking
- **Alerting:** PagerDuty if tick rate drops below 55 Hz or player count spikes
- **Tracing:** Distributed tracing with OpenTelemetry

---

## 📝 Development Notes

### Module Resolution Workaround
Due to TypeScript ESM/CommonJS module resolution complexity, the server uses `shared-imports.ts` to duplicate shared types. In production, this would be resolved with proper build tooling (Webpack/Rollup).

### Why Not Use a Game Engine?
- **Learning:** Building from scratch teaches fundamentals
- **Control:** Full control over every aspect of the game
- **Simplicity:** No framework overhead for a simple 2D game
- **Interviews:** Can explain every line of code

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built as a learning project to master:
- Real-time multiplayer architecture
- Game physics and rendering
- Full-stack TypeScript development
- WebSocket communication patterns
- Deployment and DevOps

---

## 📬 Contact

**Your Name** - [@yourtwitter](https://twitter.com/yourtwitter)

**Project Link:** [https://github.com/yourusername/iogame-1](https://github.com/yourusername/iogame-1)

---

⭐ **Star this repo if you found it helpful!** ⭐
