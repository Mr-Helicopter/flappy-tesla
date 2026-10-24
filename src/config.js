// ============================================================================
// CONFIGURATION & TUNING CONSTANTS
// Physics, world geometry, obstacle dimensions, vehicles, and Supabase config.
// ============================================================================

// Supabase Project Credentials (read from environment variables with fallback defaults)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pvhisjumqnhnfzrpzafy.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aGlzanVtcW5obmZ6cnB6YWZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1OTc1ODMsImV4cCI6MjEwODE3MzU4M30.W3Kc9w_JicjZgdFgGLbce_hGwxV2dUMhFoXd1VIM0x0';

// ============================================================================
// CAR DEFINITIONS (COSMETIC ONLY - EXACT SAME HITBOX, PHYSICS & SPEED)
// Edit prices and visual parameters easily below:
// ============================================================================
export const CARS = [
  {
    id: 'roadster',
    name: 'Tesla Roadster',
    subtitle: 'SpaceX Cold-Gas Flight Package',
    price: 0,
    colorName: 'Metallic Red',
    type: 'roadster',
    underNozzle: { x: -4, y: 8, angleOffset: 0.12 },
    rearNozzle: { x: -33, y: 4, angleOffset: 0.22 },
    spoilerOffset: { x: -31, y: -7 },
    wheelXFront: 19,
    wheelXRear: -20,
    wheelY: 6.5
  },
  {
    id: 'suv',
    name: 'MG ZS Sport',
    subtitle: 'Tribute to myself duh',
    price: 50,
    colorName: 'Stealth Grey',
    type: 'suv',
    underNozzle: { x: -3, y: 8, angleOffset: 0.12 },
    rearNozzle: { x: -33, y: 4, angleOffset: 0.20 },
    spoilerOffset: { x: -30, y: -10 },
    wheelXFront: 19,
    wheelXRear: -20,
    wheelY: 6.5
  },
  {
    id: 'minivan',
    name: 'Mitsubishi Montero Sport',
    subtitle: 'Tribute to Caite',
    price: 120,
    colorName: 'Pearl White',
    type: 'minivan',
    underNozzle: { x: -3, y: 8, angleOffset: 0.12 },
    rearNozzle: { x: -33, y: 4, angleOffset: 0.22 },
    spoilerOffset: { x: -32, y: -8 },
    wheelXFront: 19,
    wheelXRear: -20,
    wheelY: 6.5
  },
  {
    id: 'hatchback',
    name: 'Gen 2',
    subtitle: 'Tribute to myself (again)',
    price: 250,
    colorName: 'Electric Yellow',
    type: 'hatchback',
    underNozzle: { x: -4, y: 8, angleOffset: 0.12 },
    rearNozzle: { x: -31, y: 4, angleOffset: 0.22 },
    spoilerOffset: { x: -28, y: -8 },
    wheelXFront: 18,
    wheelXRear: -19,
    wheelY: 6.5
  },
  {
    id: 'supercar',
    name: 'Orange Supercar',
    subtitle: 'V10 Hypersonic car',
    price: 500,
    colorName: 'Volcano Orange',
    type: 'supercar',
    underNozzle: { x: -5, y: 8, angleOffset: 0.12 },
    rearNozzle: { x: -34, y: 4, angleOffset: 0.24 },
    spoilerOffset: { x: -32, y: -9 },
    wheelXFront: 20,
    wheelXRear: -21,
    wheelY: 6.5
  }
];

export function getCarDef(carId) {
  return CARS.find(c => c.id === carId) || CARS[0];
}

// ============================================================================
// 1. TUNING CONSTANTS
// Edit these parameters to tune the flight physics, gameplay, and obstacles.
// ============================================================================
export const CONSTANTS = {
  // Physics constants (pixels / sec^2 and pixels / sec)
  GRAVITY: 980,             // Downward acceleration pulling the car
  THRUST_ACCEL: 1950,       // Upward acceleration applied continuously while holding SPACE
  MAX_FALL_SPEED: 520,      // Terminal downward velocity (smooth clamp)
  MAX_CLIMB_SPEED: -420,    // Terminal upward climb velocity (smooth clamp)

  // World & obstacle geometry
  BASE_SCROLL_SPEED: 200,       // Starting horizontal world scroll speed (km/h and pixels/sec)
  SCROLL_SPEED: 200,            // Reference base scroll speed
  SPEED_INCREASE_INTERVAL: 5,   // Increase speed every N points passed
  SPEED_STEP: 25,               // +25 km/h added every 5 points indefinitely (no top speed limit!)
  PIPE_GAP: 165,            // Vertical clearance gap between upper & lower Starbase towers
  PIPE_WIDTH: 74,           // Width of the Starbase launch tower pillars
  PIPE_SPAWN_INTERVAL: 1.95,// Seconds between new tower pair spawns at base speed
  PIPE_MIN_GAP_Y: 110,      // Minimum height of the gap center from ceiling
  PIPE_MAX_GAP_Y: 410,      // Maximum height of the gap center from ground
  GROUND_HEIGHT: 50,        // Height of the Starbase tarmac & desert ground
  CEILING_HEIGHT: 12,       // Top boundary ceiling buffer

  // Pillar spacing adjustments at high scores (score >= 60)
  PILLAR_SPACING_SCORE_THRESHOLD: 60, // Score threshold to activate more spaced out pillars
  PILLAR_SPACING_MULTIPLIER: 1.20,     // +20% horizontal distance between consecutive pillar pairs
  PILLAR_GAP_MULTIPLIER: 1.20,         // +20% vertical clearance gap between upper & lower pillars

  // Car sprite & hitbox configuration
  CAR_WIDTH: 68,            // Visual width of Tesla Roadster
  CAR_HEIGHT: 21,           // Visual height of Tesla Roadster
  HITBOX_INSET_X: 7,        // Hitbox horizontal safety padding (smaller than sprite)
  HITBOX_INSET_Y: 5,        // Hitbox vertical safety padding

  // Virtual canvas resolution (16:9 widescreen retro arcade aspect ratio)
  VIRTUAL_WIDTH: 960,
  VIRTUAL_HEIGHT: 540,

  // Thruster timing
  THRUST_RAMP_UP: 0.035,    // Seconds for thrusters to reach full output
  THRUST_RAMP_DOWN: 0.150,  // Seconds for thruster plumes to taper off after release

  // ------------------------------------------------------------------------
  // POWER-UPS (Shield & Slow Motion) - identical for every car in the shop
  // ------------------------------------------------------------------------
  // Spawn rules (evaluated once per new pillar gap)
  POWERUP_SPAWN_CHANCE: 0.20,     // Roll per eligible gap. Because a gap right after a power-up is
                                  // never eligible, 0.20 works out to ~1 power-up per 6 gaps overall.
  POWERUP_MIN_SCORE: 3,           // No power-ups spawn while score < this value
  POWERUP_SHIELD_CHANCE: 0.5,     // Shield vs Slow-Mo split (0.5 = 50/50)
  POWERUP_ORB_RADIUS: 14,         // Visual radius of the collectible orb
  POWERUP_PICKUP_RADIUS: 24,      // Generous pickup distance from orb centre to the car hitbox
  POWERUP_BOB_AMPLITUDE: 4,       // Gentle vertical bobbing (px)
  POWERUP_BOB_SPEED: 2.4,         // Bobbing speed (rad/s)
  POWERUP_GAP_PADDING: 8,         // Extra clearance between the orb and the pillar tips
  POWERUP_POPUP_TIME: 1.0,        // Seconds the floating "SHIELD!" / "SLOW-MO!" popup lasts

  // Shield: absorbs ONE pillar hit (never ground / ceiling), no timer
  SHIELD_INVINCIBILITY: 1.0,      // Seconds of pillar invincibility after absorbing a hit (car blinks)
  SHIELD_BREAK_TIME: 0.25,        // Seconds the bubble flickers / dissolves after absorbing a hit
  SHIELD_KNOCKBACK_VY: 180,       // Vertical nudge (px/s) toward the gap centre
  SHIELD_KNOCKBACK_VX: 520,       // Horizontal nudge (px/s) pushing the car back; springs home
  SHIELD_KNOCKBACK_SPRING: 60,    // Spring stiffness pulling the car back to its flight lane

  // Slow Motion: global timeScale applied to every gameplay delta-time
  SLOWMO_DURATION: 5,             // Seconds (real time) the effect lasts
  SLOWMO_TIME_SCALE: 0.5,         // World speed multiplier at full effect
  SLOWMO_EASE_IN: 0.25,           // Seconds to ease into slow-mo
  SLOWMO_EASE_OUT: 0.5,           // Seconds to ease back out (during the last part of the timer)
  SLOWMO_WARNING_TIME: 1.0,       // HUD icon flashes during the final N seconds
  SLOWMO_AUDIO_RATE_DROP: 0.25,   // Thruster hiss playback rate drops by this fraction at full effect
  SLOWMO_AUDIO_FILTER_DROP: 0.35, // Thruster hiss filter frequency drops by this fraction at full effect
  SLOWMO_GHOST_INTERVAL: 0.035,   // Seconds between ghost-trail samples while active
  SLOWMO_GHOST_LIFE: 0.4,         // Seconds each ghost image lingers
};
