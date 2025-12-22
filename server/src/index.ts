import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ServerToClientEvents, ClientToServerEvents } from './shared-imports.js';
import { GameServer } from './GameServer.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientPath));

  app.get('*', (req, res, next) => {
    // Let Socket.IO handle its routes
    if (req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

// Create Socket.IO server with CORS configuration
const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize game server
const gameServer = new GameServer(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    players: gameServer.getPlayerCount(),
    uptime: process.uptime(),
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🎮 Fuel.io server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
