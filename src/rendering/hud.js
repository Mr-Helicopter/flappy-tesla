// ============================================================================
// HUD & IN-CANVAS TEXT RENDERING
// Title screen overlays, thruster telemetry gauge, speed alerts, and game-over panel.
// ============================================================================

import { CONSTANTS } from '../config.js';
import { Garage } from '../storage.js';

export function renderHUD(ctx, gameState, audio, roadster) {
  const W = CONSTANTS.VIRTUAL_WIDTH;
  const H = CONSTANTS.VIRTUAL_HEIGHT;

  // Audio Mute Status (top right)
  ctx.save();
  ctx.font = '600 12px monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = audio.isMuted ? '#ff5252' : '#81ecec';
  if (gameState.phase === 'TITLE') {
    ctx.fillText(audio.isMuted ? '[M] AUDIO: MUTED' : '[M] AUDIO: ON', W - 18, 64);
  } else {
    ctx.fillText(audio.isMuted ? '[M] AUDIO: MUTED' : '[M] AUDIO: ON', W - 18, 26);
  }
  ctx.restore();

  if (gameState.phase === 'TITLE') {
    // Title Screen Banner
    ctx.save();
    ctx.textAlign = 'center';

    // Title glow
    ctx.shadowColor = '#e74c3c';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('FLAPPY TESLA', W / 2, 108);

    ctx.shadowColor = '#00d2d3';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00d2d3';
    ctx.font = '700 13px monospace';
    ctx.letterSpacing = '3px';
    ctx.fillText('SPACEX COLD-GAS THRUSTER FLIGHT TEST', W / 2, 138);
    ctx.shadowBlur = 0;

    // Action instructions box (placed neatly under the hovering Roadster)
    ctx.fillStyle = 'rgba(15, 17, 26, 0.82)';
    ctx.strokeStyle = '#00d2d3';
    ctx.lineWidth = 1.2;
    const boxW = 420;
    const boxH = 80;
    const boxY = 265;
    ctx.beginPath();
    ctx.roundRect(W / 2 - boxW / 2, boxY, boxW, boxH, 10);
    ctx.fill();
    ctx.stroke();

    // Pulsing prompt
    const pulse = Math.sin(gameState.totalTime * 4.5) * 0.25 + 0.75;
    ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
    ctx.font = '700 17px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('HOLD [SPACE] OR TOUCH & HOLD TO FLY', W / 2, boxY + 34);

    ctx.fillStyle = '#a4b0be';
    ctx.font = '500 12px monospace';
    ctx.fillText('RELEASE = GRAVITY   •   PASS STARBASE TOWERS', W / 2, boxY + 60);

    // High Score
    if (gameState.highScore > 0) {
      ctx.fillStyle = '#ffd32a';
      ctx.font = '700 14px monospace';
      ctx.fillText(`★ BEST RECORD: ${gameState.highScore} ★`, W / 2, 382);
    }

    ctx.restore();
  } else if (gameState.phase === 'PLAYING') {
    // Active Score in top center
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '900 48px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText(gameState.score, W / 2 + 2, 62);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(gameState.score, W / 2, 60);

    // Thruster status bar indicator in top-left
    ctx.textAlign = 'left';
    ctx.font = '700 11px monospace';
    ctx.fillStyle = '#747d8c';
    ctx.fillText('COLD-GAS THRUST', 20, 24);

    // Thruster power gauge bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(20, 30, 110, 8);
    const gaugeW = 110 * roadster.thrustOutput;
    const barGrad = ctx.createLinearGradient(20, 0, 130, 0);
    barGrad.addColorStop(0, '#00d2d3');
    barGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = barGrad;
    ctx.fillRect(20, 30, gaugeW, 8);
    ctx.strokeStyle = '#2f3542';
    ctx.strokeRect(20, 30, 110, 8);

    // Speed & Level HUD indicator in km/h (increases indefinitely)
    const curSpeed = gameState.getScrollSpeed();
    const curLvl = gameState.getSpeedLevel();
    ctx.fillStyle = '#00d2d3';
    ctx.font = '700 11px monospace';
    if (gameState.score >= CONSTANTS.PILLAR_SPACING_SCORE_THRESHOLD) {
      ctx.fillText(`SPEED: ${curSpeed} KM/H [LVL ${curLvl}] • TOWERS +20% SPACED`, 20, 52);
    } else {
      ctx.fillText(`SPEED: ${curSpeed} KM/H  [LVL ${curLvl}]`, 20, 52);
    }

    // Floating Speed Increase alert notification
    if (gameState.speedBannerTimer > 0) {
      ctx.save();
      ctx.textAlign = 'center';
      const progress = gameState.speedBannerTimer / 1.8;
      const alpha = Math.min(1.0, progress * 2.5);
      const floatY = 125 - (1.0 - progress) * 18;

      ctx.font = '900 15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      const textW = ctx.measureText(gameState.speedBannerText).width;
      const bWidth = Math.max(330, textW + 44);
      const bHeight = 40;

      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 18;
      ctx.fillStyle = `rgba(12, 16, 26, ${alpha * 0.90})`;
      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.95})`;
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      ctx.roundRect(W / 2 - bWidth / 2, floatY - 26, bWidth, bHeight, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillText(gameState.speedBannerText, W / 2, floatY);
      ctx.restore();
    }

    ctx.restore();
  } else if (gameState.phase === 'GAMEOVER') {
    // Game Over Panel (positioned on left side to accommodate the right-side global leaderboard)
    ctx.save();
    ctx.textAlign = 'center';

    const panelW = 340;
    const panelH = 268;
    const panelX = 85;
    const panelY = H / 2 - panelH / 2;
    const centerX = panelX + panelW / 2;

    // Panel background
    ctx.fillStyle = 'rgba(16, 17, 24, 0.94)';
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 10);
    ctx.fill();
    ctx.stroke();

    // Panel header
    ctx.fillStyle = '#e74c3c';
    ctx.font = '900 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText('FLIGHT TERMINATED', centerX, panelY + 36);

    // Score row
    ctx.fillStyle = '#a4b0be';
    ctx.font = '600 13px monospace';
    ctx.fillText('FINAL SCORE', centerX, panelY + 66);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 38px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(gameState.score, centerX, panelY + 104);

    // Coins earned this run (+N COINS EARNED)
    ctx.fillStyle = '#ffd32a';
    ctx.font = '800 14px monospace';
    const earned = gameState.earnedCoins !== undefined ? gameState.earnedCoins : gameState.score;
    ctx.fillText(`+${earned} COINS EARNED 🪙`, centerX, panelY + 128);

    // Top speed reached in km/h
    ctx.fillStyle = '#00d2d3';
    ctx.font = '700 12px monospace';
    ctx.fillText(`TOP SPEED: ${gameState.getScrollSpeed()} KM/H [LVL ${gameState.getSpeedLevel()}]`, centerX, panelY + 152);

    // Best score & Wallet total
    ctx.font = '700 13px monospace';
    if (gameState.isNewHighScore) {
      ctx.fillStyle = '#2ed573';
      ctx.fillText(`★ NEW BEST: ${gameState.highScore}  |  WALLET: ${Garage.getCoins()} 🪙 ★`, centerX, panelY + 176);
    } else {
      ctx.fillStyle = '#ffd32a';
      ctx.fillText(`BEST: ${gameState.highScore}   •   WALLET: ${Garage.getCoins()} 🪙`, centerX, panelY + 176);
    }

    // Restart prompt
    const promptPulse = Math.sin(gameState.totalTime * 5.0) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 255, 255, ${promptPulse})`;
    ctx.font = '700 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('PRESS [SPACE] OR TAP TO RESTART', centerX, panelY + 232);

    ctx.restore();
  }
}
