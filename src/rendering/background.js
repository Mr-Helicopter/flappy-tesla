// ============================================================================
// BACKGROUND & PARALLAX SCENERY
// Texas desert dusk (Starbase Boca Chica vibe): gradient sky, twinkling stars,
// distant mesa silhouettes, Starbase horizon with Starship easter egg silhouette.
// ============================================================================

import { CONSTANTS } from '../config.js';

export class Background {
  constructor() {
    this.stars = [];
    this.mesaOffset = 0;
    this.starbaseOffset = 0;
    this.groundOffset = 0;

    // Seed 60 twinkling stars in the upper sky
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * CONSTANTS.VIRTUAL_WIDTH,
        y: Math.random() * (CONSTANTS.VIRTUAL_HEIGHT * 0.45),
        size: Math.random() * 1.5 + 0.6,
        baseAlpha: Math.random() * 0.5 + 0.35,
        twinkleSpeed: Math.random() * 2.5 + 1.2,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  update(dt, isPlaying, currentSpeed = CONSTANTS.BASE_SCROLL_SPEED) {
    const speed = isPlaying ? currentSpeed : currentSpeed * 0.35;

    // Parallax scroll rates (scale smoothly with current world speed)
    this.mesaOffset = (this.mesaOffset + speed * 0.08 * dt) % CONSTANTS.VIRTUAL_WIDTH;
    this.starbaseOffset = (this.starbaseOffset + speed * 0.22 * dt) % CONSTANTS.VIRTUAL_WIDTH;
    this.groundOffset = (this.groundOffset + speed * dt) % 60;
  }

  render(ctx, time) {
    const W = CONSTANTS.VIRTUAL_WIDTH;
    const H = CONSTANTS.VIRTUAL_HEIGHT;
    const groundY = H - CONSTANTS.GROUND_HEIGHT;

    // 1. Rich Texas Desert Dusk Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0.00, '#0a0818'); // Deep cosmic indigo twilight
    skyGrad.addColorStop(0.35, '#22112e'); // Dusk purple
    skyGrad.addColorStop(0.65, '#5c1b3c'); // Magenta dusk
    skyGrad.addColorStop(0.85, '#99393a'); // Coral dusk
    skyGrad.addColorStop(0.96, '#dd6b33'); // Texas sunset amber
    skyGrad.addColorStop(1.00, '#f5a452'); // Golden horizon glow

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, groundY);

    // 2. Procedural Twinkling Stars in Upper Sky
    for (const star of this.stars) {
      const alpha = star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.phase) * 0.25;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    // 3. Layer 1: Distant Texas Mesas Silhouette (0.08x scroll)
    ctx.save();
    ctx.fillStyle = '#3a1835';
    this.drawMesaLayer(ctx, this.mesaOffset, groundY - 48, W);
    ctx.restore();

    // 4. Layer 2: Starbase Boca Chica Industrial Horizon (0.22x scroll)
    ctx.save();
    ctx.fillStyle = '#201227';
    this.drawStarbaseHorizon(ctx, this.starbaseOffset, groundY, W, time);
    ctx.restore();

    // 5. Foreground Desert Ground & Starbase Launch Pad Tarmac (1.0x scroll)
    this.drawGround(ctx, groundY, W, CONSTANTS.GROUND_HEIGHT);
  }

  drawMesaLayer(ctx, offset, baseY, W) {
    // Repeat twice to wrap seamlessly
    for (let s = -1; s <= 1; s++) {
      const ox = s * W - offset;
      ctx.beginPath();
      ctx.moveTo(ox, baseY + 60);
      ctx.lineTo(ox, baseY - 12);
      ctx.lineTo(ox + 90, baseY - 14);
      ctx.lineTo(ox + 160, baseY + 4);
      ctx.lineTo(ox + 250, baseY - 24);
      ctx.lineTo(ox + 380, baseY - 26);
      ctx.lineTo(ox + 460, baseY + 8);
      ctx.lineTo(ox + 570, baseY - 8);
      ctx.lineTo(ox + 690, baseY - 30);
      ctx.lineTo(ox + 820, baseY - 32);
      ctx.lineTo(ox + 910, baseY + 2);
      ctx.lineTo(ox + W, baseY - 10);
      ctx.lineTo(ox + W, baseY + 60);
      ctx.closePath();
      ctx.fill();
    }
  }

  drawStarbaseHorizon(ctx, offset, groundY, W, time) {
    for (let s = -1; s <= 1; s++) {
      const ox = s * W - offset;

      // Giant High Bay / Mega Bay assembly buildings
      ctx.fillRect(ox + 110, groundY - 78, 68, 78);
      ctx.fillRect(ox + 185, groundY - 95, 76, 95);

      // Crawler crane silhouette
      ctx.beginPath();
      ctx.moveTo(ox + 300, groundY);
      ctx.lineTo(ox + 350, groundY - 105);
      ctx.lineTo(ox + 353, groundY - 105);
      ctx.lineTo(ox + 325, groundY);
      ctx.fill();

      // Starbase orbital tank farm (spherical LOX/methane cryo tanks)
      ctx.beginPath();
      ctx.arc(ox + 430, groundY - 18, 22, Math.PI, 0, false);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ox + 475, groundY - 16, 18, Math.PI, 0, false);
      ctx.fill();

      // ----------------------------------------------------------------------
      // EASTER EGG: Starship & Super Heavy stack standing on the launch mount!
      // Distinctive aerodynamic stainless-steel silhouette with forward/aft flaps
      // ----------------------------------------------------------------------
      const shipX = ox + 680;
      const shipW = 16;
      const boosterH = 65;
      const shipH = 46;
      const totalH = boosterH + shipH;
      const topY = groundY - totalH;

      // Super Heavy Booster
      ctx.fillRect(shipX, groundY - boosterH, shipW, boosterH);

      // Starship upper stage
      ctx.fillRect(shipX, topY + 12, shipW, shipH - 12);
      // Aerodynamic conical nosecone
      ctx.beginPath();
      ctx.moveTo(shipX, topY + 12);
      ctx.lineTo(shipX + shipW / 2, topY);
      ctx.lineTo(shipX + shipW, topY + 12);
      ctx.closePath();
      ctx.fill();

      // Forward flaps (fins)
      ctx.fillRect(shipX - 4, topY + 14, 4, 8);
      ctx.fillRect(shipX + shipW, topY + 14, 4, 8);

      // Aft flaps (fins)
      ctx.fillRect(shipX - 6, groundY - boosterH + 2, 6, 16);
      ctx.fillRect(shipX + shipW, groundY - boosterH + 2, 6, 16);

      // Flashing FAA aviation beacon on the tip of Starship
      const beaconOn = Math.sin(time * 4.0) > 0.1;
      ctx.fillStyle = beaconOn ? '#ff3333' : '#300808';
      ctx.beginPath();
      ctx.arc(shipX + shipW / 2, topY - 1, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#201227'; // Restore silhouette color
    }
  }

  drawGround(ctx, groundY, W, groundHeight) {
    ctx.save();

    // Top ground curb / asphalt edge
    ctx.fillStyle = '#1e1c24';
    ctx.fillRect(0, groundY, W, groundHeight);

    // Starbase concrete pad expansion slab joints
    ctx.strokeStyle = '#2d2b38';
    ctx.lineWidth = 2;
    for (let x = -this.groundOffset; x < W + 60; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x, groundY + groundHeight);
      ctx.stroke();
    }

    // Yellow launch taxiway dashed stripe
    ctx.fillStyle = '#e5a522';
    const dashW = 34;
    const dashGap = 26;
    const totalDash = dashW + dashGap;
    const shiftX = this.groundOffset % totalDash;

    for (let x = -shiftX; x < W + totalDash; x += totalDash) {
      ctx.fillRect(x, groundY + 12, dashW, 3.5);
    }

    // Sandy Texas desert shoulder along bottom
    ctx.fillStyle = '#15131a';
    ctx.fillRect(0, groundY + groundHeight - 14, W, 14);

    ctx.restore();
  }
}
