import { Game } from './game/Game';

// Entry point for the client application
const game = new Game();
game.start();

// Handle window resize
window.addEventListener('resize', () => {
  game.handleResize();
});

// Prevent context menu on right-click
document.addEventListener('contextmenu', (e) => e.preventDefault());
