import { MatchResults, GAME_CONFIG } from '@shared/types';

export class HUD {
  private fuelBar: HTMLElement;
  private speedEl: HTMLElement;
  private distanceEl: HTMLElement;
  private playerCountEl: HTMLElement;
  private matchTimeEl: HTMLElement;
  private connectionStatus: HTMLElement;
  private waitingScreen: HTMLElement;
  private gameOverScreen: HTMLElement;

  constructor() {
    this.fuelBar = document.getElementById('fuel-bar')!;
    this.speedEl = document.getElementById('speed')!;
    this.distanceEl = document.getElementById('distance')!;
    this.playerCountEl = document.getElementById('player-count')!;
    this.matchTimeEl = document.getElementById('match-time')!;
    this.connectionStatus = document.getElementById('connection-status')!;
    this.waitingScreen = document.getElementById('waiting-screen')!;
    this.gameOverScreen = document.getElementById('game-over-screen')!;
  }

  public updateFuel(fuel: number): void {
    const percentage = Math.max(0, (fuel / GAME_CONFIG.MAX_FUEL) * 100);
    this.fuelBar.style.width = `${percentage}%`;

    // Add low fuel warning
    if (fuel < 30) {
      this.fuelBar.classList.add('low');
    } else {
      this.fuelBar.classList.remove('low');
    }
  }

  public updateSpeed(speed: number): void {
    // Convert to km/h for display (multiply by ~3.6)
    const kmh = Math.floor(speed * 3.6);
    this.speedEl.textContent = `${kmh} km/h`;
  }

  public updateDistance(distance: number): void {
    this.distanceEl.textContent = `${Math.floor(distance)} m`;
  }

  public updatePlayerCount(count: number): void {
    this.playerCountEl.textContent = count.toString();
  }

  public updateMatchTime(startTime: number, endTime: number): void {
    if (!startTime || startTime === 0) {
      this.matchTimeEl.textContent = '0:00';
      return;
    }

    const now = Date.now();
    const elapsed = now - startTime;
    const remaining = Math.max(0, endTime - now);

    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    this.matchTimeEl.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  public setConnectionStatus(connected: boolean): void {
    if (connected) {
      this.connectionStatus.textContent = '✓ Connected';
      this.connectionStatus.className = 'connected';
    } else {
      this.connectionStatus.textContent = '⚠ Disconnected';
      this.connectionStatus.className = 'disconnected';
    }
  }

  public hideWaitingScreen(): void {
    this.waitingScreen.classList.add('hidden');
  }

  public showWaitingScreen(): void {
    this.waitingScreen.classList.remove('hidden');
  }

  public showGameOver(results: MatchResults): void {
    this.gameOverScreen.classList.remove('hidden');

    const rankingsEl = document.getElementById('rankings')!;
    rankingsEl.innerHTML = '<h2>Final Rankings</h2>';

    results.rankings.forEach((ranking) => {
      const item = document.createElement('div');
      item.className = 'rank-item';
      if (ranking.id === results.winner.id) {
        item.classList.add('winner');
      }

      item.innerHTML = `
        <span>#${ranking.rank} - Player ${ranking.id.substring(0, 8)}</span>
        <span>${Math.floor(ranking.distance)} m</span>
      `;

      rankingsEl.appendChild(item);
    });

    // Show refresh message
    const refreshMsg = document.createElement('p');
    refreshMsg.style.marginTop = '20px';
    refreshMsg.style.color = '#aaa';
    refreshMsg.textContent = 'Refresh the page to play again';
    rankingsEl.appendChild(refreshMsg);
  }
}
