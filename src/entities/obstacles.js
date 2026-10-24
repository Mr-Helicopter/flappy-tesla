// ============================================================================
// STARBASE LAUNCH TOWER OBSTACLES (ObstacleManager class)
// SpaceX / Starbase launch-tower pillars (steel lattice trusses, warning stripes,
// aviation strobe beacons, caution bumpers).
// ============================================================================

import { CONSTANTS } from '../config.js';

export class ObstacleManager {
  constructor() {
    this.towers = [];
    this.spawnTimer = 0;
    this.strobeTimer = 0;
    this.spacingBoostApplied = false;
    this.onSpawn = null; // Optional hook: (tower, currentScore) => void, fired for every new pillar pair
  }

  reset() {
    this.towers = [];
    this.spawnTimer = 0.5; // Spawn first tower quickly after game start
    this.spacingBoostApplied = false;
  }

  update(dt, isPlaying, currentSpeed = CONSTANTS.BASE_SCROLL_SPEED, scoreCallback, currentScore = 0) {
    if (!isPlaying) return;

    this.strobeTimer += dt * 3.5;

    // When score first reaches the threshold (60), expand the in-flight spawn timer immediately
    const isSpacingBoosted = currentScore >= CONSTANTS.PILLAR_SPACING_SCORE_THRESHOLD;
    if (isSpacingBoosted && !this.spacingBoostApplied) {
      this.spacingBoostApplied = true;
      this.spawnTimer *= CONSTANTS.PILLAR_SPACING_MULTIPLIER;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTowerPair(currentScore);
      // Dynamically adjust spawn timer so spatial distance between towers remains steady as speed increases
      // After score reaches 60, distance between pillars is 20% more spaced out
      const spacingMult = isSpacingBoosted ? CONSTANTS.PILLAR_SPACING_MULTIPLIER : 1.0;
      const targetDistance = (CONSTANTS.PIPE_SPAWN_INTERVAL * CONSTANTS.BASE_SCROLL_SPEED) * spacingMult;
      const spawnInterval = targetDistance / currentSpeed;
      this.spawnTimer = spawnInterval;
    }

    for (let i = this.towers.length - 1; i >= 0; i--) {
      const tower = this.towers[i];
      tower.x -= currentSpeed * dt;

      // Score trigger: when the car passes the tower center
      if (!tower.passed && tower.x + CONSTANTS.PIPE_WIDTH / 2 < 220) {
        tower.passed = true;
        if (scoreCallback) scoreCallback();
      }

      // Despawn towers once fully off the left edge of the screen
      if (tower.x + CONSTANTS.PIPE_WIDTH < -20) {
        this.towers.splice(i, 1);
      }
    }
  }

  spawnTowerPair(currentScore = 0) {
    const isSpacingBoosted = currentScore >= CONSTANTS.PILLAR_SPACING_SCORE_THRESHOLD;
    const gapMultiplier = isSpacingBoosted ? CONSTANTS.PILLAR_GAP_MULTIPLIER : 1.0;
    const gapHeight = CONSTANTS.PIPE_GAP * gapMultiplier;

    // Adjust min and max gap Y bounds to ensure upper and lower pillars remain visible and safe
    const halfGap = gapHeight / 2;
    const minGapY = Math.max(CONSTANTS.CEILING_HEIGHT + halfGap + 12, CONSTANTS.PIPE_MIN_GAP_Y);
    const maxGapY = Math.min((CONSTANTS.VIRTUAL_HEIGHT - CONSTANTS.GROUND_HEIGHT) - halfGap - 12, CONSTANTS.PIPE_MAX_GAP_Y);

    // Random gap center between safe bounds
    const gapY = minGapY + Math.random() * (maxGapY - minGapY);

    const tower = {
      x: CONSTANTS.VIRTUAL_WIDTH + 20,
      gapY: gapY,
      gapHeight: gapHeight,
      width: CONSTANTS.PIPE_WIDTH,
      passed: false
    };
    this.towers.push(tower);
    if (this.onSpawn) this.onSpawn(tower, currentScore);
  }

  // Ceiling and ground boundaries (a Shield never protects against these)
  hitsBounds(carHitbox) {
    const groundY = CONSTANTS.VIRTUAL_HEIGHT - CONSTANTS.GROUND_HEIGHT;
    if (carHitbox.top <= CONSTANTS.CEILING_HEIGHT) return true;
    if (carHitbox.bottom >= groundY) return true;
    return false;
  }

  // Returns { tower, side: 'top' | 'bottom' } for the first pillar the hitbox overlaps, else null
  getPillarHit(carHitbox) {
    for (const t of this.towers) {
      const tLeft = t.x;
      const tRight = t.x + t.width;
      const gapTop = t.gapY - t.gapHeight / 2;
      const gapBottom = t.gapY + t.gapHeight / 2;

      // Check horizontal overlap with tower
      if (carHitbox.right > tLeft && carHitbox.left < tRight) {
        // Check if hitting upper tower or lower tower
        if (carHitbox.top < gapTop) return { tower: t, side: 'top' };
        if (carHitbox.bottom > gapBottom) return { tower: t, side: 'bottom' };
      }
    }
    return null;
  }

  // Check collision between car hitbox and towers
  checkCollision(carHitbox) {
    return this.hitsBounds(carHitbox) || this.getPillarHit(carHitbox) !== null;
  }

  render(ctx) {
    const groundY = CONSTANTS.VIRTUAL_HEIGHT - CONSTANTS.GROUND_HEIGHT;
    const isStrobeOn = Math.sin(this.strobeTimer) > 0.3;

    for (const t of this.towers) {
      const gapTop = t.gapY - t.gapHeight / 2;
      const gapBottom = t.gapY + t.gapHeight / 2;

      // 1. Draw Upper Starbase Tower Segment (hanging down from ceiling)
      this.drawTowerSegment(ctx, t.x, 0, t.width, gapTop, true, isStrobeOn);

      // 2. Draw Lower Starbase Tower Segment (rising up from tarmac)
      this.drawTowerSegment(ctx, t.x, gapBottom, t.width, groundY - gapBottom, false, isStrobeOn);
    }
  }

  drawTowerSegment(ctx, x, y, width, height, isUpper, isStrobeOn) {
    if (height <= 2) return;

    ctx.save();

    // Outer steel girder structure
    ctx.fillStyle = '#1c212b';
    ctx.fillRect(x, y, width, height);

    // Steel vertical support columns (left, center, right)
    ctx.fillStyle = '#2d3545';
    ctx.fillRect(x + 2, y, 7, height);
    ctx.fillRect(x + width / 2 - 3.5, y, 7, height);
    ctx.fillRect(x + width - 9, y, 7, height);

    // High-tech internal lattice cross-bracing (X-trusses)
    ctx.strokeStyle = '#3d485e';
    ctx.lineWidth = 2.2;
    const trussStep = 34;
    const numSteps = Math.ceil(height / trussStep);

    for (let i = 0; i < numSteps; i++) {
      const sy = y + i * trussStep;
      const ey = Math.min(y + height, sy + trussStep);

      // Horizontal steel crossbar
      ctx.beginPath();
      ctx.moveTo(x + 2, sy);
      ctx.lineTo(x + width - 2, sy);
      ctx.stroke();

      // Diagonal X cross struts
      ctx.beginPath();
      ctx.moveTo(x + 4, sy);
      ctx.lineTo(x + width - 4, ey);
      ctx.moveTo(x + width - 4, sy);
      ctx.lineTo(x + 4, ey);
      ctx.stroke();
    }

    // Tower tip collision bumper facing the flight corridor
    const bumperH = 14;
    const bumperY = isUpper ? y + height - bumperH : y;

    // Heavy industrial bumper head
    ctx.fillStyle = '#141820';
    ctx.fillRect(x - 2, bumperY, width + 4, bumperH);

    // Alternating yellow/black caution hazard stripes on bumper head
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 2, bumperY, width + 4, bumperH);
    ctx.clip();
    ctx.fillStyle = '#f1c40f';
    const stripeW = 9;
    for (let sx = -stripeW * 2; sx < width + stripeW * 4; sx += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x + sx, bumperY);
      ctx.lineTo(x + sx + stripeW, bumperY);
      ctx.lineTo(x + sx, bumperY + bumperH);
      ctx.lineTo(x + sx - stripeW, bumperY + bumperH);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Aviation warning band (SpaceX red & white launch tower markings)
    const bandY = isUpper ? y + height - 36 : y + 16;
    if (height > 45) {
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(x, bandY, width, 10);
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(x, bandY + 10, width, 10);
    }

    // Red aircraft warning strobe LED beacon on tower tip
    const beaconX = isUpper ? x + 6 : x + width - 6;
    const beaconY = isUpper ? y + height - 2 : y + 2;

    ctx.fillStyle = isStrobeOn ? '#ff2a2a' : '#5a1010';
    if (isStrobeOn) {
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10;
    }
    ctx.beginPath();
    ctx.arc(beaconX, beaconY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    ctx.restore();
  }
}
