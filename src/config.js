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
};
