// ============================================================================
// GAME ENGINE & MAIN LOOP
// Delta-time based simulation, HiDPI scaling, entity management, and state machine.
// Game states: TITLE -> PLAYING -> GAMEOVER
// ============================================================================

import { CONSTANTS } from './config.js';
import { GameState } from './state.js';
import { InputHandler } from './input.js';
import { SoundManager } from './audio.js';
import { ParticleSystem } from './effects/particles.js';
import { Roadster } from './entities/car.js';
import { ObstacleManager } from './entities/obstacles.js';
import { Background } from './rendering/background.js';
import { renderHUD } from './rendering/hud.js';
import { Garage } from './storage.js';
import { submitScoreToSupabase } from './supabase.js';
import { ShopController, updateAllCoinDisplays } from './shop.js';
import { loadLeaderboardView, refreshLeaderboards } from './leaderboard.js';
import { PowerUpManager } from './entities/powerups.js';
import { drawOrbs, drawShieldBubble, drawSlowMoTrail, drawSlowMoTint, drawPowerUpOverlay } from './rendering/powerups-draw.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.state = new GameState();
    this.audio = new SoundManager();
    this.particles = new ParticleSystem();
    this.roadster = new Roadster(220, 260);
    this.obstacles = new ObstacleManager();
    this.background = new Background();
    this.powerups = new PowerUpManager();
    this.obstacles.onSpawn = (tower, score) => this.powerups.onGapSpawned(tower, score);
    this.input = new InputHandler(() => this.state.phase);

    // Wire up shop controller callbacks (no window globals)
    ShopController.init({
      getRoadster: () => this.roadster,
      getAudio: () => this.audio
    });

    // Timing
    this.lastTime = performance.now();

    // Handle window resizing and retina scaling
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Start delta-time game loop
    requestAnimationFrame((t) => this.loop(t));
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    // Fit virtual 16:9 box into available window while preserving aspect ratio
    const aspect = CONSTANTS.VIRTUAL_WIDTH / CONSTANTS.VIRTUAL_HEIGHT;
    let displayW = winW;
    let displayH = winW / aspect;

    if (displayH > winH) {
      displayH = winH;
      displayW = winH * aspect;
    }

    // Sync game wrapper style size for crisp responsive HTML UI overlays
    const gameWrapper = document.getElementById('game-wrapper');
    if (gameWrapper) {
      gameWrapper.style.width = `${Math.floor(displayW)}px`;
      gameWrapper.style.height = `${Math.floor(displayH)}px`;
    }

    // Canvas element style size
    this.canvas.style.width = `${Math.floor(displayW)}px`;
    this.canvas.style.height = `${Math.floor(displayH)}px`;

    // Buffer size multiplied by DPR for razor-sharp HiDPI / Retina rendering
    this.canvas.width = Math.floor(CONSTANTS.VIRTUAL_WIDTH * dpr);
    this.canvas.height = Math.floor(CONSTANTS.VIRTUAL_HEIGHT * dpr);

    this.dpr = dpr;
  }

  startGame() {
    // Do not launch game if any modal dialog is currently open
    if (document.querySelector('.modal-overlay.active')) return;

    this.audio.resume();
    this.state.startFlight();
    this.roadster.reset();
    this.obstacles.reset();
    this.particles.reset();
    this.powerups.reset();

    // UI state transitions
    const titleBar = document.getElementById('title-ui-bar');
    if (titleBar) titleBar.style.display = 'none';
    const goPanel = document.getElementById('gameover-leaderboard-panel');
    if (goPanel) goPanel.classList.remove('active');
  }

  triggerGameOver() {
    this.state.triggerGameOver();
    this.roadster.alive = false;
    this.powerups.reset(); // Shield / slow-mo / orbs never carry over a crash

    // Add coins earned in this flight (1 point = 1 coin)
    Garage.addCoins(this.state.earnedCoins);
    updateAllCoinDisplays();

    // Play synthesized crash audio
    this.audio.playCrash();

    // Trigger visual explosion debris and vapor
    this.particles.emitCrashExplosion(this.roadster.x, this.roadster.y);

    // Submit score to Supabase via RPC only if score > 0
    if (this.state.score > 0) {
      submitScoreToSupabase(this.state.score).then(() => {
        refreshLeaderboards();
      });
    }

    // Display Game Over Leaderboard Panel on right side of screen
    const goPanel = document.getElementById('gameover-leaderboard-panel');
    if (goPanel) {
      goPanel.classList.add('active');
      const goContent = document.getElementById('gameover-leaderboard-content');
      if (goContent) {
        loadLeaderboardView(goContent);
      }
    }
  }

  // --------------------------------------------------------------------------
  // UPDATE CYCLE
  // --------------------------------------------------------------------------
  update(dt) {
    this.state.totalTime += dt;

    if (this.state.speedBannerTimer > 0) {
      this.state.speedBannerTimer = Math.max(0, this.state.speedBannerTimer - dt);
    }

    const currentSpeed = this.state.phase === 'PLAYING' ? this.state.getScrollSpeed() : CONSTANTS.BASE_SCROLL_SPEED;

    // Global time scale: only advances (and only ever differs from 1) while PLAYING, so the
    // title screen, game-over screen and shop modal freeze every power-up timer.
    const timeScale = this.state.phase === 'PLAYING' ? this.powerups.tickTime(dt) : 1;
    const gdt = dt * timeScale; // Game-time delta used by ALL gameplay systems
    this.state.worldTime += gdt;
    this.audio.setSlowMo(this.powerups.slowBlend);

    // Audio mute toggle via M key
    if (this.input.muteToggled) {
      this.audio.toggleMute();
    }

    // State machine logic
    if (this.state.phase === 'TITLE') {
      const titleBar = document.getElementById('title-ui-bar');
      if (titleBar && titleBar.style.display !== 'flex') titleBar.style.display = 'flex';
      const goPanel = document.getElementById('gameover-leaderboard-panel');
      if (goPanel && goPanel.classList.contains('active')) goPanel.classList.remove('active');

      this.background.update(dt, false, CONSTANTS.BASE_SCROLL_SPEED);
      this.roadster.update(dt, false, false, this.particles, false, CONSTANTS.BASE_SCROLL_SPEED);
      this.particles.update(dt, CONSTANTS.BASE_SCROLL_SPEED);

      // Start game on space or click only when NO modal overlay is active
      if (!document.querySelector('.modal-overlay.active')) {
        if (this.input.anyKeyJustPressed || this.input.thrustJustPressed) {
          this.startGame();
        }
      }
    } else if (this.state.phase === 'PLAYING') {
      // Continuous thruster audio control
      this.audio.setThrusterActive(this.input.isThrusting, this.input.thrustJustPressed);

      this.background.update(gdt, true, currentSpeed);
      this.roadster.update(gdt, this.input.isThrusting, this.input.thrustJustPressed, this.particles, true, currentSpeed, timeScale);
      this.obstacles.update(gdt, true, currentSpeed, () => {
        this.state.score++;
        if (this.state.score > this.state.highScore) {
          this.state.highScore = this.state.score;
          this.state.isNewHighScore = true;
          this.state.highScore = this.state.score;
        }

        // Every 5 points: increase game speed with celebratory chime & HUD banner (indefinite scaling)
        if (this.state.score % CONSTANTS.SPEED_INCREASE_INTERVAL === 0) {
          const nextLvl = this.state.getSpeedLevel();
          const nextSpeed = this.state.getScrollSpeed();
          this.state.speedBannerTimer = 1.8;
          if (this.state.score === CONSTANTS.PILLAR_SPACING_SCORE_THRESHOLD) {
            this.state.speedBannerText = `⚡ SPEED UP! LVL ${nextLvl} (${nextSpeed} KM/H) • TOWERS +20% SPACED!`;
          } else {
            this.state.speedBannerText = `⚡ SPEED UP! LVL ${nextLvl} (${nextSpeed} KM/H)`;
          }
          this.audio.playSpeedUpPing();
        } else {
          this.audio.playScorePing();
        }
      }, this.state.score);
      this.powerups.update(dt, gdt, currentSpeed, this.roadster, this.particles, this.audio);
      this.particles.update(gdt, currentSpeed);

      // Collision check: ground / ceiling are always lethal; pillars can be absorbed by the
      // Shield or ignored during the post-shield invincibility window.
      const hitbox = this.roadster.getHitbox();
      if (this.obstacles.hitsBounds(hitbox)) {
        this.triggerGameOver();
      } else {
        const pillarHit = this.obstacles.getPillarHit(hitbox);
        if (pillarHit && !this.powerups.isInvincible()) {
          if (this.powerups.hasShield) {
            this.powerups.absorbHit(pillarHit, this.roadster, this.particles, this.audio);
          } else {
            this.triggerGameOver();
          }
        }
      }
    } else if (this.state.phase === 'GAMEOVER') {
      this.state.gameOverTimer += dt;
      this.audio.setThrusterActive(false);

      this.background.update(dt, false, CONSTANTS.BASE_SCROLL_SPEED);
      this.particles.update(dt, CONSTANTS.BASE_SCROLL_SPEED);

      // Restart on space / click after brief lock delay (0.45s) only when NO modal overlay is active
      if (!document.querySelector('.modal-overlay.active')) {
        if (this.state.gameOverTimer > 0.45 && (this.input.anyKeyJustPressed || this.input.thrustJustPressed)) {
          this.startGame();
        }
      }
    }

    this.input.endFrame();
  }

  // --------------------------------------------------------------------------
  // RENDER CYCLE
  // --------------------------------------------------------------------------
  render() {
    const ctx = this.ctx;
    const dpr = this.dpr || 1;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Camera shake translation
    if (this.particles.cameraShake > 0.1) {
      const shakeMag = this.particles.cameraShake;
      const ox = (Math.random() - 0.5) * shakeMag;
      const oy = (Math.random() - 0.5) * shakeMag;
      ctx.translate(ox, oy);
    } else if (this.state.phase === 'PLAYING' && this.input.isThrusting) {
      // Subtle flight rumble while thrusters are firing
      const microOx = (Math.random() - 0.5) * 1.5;
      const microOy = (Math.random() - 0.5) * 1.5;
      ctx.translate(microOx, microOy);
    }

    // 1. Parallax background
    this.background.render(ctx, this.state.worldTime);

    // Ceiling flight ceiling warning boundary
    ctx.save();
    ctx.strokeStyle = 'rgba(231, 76, 60, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, CONSTANTS.CEILING_HEIGHT);
    ctx.lineTo(CONSTANTS.VIRTUAL_WIDTH, CONSTANTS.CEILING_HEIGHT);
    ctx.stroke();
    ctx.restore();

    // 2. Obstacles (Starbase towers)
    this.obstacles.render(ctx);

    // 3. Particles & Thruster plumes (rendered underneath the car sprite)
    this.particles.render(ctx);

    // 3b. Power-up orbs (floating in the pillar gaps)
    drawOrbs(ctx, this.powerups.orbs, this.powerups.time);

    // 4. Roadster sprite (slow-mo ghost trail behind it, blinking while shield-invincible)
    drawSlowMoTrail(ctx, this.roadster, this.powerups);
    this.roadster.render(ctx, this.powerups.getCarAlpha());
    if (this.roadster.alive) drawShieldBubble(ctx, this.roadster, this.powerups);

    // 4b. Slow-mo purple-blue tint + vignette
    drawSlowMoTint(ctx, this.powerups);

    // 5. Dynamic screen vignette pulse during cold-gas thruster firing
    if (this.state.phase === 'PLAYING' && this.roadster.thrustOutput > 0.05) {
      ctx.save();
      const vigGrad = ctx.createRadialGradient(
        CONSTANTS.VIRTUAL_WIDTH / 2, CONSTANTS.VIRTUAL_HEIGHT / 2, CONSTANTS.VIRTUAL_HEIGHT * 0.35,
        CONSTANTS.VIRTUAL_WIDTH / 2, CONSTANTS.VIRTUAL_HEIGHT / 2, CONSTANTS.VIRTUAL_WIDTH * 0.75
      );
      vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vigGrad.addColorStop(1, `rgba(0, 180, 255, ${this.roadster.thrustOutput * 0.18})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, CONSTANTS.VIRTUAL_WIDTH, CONSTANTS.VIRTUAL_HEIGHT);
      ctx.restore();
    }

    // 6. HUD and UI overlays
    renderHUD(ctx, this.state, this.audio, this.roadster);
    drawPowerUpOverlay(ctx, this.powerups, this.state.phase);

    ctx.restore();
  }

  // --------------------------------------------------------------------------
  // MAIN LOOP (Delta-time based)
  // --------------------------------------------------------------------------
  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1); // Clamp dt to prevent tunneling
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}
