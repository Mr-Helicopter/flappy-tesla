// ============================================================================
// PARTICLE SYSTEM & VISUAL EFFECTS
// Cold-gas plumes, puff bursts, dust ripples, vapor trails, speed lines, debris
// ============================================================================

import { CONSTANTS } from '../config.js';

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shockwaves = [];
    this.speedLines = [];
    this.debris = [];
    this.screenFlash = 0;
    this.cameraShake = 0;

    // Seed initial speed lines across the screen
    for (let i = 0; i < 18; i++) {
      this.speedLines.push({
        x: Math.random() * CONSTANTS.VIRTUAL_WIDTH,
        y: Math.random() * (CONSTANTS.VIRTUAL_HEIGHT - CONSTANTS.GROUND_HEIGHT - 30) + 15,
        length: Math.random() * 45 + 25,
        speed: Math.random() * 320 + 380,
        alpha: Math.random() * 0.22 + 0.08
      });
    }
  }

  reset() {
    this.particles = [];
    this.shockwaves = [];
    this.debris = [];
    this.screenFlash = 0;
    this.cameraShake = 0;
  }

  // --------------------------------------------------------------------------
  // EMITTER: Continuous cold-gas plume
  // Cold gas is pressurized nitrogen: dense white / ice-pale-blue vapor that
  // rapidly expands, billows, and fades without flame or dark soot.
  // --------------------------------------------------------------------------
  emitColdGasPlume(x, y, angle, velocityX, velocityY, intensity = 1.0) {
    const count = Math.ceil(2 * intensity);
    for (let i = 0; i < count; i++) {
      // Random conical spread angle behind/under the nozzle
      const spreadAngle = angle + (Math.random() - 0.5) * 0.55;
      const speed = (Math.random() * 220 + 260) * intensity;
      const vx = velocityX + Math.cos(spreadAngle) * speed + (Math.random() - 0.5) * 35;
      const vy = velocityY + Math.sin(spreadAngle) * speed + (Math.random() - 0.5) * 35;
      const size = Math.random() * 4 + 3.5;
      const alpha = Math.random() * 0.35 + 0.60;

      this.particles.push({
        type: 'gas',
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: vx,
        vy: vy,
        size: size,
        currentSize: size,
        maxSize: Math.random() * 18 + 18,
        life: 0,
        maxLife: Math.random() * 0.28 + 0.28,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 7,
        // Pale cyan / glacial ice-white cold gas coloration
        colorH: Math.random() > 0.4 ? 195 : 210, // Cyan/ice-blue hue
        colorS: Math.random() * 35 + 40,
        colorL: Math.random() * 20 + 80,
        alphaStart: alpha,
        currentAlpha: alpha
      });
    }
  }

  // --------------------------------------------------------------------------
  // EMITTER: Initial intense puff burst when thrusting begins
  // --------------------------------------------------------------------------
  emitPuffBurst(x, y, angle) {
    // Rapid radial shockwave halo
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 4,
      currentRadius: 4,
      maxRadius: 36,
      life: 0,
      maxLife: 0.18,
      alpha: 0.8,
      currentAlpha: 0.8
    });

    // Fan of high-velocity cold gas droplets
    for (let i = 0; i < 18; i++) {
      const spreadAngle = angle + (Math.random() - 0.5) * 1.1;
      const speed = Math.random() * 380 + 280;
      const size = Math.random() * 5 + 4;
      const alpha = 0.85;
      this.particles.push({
        type: 'gas',
        x: x,
        y: y,
        vx: Math.cos(spreadAngle) * speed,
        vy: Math.sin(spreadAngle) * speed,
        size: size,
        currentSize: size,
        maxSize: Math.random() * 24 + 18,
        life: 0,
        maxLife: Math.random() * 0.25 + 0.22,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 10,
        colorH: 195,
        colorS: 60,
        colorL: 90,
        alphaStart: alpha,
        currentAlpha: alpha
      });
    }
  }

  // --------------------------------------------------------------------------
  // EMITTER: Ground dust & vapor ripple when car is near desert floor
  // --------------------------------------------------------------------------
  emitGroundDust(x, groundY, intensity, scrollSpeed = CONSTANTS.BASE_SCROLL_SPEED) {
    const count = Math.ceil(3 * intensity);
    for (let i = 0; i < count; i++) {
      const dir = Math.random() > 0.45 ? 1 : -1;
      const size = Math.random() * 4 + 3;
      this.particles.push({
        type: 'ground_dust',
        x: x + (Math.random() - 0.5) * 18,
        y: groundY - Math.random() * 3,
        vx: dir * (Math.random() * 160 + 90) - scrollSpeed * 0.3,
        vy: -(Math.random() * 30 + 10),
        size: size,
        currentSize: size,
        maxSize: Math.random() * 16 + 12,
        life: 0,
        maxLife: Math.random() * 0.35 + 0.25,
        // Warm desert sand / dust color
        color: 'rgba(230, 205, 175, ',
        alphaStart: 0.45,
        currentAlpha: 0.45
      });
    }
  }

  // --------------------------------------------------------------------------
  // EMITTER: Aerodynamic vapor trail off spoiler wingtip
  // --------------------------------------------------------------------------
  emitVaporTrail(x, y, scrollSpeed = CONSTANTS.BASE_SCROLL_SPEED) {
    this.particles.push({
      type: 'vapor_trail',
      x: x,
      y: y + (Math.random() - 0.5) * 2,
      vx: -scrollSpeed * 0.85,
      vy: (Math.random() - 0.5) * 12,
      size: 3,
      currentSize: 3,
      maxSize: 12,
      life: 0,
      maxLife: 0.32,
      alphaStart: 0.30,
      currentAlpha: 0.30
    });
  }

  // --------------------------------------------------------------------------
  // EMITTER: Power-up pickup sparkle / shield pop (tinted radial gas burst + ring)
  // --------------------------------------------------------------------------
  emitPowerUpBurst(x, y, hue, count = 16, speedMul = 1.0) {
    this.shockwaves.push({
      x: x,
      y: y,
      radius: 6,
      currentRadius: 6,
      maxRadius: 44 * speedMul,
      life: 0,
      maxLife: 0.22,
      alpha: 0.85,
      currentAlpha: 0.85
    });

    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 200 + 90) * speedMul;
      const size = Math.random() * 3 + 2.5;
      const alpha = 0.9;
      this.particles.push({
        type: 'gas',
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: size,
        currentSize: size,
        maxSize: Math.random() * 10 + 9,
        life: 0,
        maxLife: Math.random() * 0.25 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
        colorH: hue + (Math.random() - 0.5) * 24,
        colorS: 85,
        colorL: 78,
        alphaStart: alpha,
        currentAlpha: alpha
      });
    }
  }

  // --------------------------------------------------------------------------
  // EMITTER: Game over crash explosion (fragments, carbon panels, vapor)
  // --------------------------------------------------------------------------
  emitCrashExplosion(x, y) {
    this.screenFlash = 1.0;
    this.cameraShake = 16.0;

    // Vapor cloud explosion
    for (let i = 0; i < 35; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 340 + 80;
      const size = Math.random() * 6 + 5;
      const alpha = 0.95;
      this.particles.push({
        type: 'gas',
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        size: size,
        currentSize: size,
        maxSize: Math.random() * 34 + 20,
        life: 0,
        maxLife: Math.random() * 0.45 + 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
        colorH: Math.random() > 0.5 ? 200 : 15, // White vapor with fiery sparks
        colorS: 70,
        colorL: 85,
        alphaStart: alpha,
        currentAlpha: alpha
      });
    }

    // Tesla Roadster structural debris pieces (red body panels, wheels, titanium rods)
    const debrisColors = ['#e01020', '#b50c18', '#1c1c1f', '#dcdde1', '#e84118'];
    for (let i = 0; i < 28; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 380 + 90;
      this.debris.push({
        x: x,
        y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 90, // Upward bias
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 18,
        w: Math.random() * 10 + 4,
        h: Math.random() * 6 + 3,
        color: debrisColors[Math.floor(Math.random() * debrisColors.length)],
        life: 0,
        maxLife: 2.2,
        bounceCount: 0
      });
    }
  }

  update(dt, currentSpeed = CONSTANTS.BASE_SCROLL_SPEED) {
    // Screen flash decay
    if (this.screenFlash > 0) {
      this.screenFlash = Math.max(0, this.screenFlash - dt * 4.5);
    }

    // Camera shake decay
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 26);
    }

    // Update gas particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.rotSpeed * dt;

      // Aerodynamic drag slows down expanding gas
      p.vx *= Math.pow(0.15, dt);
      p.vy *= Math.pow(0.20, dt);

      // Particle expands as gas diffuses
      const progress = p.life / p.maxLife;
      p.currentSize = p.size + (p.maxSize - p.size) * progress;
      p.currentAlpha = p.alphaStart * (1 - progress);
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.life += dt;
      if (sw.life >= sw.maxLife) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      const prog = sw.life / sw.maxLife;
      sw.currentRadius = sw.radius + (sw.maxRadius - sw.radius) * prog;
      sw.currentAlpha = sw.alpha * (1 - prog);
    }

    // Update speed lines (streaking faster as game speed increases)
    const speedRatio = currentSpeed / CONSTANTS.BASE_SCROLL_SPEED;
    for (const line of this.speedLines) {
      line.x -= line.speed * speedRatio * dt;
      if (line.x + line.length < 0) {
        line.x = CONSTANTS.VIRTUAL_WIDTH + Math.random() * 80;
        line.y = Math.random() * (CONSTANTS.VIRTUAL_HEIGHT - CONSTANTS.GROUND_HEIGHT - 30) + 15;
        line.speed = Math.random() * 320 + 380;
      }
    }

    // Update physical crash debris
    const groundLevel = CONSTANTS.VIRTUAL_HEIGHT - CONSTANTS.GROUND_HEIGHT;
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i];
      d.life += dt;
      if (d.life >= d.maxLife) {
        this.debris.splice(i, 1);
        continue;
      }

      d.vy += CONSTANTS.GRAVITY * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rot += d.rotSpeed * dt;

      // Ground bounce collision
      if (d.y > groundLevel - 2) {
        d.y = groundLevel - 2;
        d.vy = -d.vy * 0.45;
        d.vx *= 0.65;
        d.rotSpeed *= 0.5;
        d.bounceCount++;
      }
    }
  }

  render(ctx) {
    // 1. Render speed lines
    ctx.save();
    ctx.strokeStyle = 'rgba(210, 235, 255, 0.18)';
    ctx.lineWidth = 1.2;
    for (const line of this.speedLines) {
      ctx.beginPath();
      ctx.moveTo(line.x, line.y);
      ctx.lineTo(line.x + line.length, line.y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Render shockwave rings
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200, 240, 255, ${sw.currentAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Render vapor trails & ground dust
    for (const p of this.particles) {
      if (p.type === 'ground_dust') {
        ctx.save();
        ctx.fillStyle = `${p.color}${p.currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'vapor_trail') {
        ctx.save();
        ctx.fillStyle = `rgba(220, 240, 255, ${p.currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.currentSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. Render cold-gas plumes with soft additive screen glow
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const p of this.particles) {
      if (p.type === 'gas') {
        const rad = Math.max(0.5, (typeof p.currentSize === 'number' && !isNaN(p.currentSize)) ? p.currentSize : (p.size || 4));
        const alpha = Math.max(0, Math.min(1, (typeof p.currentAlpha === 'number' && !isNaN(p.currentAlpha)) ? p.currentAlpha : (p.alphaStart || 0.5)));
        if (!isFinite(p.x) || !isFinite(p.y) || !isFinite(rad) || rad <= 0) continue;

        const grad = ctx.createRadialGradient(p.x, p.y, rad * 0.08, p.x, p.y, rad);
        // Pure white high-density core, cooling into translucent ice-blue
        grad.addColorStop(0, `hsla(${p.colorH}, ${p.colorS}%, 96%, ${alpha * 0.95})`);
        grad.addColorStop(0.45, `hsla(${p.colorH}, ${p.colorS}%, ${p.colorL}%, ${alpha * 0.55})`);
        grad.addColorStop(1, `hsla(${p.colorH + 10}, 80%, 85%, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 5. Render physical debris chunks
    for (const d of this.debris) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      const alpha = Math.max(0, 1 - (d.life / d.maxLife));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = d.color;
      ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
      ctx.restore();
    }

    // 6. Render screen flash on explosion
    if (this.screenFlash > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 250, 240, ${this.screenFlash * 0.75})`;
      ctx.fillRect(0, 0, CONSTANTS.VIRTUAL_WIDTH, CONSTANTS.VIRTUAL_HEIGHT);
      ctx.restore();
    }
  }
}
