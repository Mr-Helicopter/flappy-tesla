// ============================================================================
// GAME STATE MODULE (Single Shared State)
// Centralized state container for phase, score, speed, timers, and telemetry.
// ============================================================================

import { CONSTANTS } from './config.js';
import { getHighScore, saveHighScore } from './storage.js';

export class GameState {
  constructor() {
    this.phase = 'TITLE'; // 'TITLE' | 'PLAYING' | 'GAMEOVER'
    this.score = 0;
    this.highScore = getHighScore();
    this.isNewHighScore = false;
    this.earnedCoins = 0;
    this.gameOverTimer = 0;
    this.speedBannerTimer = 0;
    this.speedBannerText = '';
    this.totalTime = 0;
    this.worldTime = 0; // Game-time clock (advances by dt * timeScale) for world animations
  }

  getSpeedLevel() {
    return Math.floor(this.score / CONSTANTS.SPEED_INCREASE_INTERVAL) + 1;
  }

  // Dynamic scroll speed calculation: increases by 25 km/h every 5 points passed indefinitely
  getScrollSpeed() {
    const levelIdx = this.getSpeedLevel() - 1;
    return CONSTANTS.BASE_SCROLL_SPEED + levelIdx * CONSTANTS.SPEED_STEP;
  }

  startFlight() {
    this.phase = 'PLAYING';
    this.score = 0;
    this.isNewHighScore = false;
    this.gameOverTimer = 0;
    this.speedBannerTimer = 0;
    this.speedBannerText = '';
  }

  triggerGameOver() {
    this.phase = 'GAMEOVER';
    this.gameOverTimer = 0;
    this.earnedCoins = this.score;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.isNewHighScore = true;
      saveHighScore(this.highScore);
    }
  }

  returnToTitle() {
    this.phase = 'TITLE';
  }
}
