// ============================================================================
// POWER-UP RENDERING
// Orbs, icons (pure canvas paths), shield bubble, slow-mo ghost trail / tint,
// floating popups, and the top-right HUD icons. No external assets.
// ============================================================================

import { CONSTANTS } from '../config.js';
import { drawCar } from './car-draw.js';

const TYPES = {
  shield: {
    glow: '0, 200, 255',
    core: ['#d6fbff', '#19c8ff', '#0b5fd6'],
    color: '#00e5ff'
  },
  slowmo: {
    glow: '160, 100, 255',
    core: ['#eadcff', '#9b59ff', '#4a2bb8'],
    color: '#b388ff'
  }
};

// Shield icon: heart-less heater shape with a check mark. Centered on (x, y), half-height s.
export function drawShieldIcon(ctx, x, y, s, color = '#ffffff') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.82, -s * 0.62);
  ctx.quadraticCurveTo(s * 0.82, s * 0.34, 0, s);
  ctx.quadraticCurveTo(-s * 0.82, s * 0.34, -s * 0.82, -s * 0.62);
  ctx.closePath();
  ctx.fill();

  // Check mark cut-out
  ctx.strokeStyle = 'rgba(10, 30, 70, 0.85)';
  ctx.lineWidth = Math.max(1, s * 0.2);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-s * 0.32, 0);
  ctx.lineTo(-s * 0.06, s * 0.28);
  ctx.lineTo(s * 0.36, -s * 0.24);
  ctx.stroke();
  ctx.restore();
}

// Hourglass icon: two triangles, end caps and a little sand pile. Centered on (x, y).
export function drawHourglassIcon(ctx, x, y, s, color = '#ffffff') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, s * 0.18);
  ctx.lineCap = 'round';

  // End caps
  ctx.beginPath();
  ctx.moveTo(-s * 0.7, -s);
  ctx.lineTo(s * 0.7, -s);
  ctx.moveTo(-s * 0.7, s);
  ctx.lineTo(s * 0.7, s);
  ctx.stroke();

  // Glass bulbs
  ctx.globalAlpha *= 0.55;
  ctx.beginPath();
  ctx.moveTo(-s * 0.55, -s);
  ctx.lineTo(s * 0.55, -s);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.moveTo(-s * 0.55, s);
  ctx.lineTo(s * 0.55, s);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha /= 0.55;

  // Sand pile in the lower bulb
  ctx.beginPath();
  ctx.moveTo(-s * 0.4, s * 0.9);
  ctx.lineTo(s * 0.4, s * 0.9);
  ctx.lineTo(0, s * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawIcon(ctx, type, x, y, s, color) {
  if (type === 'shield') drawShieldIcon(ctx, x, y, s, color);
  else drawHourglassIcon(ctx, x, y, s, color);
}

// Collectible orb: soft pulsing glow, gentle bob, icon in the middle
export function drawOrbs(ctx, orbs, time) {
  const R = CONSTANTS.POWERUP_ORB_RADIUS;
  for (const orb of orbs) {
    const t = TYPES[orb.type];
    const bob = Math.sin(time * CONSTANTS.POWERUP_BOB_SPEED + orb.phase) * CONSTANTS.POWERUP_BOB_AMPLITUDE;
    const pulse = 0.5 + 0.5 * Math.sin(time * 3.2 + orb.phase);
    const x = orb.x;
    const y = orb.y + bob;

    ctx.save();

    // Soft pulsing glow halo
    const glowR = R * (2.0 + 0.45 * pulse);
    const glow = ctx.createRadialGradient(x, y, R * 0.3, x, y, glowR);
    glow.addColorStop(0, `rgba(${t.glow}, ${0.45 + 0.25 * pulse})`);
    glow.addColorStop(1, `rgba(${t.glow}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Orb body
    const body = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.1, x, y, R);
    body.addColorStop(0, t.core[0]);
    body.addColorStop(0.5, t.core[1]);
    body.addColorStop(1, t.core[2]);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 + 0.3 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawIcon(ctx, orb.type, x, y, R * 0.55, '#ffffff');
    ctx.restore();
  }
}

// Translucent cyan bubble: pulse, shimmer sweep, faint hex pattern. Flickers while dissolving.
export function drawShieldBubble(ctx, car, pm) {
  if (!pm.isShieldVisible()) return;

  const breaking = !pm.hasShield && pm.shieldBreakTimer > 0;
  const k = breaking ? pm.shieldBreakTimer / CONSTANTS.SHIELD_BREAK_TIME : 1; // 1 -> 0 while dissolving
  const flicker = breaking ? (Math.random() < 0.5 ? 0.15 : 1) * k : 1;
  const pulse = 1 + 0.03 * Math.sin(pm.realTime * 4.2) + pm.shieldPulse * 0.12;
  const scale = pulse * (breaking ? 1 + (1 - k) * 0.3 : 1);
  const rx = 46 * scale;
  const ry = 27 * scale;
  const a = flicker;

  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle * 0.5);

  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);

  const fill = ctx.createRadialGradient(0, 0, rx * 0.25, 0, 0, rx);
  fill.addColorStop(0, `rgba(0, 200, 255, ${0.03 * a})`);
  fill.addColorStop(1, `rgba(0, 215, 255, ${0.28 * a})`);
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.strokeStyle = `rgba(130, 240, 255, ${0.8 * a})`;
  ctx.lineWidth = 1.6;
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur = 10 * a;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Everything below is clipped to the bubble
  ctx.save();
  ctx.clip();

  // Faint hex pattern
  const hs = 8; // hex radius
  const hw = Math.sqrt(3) * hs;
  ctx.strokeStyle = `rgba(170, 248, 255, ${0.17 * a})`;
  ctx.lineWidth = 0.7;
  let row = 0;
  for (let hy = -ry - hs; hy < ry + hs; hy += hs * 1.5, row++) {
    const offsetX = (row % 2) * (hw / 2);
    for (let hx = -rx - hw + offsetX; hx < rx + hw; hx += hw) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = Math.PI / 6 + i * Math.PI / 3;
        const px = hx + Math.cos(ang) * hs;
        const py = hy + Math.sin(ang) * hs;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Shimmer sweep
  const span = rx * 2 + 40;
  const sx = ((pm.realTime * 55) % span) - rx - 20;
  const shimmer = ctx.createLinearGradient(sx - 16, 0, sx + 16, 0);
  shimmer.addColorStop(0, 'rgba(255, 255, 255, 0)');
  shimmer.addColorStop(0.5, `rgba(255, 255, 255, ${0.22 * a})`);
  shimmer.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(sx - 16, -ry, 32, ry * 2);
  ctx.restore();

  ctx.restore();
}

// Ghost images + light streaks behind the car while slow-mo is active
export function drawSlowMoTrail(ctx, car, pm) {
  if (pm.ghosts.length === 0 && pm.slowBlend <= 0.01) return;

  for (const g of pm.ghosts) {
    const life = 1 - g.age / CONSTANTS.SLOWMO_GHOST_LIFE;
    ctx.save();
    ctx.globalAlpha = Math.max(0, life) * 0.32;
    ctx.translate(g.x, g.y);
    ctx.rotate(g.angle);
    drawCar(ctx, car.carDef, g.wheel);
    ctx.restore();
  }

  if (pm.slowBlend > 0.01) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      const len = (46 + Math.abs(i) * -10 + 22 * Math.sin(pm.realTime * 9 + i)) * pm.slowBlend;
      const sy = car.y + i * 6;
      const grad = ctx.createLinearGradient(car.x - 34 - len, 0, car.x - 34, 0);
      grad.addColorStop(0, 'rgba(150, 110, 255, 0)');
      grad.addColorStop(1, `rgba(190, 160, 255, ${0.4 * pm.slowBlend})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(car.x - 34 - len, sy);
      ctx.lineTo(car.x - 34, sy);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// Purple-blue wash + vignette while slow-mo is blended in
export function drawSlowMoTint(ctx, pm) {
  const b = pm.slowBlend;
  if (b <= 0.001) return;
  const W = CONSTANTS.VIRTUAL_WIDTH;
  const H = CONSTANTS.VIRTUAL_HEIGHT;

  ctx.save();
  ctx.fillStyle = `rgba(70, 50, 190, ${0.1 * b})`;
  ctx.fillRect(0, 0, W, H);

  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7);
  vig.addColorStop(0, 'rgba(40, 20, 120, 0)');
  vig.addColorStop(1, `rgba(95, 65, 230, ${0.34 * b})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Floating "SHIELD!" / "SLOW-MO!" popups + top-right active power-up icons
export function drawPowerUpOverlay(ctx, pm, phase) {
  // Popups
  for (const p of pm.popups) {
    const progress = 1 - p.life / CONSTANTS.POWERUP_POPUP_TIME;
    const alpha = Math.min(1, p.life / 0.3);
    const t = TYPES[p.type];
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillText(p.text, p.x, p.y - progress * 42);
    ctx.restore();
  }

  if (phase !== 'PLAYING') return;

  // HUD icons, laid out right-to-left under the mute label
  const W = CONSTANTS.VIRTUAL_WIDTH;
  const cy = 58;
  let cx = W - 32;
  const r = 16;

  if (pm.hasShield) {
    ctx.save();
    ctx.fillStyle = 'rgba(12, 16, 26, 0.82)';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    drawShieldIcon(ctx, cx, cy, 8.5, '#7df3ff');
    ctx.restore();
    cx -= r * 2 + 10;
  }

  if (pm.isSlowMoActive()) {
    const remaining = pm.slowRemaining;
    const warning = remaining <= CONSTANTS.SLOWMO_WARNING_TIME;
    const flash = warning ? (Math.sin(pm.realTime * 18) > 0 ? 1 : 0.25) : 1;

    ctx.save();
    ctx.globalAlpha = flash;
    ctx.fillStyle = 'rgba(12, 16, 26, 0.82)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Track ring
    ctx.strokeStyle = 'rgba(179, 136, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Circular countdown
    ctx.strokeStyle = warning ? '#ff6b9d' : '#b388ff';
    ctx.shadowColor = warning ? '#ff6b9d' : '#9b59ff';
    ctx.shadowBlur = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const frac = Math.max(0, Math.min(1, remaining / CONSTANTS.SLOWMO_DURATION));
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.stroke();
    ctx.shadowBlur = 0;

    drawHourglassIcon(ctx, cx, cy, 7.5, '#e3d2ff');
    ctx.restore();
  }
}
