// ============================================================================
// POWER-UPS: SHIELD & SLOW MOTION (logic + state)
// Orbs spawn inside pillar gaps, scroll with the world, and are collected on
// overlap with the car hitbox. All effects are identical for every car.
//
// Time conventions:
//   dt   = real frame time (used for the slow-mo countdown, popups, HUD flashes)
//   gdt  = dt * timeScale  (game time; drives orbs, bobbing, invincibility, ghosts)
// Nothing here is advanced unless Game.update() calls it from the PLAYING state,
// so title / game-over / shop screens freeze every power-up timer automatically.
// ============================================================================

import { CONSTANTS } from '../config.js';

export class PowerUpManager {
  constructor() {
    this.reset();
  }

  // Clears ALL power-up state (called on game over and on restart)
  reset() {
    this.orbs = [];
    this.popups = [];
    this.ghosts = [];

    // Spawn bookkeeping
    this.lastGapHadPowerUp = false;

    // Shield
    this.hasShield = false;
    this.shieldBreakTimer = 0;   // > 0 while the bubble dissolves after absorbing a hit
    this.shieldPulse = 0;        // brief flash when an extra shield orb is collected while shielded
    this.invincibleTimer = 0;    // pillar invincibility after absorbing a hit

    // Slow motion
    this.slowRemaining = 0;      // real seconds left on the effect
    this.slowBlend = 0;          // 0..1 eased-in/out strength (rate limited so it never snaps)
    this.timeScale = 1;          // multiplier applied to gameplay delta-time

    // Animation clocks
    this.time = 0;               // game-time clock (slowed by timeScale) for bob / pulse / shimmer
    this.realTime = 0;           // real-time clock for HUD flashing / blinking
    this.ghostTimer = 0;
  }

  // --------------------------------------------------------------------------
  // SPAWNING: called by ObstacleManager every time a new pillar pair appears
  // --------------------------------------------------------------------------
  onGapSpawned(tower, score) {
    if (score < CONSTANTS.POWERUP_MIN_SCORE) {
      this.lastGapHadPowerUp = false;
      return;
    }
    // Never two power-ups back to back
    if (this.lastGapHadPowerUp) {
      this.lastGapHadPowerUp = false;
      return;
    }
    if (Math.random() >= CONSTANTS.POWERUP_SPAWN_CHANCE) return;

    // Random height strictly inside the gap, clear of both pillar tips (bob included)
    const margin = CONSTANTS.POWERUP_ORB_RADIUS + CONSTANTS.POWERUP_BOB_AMPLITUDE + CONSTANTS.POWERUP_GAP_PADDING;
    const gapTop = tower.gapY - tower.gapHeight / 2;
    const gapBottom = tower.gapY + tower.gapHeight / 2;
    const minY = gapTop + margin;
    const maxY = gapBottom - margin;
    if (maxY <= minY) return;

    this.orbs.push({
      type: Math.random() < CONSTANTS.POWERUP_SHIELD_CHANCE ? 'shield' : 'slowmo',
      x: tower.x + tower.width / 2,
      y: minY + Math.random() * (maxY - minY),
      phase: Math.random() * Math.PI * 2
    });
    this.lastGapHadPowerUp = true;
  }

  // --------------------------------------------------------------------------
  // TIME: advances the slow-mo countdown and returns the gameplay timeScale.
  // Call once per PLAYING frame BEFORE updating anything else.
  // --------------------------------------------------------------------------
  tickTime(dt) {
    this.realTime += dt;

    if (this.slowRemaining > 0) {
      this.slowRemaining = Math.max(0, this.slowRemaining - dt);
    }

    // Ease in over SLOWMO_EASE_IN, ease out over SLOWMO_EASE_OUT (final part of the timer).
    // The blend is rate-limited toward its target so re-collecting mid-fade never snaps.
    const target = this.slowRemaining > CONSTANTS.SLOWMO_EASE_OUT ? 1 : 0;
    if (this.slowBlend < target) {
      this.slowBlend = Math.min(target, this.slowBlend + dt / CONSTANTS.SLOWMO_EASE_IN);
    } else if (this.slowBlend > target) {
      this.slowBlend = Math.max(target, this.slowBlend - dt / CONSTANTS.SLOWMO_EASE_OUT);
    }

    const eased = this.slowBlend * this.slowBlend * (3 - 2 * this.slowBlend); // smoothstep
    this.timeScale = 1 - (1 - CONSTANTS.SLOWMO_TIME_SCALE) * eased;

    const gdt = dt * this.timeScale;
    this.time += gdt;
    if (this.invincibleTimer > 0) this.invincibleTimer = Math.max(0, this.invincibleTimer - gdt);
    if (this.shieldBreakTimer > 0) this.shieldBreakTimer = Math.max(0, this.shieldBreakTimer - gdt);
    if (this.shieldPulse > 0) this.shieldPulse = Math.max(0, this.shieldPulse - dt * 3);

    for (let i = this.popups.length - 1; i >= 0; i--) {
      this.popups[i].life -= dt;
      if (this.popups[i].life <= 0) this.popups.splice(i, 1);
    }

    return this.timeScale;
  }

  // --------------------------------------------------------------------------
  // ENTITIES: scroll orbs, collect pickups, trail ghosts
  // --------------------------------------------------------------------------
  update(dt, gdt, currentSpeed, car, particles, audio) {
    // Scroll orbs with the world & check pickups
    const hb = car.getHitbox();
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const orb = this.orbs[i];
      orb.x -= currentSpeed * gdt;

      if (orb.x < -40) {
        this.orbs.splice(i, 1);
        continue;
      }

      // Distance from orb centre to nearest point of the car hitbox
      const bob = Math.sin(this.time * CONSTANTS.POWERUP_BOB_SPEED + orb.phase) * CONSTANTS.POWERUP_BOB_AMPLITUDE;
      const oy = orb.y + bob;
      const nx = Math.max(hb.left, Math.min(orb.x, hb.right));
      const ny = Math.max(hb.top, Math.min(oy, hb.bottom));
      const dx = orb.x - nx;
      const dy = oy - ny;
      if (dx * dx + dy * dy <= CONSTANTS.POWERUP_PICKUP_RADIUS * CONSTANTS.POWERUP_PICKUP_RADIUS) {
        this.collect(orb, car, particles, audio);
        this.orbs.splice(i, 1);
      }
    }

    // Slow-mo ghost trail samples (scroll left with the world like everything else)
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      const g = this.ghosts[i];
      g.x -= currentSpeed * gdt;
      g.age += dt;
      if (g.age >= CONSTANTS.SLOWMO_GHOST_LIFE) this.ghosts.splice(i, 1);
    }
    if (this.slowBlend > 0.05) {
      this.ghostTimer += dt;
      if (this.ghostTimer >= CONSTANTS.SLOWMO_GHOST_INTERVAL) {
        this.ghostTimer = 0;
        this.ghosts.push({ x: car.x, y: car.y, angle: car.angle, wheel: car.wheelRotation, age: 0 });
      }
    } else {
      this.ghostTimer = 0;
    }
  }

  collect(orb, car, particles, audio) {
    const isShield = orb.type === 'shield';
    particles.emitPowerUpBurst(orb.x, orb.y, isShield ? 190 : 268, 14);
    audio.playPowerUpPickup(orb.type);

    if (isShield) {
      if (this.hasShield) {
        // Already shielded: shield stays as-is (no bonus coins / points), just a flash + popup
        this.shieldPulse = 1;
        this.addPopup('SHIELD READY', car, orb.type);
      } else {
        this.hasShield = true;
        this.shieldBreakTimer = 0;
        this.addPopup('SHIELD!', car, orb.type);
      }
    } else {
      // Slow-mo never stacks: just refresh the countdown to full duration
      this.slowRemaining = CONSTANTS.SLOWMO_DURATION;
      this.addPopup('SLOW-MO!', car, orb.type);
    }
  }

  addPopup(text, car, type) {
    this.popups.push({
      text,
      type,
      x: car.x,
      y: car.y - 34,
      life: CONSTANTS.POWERUP_POPUP_TIME
    });
  }

  // --------------------------------------------------------------------------
  // SHIELD: absorb one pillar hit
  // --------------------------------------------------------------------------
  isInvincible() {
    return this.invincibleTimer > 0;
  }

  // hit = { tower, side: 'top' | 'bottom' } from ObstacleManager.getPillarHit()
  absorbHit(hit, car, particles, audio) {
    this.hasShield = false;
    this.shieldBreakTimer = CONSTANTS.SHIELD_BREAK_TIME;
    this.invincibleTimer = CONSTANTS.SHIELD_INVINCIBILITY;

    particles.emitPowerUpBurst(car.x, car.y, 190, 28, 1.3);
    audio.playShieldBreak();

    // Nudge the car back and toward the gap centre so it doesn't sit inside the pillar
    car.knockback(hit.side === 'top' ? 1 : -1);
  }

  // Alpha for blinking the car while invincible (1 = fully visible)
  getCarAlpha() {
    if (!this.isInvincible()) return 1;
    return Math.sin(this.realTime * 36) > 0 ? 1 : 0.3;
  }

  isShieldVisible() {
    return this.hasShield || this.shieldBreakTimer > 0;
  }

  isSlowMoActive() {
    return this.slowRemaining > 0;
  }
}
