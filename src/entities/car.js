// ============================================================================
// CAR ENTITY & FLIGHT DYNAMICS (Roadster class)
// Handles continuous cold-gas thruster ramp, velocity clamp, pitching, and nozzles.
// All 5 cars share the EXACT same physics, hitbox (54x11px), terminal velocities,
// cold-gas thruster plumes, and tilt smoothing for 100% gameplay parity.
// ============================================================================

import { CONSTANTS, getCarDef } from '../config.js';
import { Garage } from '../storage.js';
import { drawCar } from '../rendering/car-draw.js';

export class Roadster {
  constructor(x, y) {
    this.playX = x;
    this.playY = y;
    this.carDef = getCarDef(Garage.getEquippedCarId());
    this.reset();
  }

  reset() {
    this.x = this.playX;
    this.y = this.playY;
    this.vy = 0;
    this.angle = 0;
    this.wheelRotation = 0;
    this.thrustOutput = 0;
    this.alive = true;
    this.idleTimer = 0;
    this.xOffset = 0; // Horizontal knockback displacement (shield hit), springs back to 0
    this.xVel = 0;
    this.carDef = getCarDef(Garage.getEquippedCarId());
  }

  // Small nudge after a shield absorbs a pillar hit: dirY = +1 pushes down, -1 pushes up
  // (toward the gap centre) and the car is shoved backward so it stops overlapping the pillar.
  knockback(dirY) {
    this.vy = dirY * CONSTANTS.SHIELD_KNOCKBACK_VY;
    this.xVel = -CONSTANTS.SHIELD_KNOCKBACK_VX;
  }

  // timeScale (1 = normal) only thins out particle emission during slow-mo so plume density
  // per world-distance stays the same; it does not touch the physics integration.
  update(dt, isThrusting, thrustJustPressed, particleSystem, isPlaying, currentSpeed = CONSTANTS.BASE_SCROLL_SPEED, timeScale = 1) {
    if (!this.alive) return;

    if (!isPlaying) {
      // Centered graceful hovering floating bob on the title screen
      this.idleTimer += dt * 3.2;
      this.x = CONSTANTS.VIRTUAL_WIDTH / 2;
      this.y = 195 + Math.sin(this.idleTimer) * 9;
      this.angle = Math.sin(this.idleTimer * 0.8) * 0.04;
      this.wheelRotation += dt * 2.2;

      // Occasional gentle hover puff from underbody thruster
      if (Math.sin(this.idleTimer * 2) > 0.94) {
        const under = this.carDef.underNozzle;
        particleSystem.emitColdGasPlume(this.x + under.x, this.y + under.y, Math.PI / 2 + under.angleOffset, 0, 40, 0.4);
      }
      return;
    }

    // Smooth thruster output ramp up / down
    if (isThrusting) {
      this.thrustOutput = Math.min(1.0, this.thrustOutput + dt / CONSTANTS.THRUST_RAMP_UP);
    } else {
      this.thrustOutput = Math.max(0.0, this.thrustOutput - dt / CONSTANTS.THRUST_RAMP_DOWN);
    }

    // Thrust physics integration
    if (isThrusting) {
      this.vy -= CONSTANTS.THRUST_ACCEL * dt;
    }
    this.vy += CONSTANTS.GRAVITY * dt;

    // Velocity clamp
    this.vy = Math.max(CONSTANTS.MAX_CLIMB_SPEED, Math.min(CONSTANTS.MAX_FALL_SPEED, this.vy));

    // Position update
    this.y += this.vy * dt;

    // Critically-damped spring returning the car to its flight lane after a knockback
    if (this.xOffset !== 0 || this.xVel !== 0) {
      const k = CONSTANTS.SHIELD_KNOCKBACK_SPRING;
      this.xVel += (-k * this.xOffset - 2 * Math.sqrt(k) * this.xVel) * dt;
      this.xOffset += this.xVel * dt;
      if (Math.abs(this.xOffset) < 0.01 && Math.abs(this.xVel) < 0.5) {
        this.xOffset = 0;
        this.xVel = 0;
      }
      this.x = this.playX + this.xOffset;
    }

    // Wheel spin while airborne
    this.wheelRotation += dt * (currentSpeed / 15);

    // Pitch tilting: nose pitches up slightly during climb/thrust, down when falling
    let targetAngle = 0;
    if (this.vy < 0) {
      targetAngle = (this.vy / Math.abs(CONSTANTS.MAX_CLIMB_SPEED)) * 0.28;
    } else {
      targetAngle = (this.vy / CONSTANTS.MAX_FALL_SPEED) * 0.40;
    }
    this.angle += (targetAngle - this.angle) * Math.min(1.0, dt * 10);

    // Dynamic Nozzle World Positions based on Equipped Car Model
    const cosA = Math.cos(this.angle);
    const sinA = Math.sin(this.angle);

    const un = this.carDef.underNozzle;
    const underX = this.x + (un.x * cosA - un.y * sinA);
    const underY = this.y + (un.x * sinA + un.y * cosA);
    const underAngle = this.angle + Math.PI / 2 + un.angleOffset;

    const rn = this.carDef.rearNozzle;
    const rearX = this.x + (rn.x * cosA - rn.y * sinA);
    const rearY = this.y + (rn.x * sinA + rn.y * cosA);
    const rearAngle = this.angle + Math.PI + rn.angleOffset;

    // Initial burst puff shockwave
    if (thrustJustPressed) {
      particleSystem.emitPuffBurst(underX, underY, underAngle);
      particleSystem.emitPuffBurst(rearX, rearY, rearAngle);
    }

    // Emit continuous cold-gas plume
    const emit = () => timeScale >= 1 || Math.random() < timeScale;
    if (this.thrustOutput > 0.05) {
      if (emit()) particleSystem.emitColdGasPlume(underX, underY, underAngle, -currentSpeed * 0.4, this.vy * 0.3, this.thrustOutput);
      if (emit()) particleSystem.emitColdGasPlume(rearX, rearY, rearAngle, -currentSpeed * 0.5, this.vy * 0.2, this.thrustOutput);
    }

    // Aerodynamic vapor trail streaming off rear spoiler
    const sp = this.carDef.spoilerOffset;
    const spoilerX = this.x + (sp.x * cosA - sp.y * sinA);
    const spoilerY = this.y + (sp.x * sinA + sp.y * cosA);
    if (Math.random() < 0.65 && emit()) {
      particleSystem.emitVaporTrail(spoilerX, spoilerY, currentSpeed);
    }

    // Ground dust / vapor ripple effect
    const groundY = CONSTANTS.VIRTUAL_HEIGHT - CONSTANTS.GROUND_HEIGHT;
    const altitude = groundY - (this.y + 10);
    if (altitude < 85 && this.thrustOutput > 0.15 && emit()) {
      const dustIntensity = (1.0 - (altitude / 85)) * this.thrustOutput;
      particleSystem.emitGroundDust(this.x, groundY, dustIntensity, currentSpeed);
    }
  }

  // Snug bounding box slightly inset from the visual sprite for fair arcade collisions
  // IDENTICAL ON ALL CAR MODELS (54x11px)
  getHitbox() {
    const hw = (CONSTANTS.CAR_WIDTH / 2) - CONSTANTS.HITBOX_INSET_X;
    const hh = (CONSTANTS.CAR_HEIGHT / 2) - CONSTANTS.HITBOX_INSET_Y;
    return {
      left: this.x - hw,
      right: this.x + hw,
      top: this.y - hh,
      bottom: this.y + hh
    };
  }

  render(ctx, alpha = 1) {
    if (!this.alive) return;

    ctx.save();
    if (alpha < 1) ctx.globalAlpha = alpha; // blink while shield-invincible
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    drawCar(ctx, this.carDef, this.wheelRotation);

    ctx.restore();
  }
}
