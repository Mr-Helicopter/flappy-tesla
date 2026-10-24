// ============================================================================
// CAR VECTOR GRAPHICS RENDERING
// High-detail canvas vector bodies, aerodynamic glass canopies, wheels, and LED lights.
// All 5 cars share the EXACT same physics, hitbox (54x11px), terminal velocities,
// cold-gas thruster plumes, and tilt smoothing for 100% gameplay parity.
// ============================================================================

// Universal performance wheel with spinning alloy spokes
export function drawWheel(ctx, x, y, rotation, caliperColor = '#e81123', spokeColor = '#95a5a6') {
  ctx.save();
  ctx.translate(x, y);

  // Dark wheel well cutout behind tire
  ctx.fillStyle = '#0a0910';
  ctx.beginPath();
  ctx.arc(0, -1, 6.8, Math.PI, 0, false);
  ctx.fill();

  // Outer rubber performance tire
  ctx.fillStyle = '#1c1c20';
  ctx.beginPath();
  ctx.arc(0, 0, 6.2, 0, Math.PI * 2);
  ctx.fill();

  // Tire sidewall rim
  ctx.strokeStyle = '#2d2d34';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 5.2, 0, Math.PI * 2);
  ctx.stroke();

  // Performance brake caliper
  ctx.fillStyle = caliperColor;
  ctx.fillRect(-2, -4.5, 3.5, 2);

  // Spinning alloy spokes
  ctx.rotate(rotation);
  ctx.strokeStyle = spokeColor;
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const ang = (i * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(ang) * 4.2, Math.sin(ang) * 4.2);
    ctx.stroke();
  }

  // Center chrome hub cap
  ctx.fillStyle = '#ecf0f1';
  ctx.beginPath();
  ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// 1. TESLA ROADSTER 2.0 (Metallic Red Sports Car)
export function drawRoadsterBody(ctx) {
  // Underbody diffuser & splitter
  ctx.fillStyle = '#141416';
  ctx.beginPath();
  ctx.moveTo(-33, 7);
  ctx.lineTo(31, 7);
  ctx.lineTo(34, 6);
  ctx.lineTo(28, 4);
  ctx.lineTo(-32, 4);
  ctx.closePath();
  ctx.fill();

  // Thruster nozzle titanium canisters
  ctx.fillStyle = '#485460';
  ctx.fillRect(-33, 2, 4, 5); // Rear
  ctx.fillRect(-7, 6, 6, 3);  // Underbody

  // Main Body: Tesla Multi-coat Metallic Red
  const bodyGrad = ctx.createLinearGradient(0, -10, 0, 8);
  bodyGrad.addColorStop(0, '#ff3848');
  bodyGrad.addColorStop(0.35, '#d61122');
  bodyGrad.addColorStop(0.85, '#a60a17');
  bodyGrad.addColorStop(1, '#5c050d');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(33, 5);
  ctx.quadraticCurveTo(34, 1, 31, -1);
  ctx.lineTo(13, -3);
  ctx.lineTo(2, -9);
  ctx.quadraticCurveTo(-10, -11, -18, -6);
  ctx.lineTo(-27, -4);
  ctx.lineTo(-32, -5);
  ctx.lineTo(-33, -3);
  ctx.quadraticCurveTo(-33, 2, -31, 6);
  ctx.lineTo(26, 6);
  ctx.closePath();
  ctx.fill();

  // Glass Canopy
  const glassGrad = ctx.createLinearGradient(-10, -11, 5, -2);
  glassGrad.addColorStop(0, '#1a2233');
  glassGrad.addColorStop(0.6, '#0f1420');
  glassGrad.addColorStop(1, '#27384e');
  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.moveTo(11, -3);
  ctx.lineTo(1, -8.5);
  ctx.quadraticCurveTo(-10, -10.2, -18, -5.5);
  ctx.lineTo(-21, -3.5);
  ctx.lineTo(9, -2.5);
  ctx.closePath();
  ctx.fill();

  // Windshield specular gleam
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, -8);
  ctx.lineTo(7, -3.5);
  ctx.stroke();

  // Driver silhouette
  ctx.fillStyle = '#0a0d14';
  ctx.beginPath();
  ctx.arc(-5, -5.5, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Shoulder contour line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(12, -2.2);
  ctx.quadraticCurveTo(-12, -1, -30, -3.5);
  ctx.stroke();

  // Cyan LED Headlight
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(33, 3);
  ctx.lineTo(26, 1.5);
  ctx.lineTo(29, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Red LED Taillight
  ctx.fillStyle = '#ff2030';
  ctx.shadowColor = '#ff0020';
  ctx.shadowBlur = 8;
  ctx.fillRect(-33.5, -4, 2.2, 3);
  ctx.shadowBlur = 0;
}

// 2. GREY CYBER SUV (Boxy tall body, roof rack, rugged skid plate)
export function drawSUVBody(ctx) {
  // Underbody rugged skid plate
  ctx.fillStyle = '#10141a';
  ctx.beginPath();
  ctx.moveTo(-33, 7);
  ctx.lineTo(31, 7);
  ctx.lineTo(33, 6);
  ctx.lineTo(27, 4);
  ctx.lineTo(-32, 4);
  ctx.closePath();
  ctx.fill();

  // Titanium thruster nozzles
  ctx.fillStyle = '#485460';
  ctx.fillRect(-33, 2, 4, 5); // Rear
  ctx.fillRect(-6, 6, 6, 3);  // Underbody

  // Main Body: Stealth Grey Gradient
  const bodyGrad = ctx.createLinearGradient(0, -11, 0, 8);
  bodyGrad.addColorStop(0, '#8395a7');
  bodyGrad.addColorStop(0.35, '#576574');
  bodyGrad.addColorStop(0.85, '#2f3542');
  bodyGrad.addColorStop(1, '#1e272e');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Front upright fascia & angular hood
  ctx.moveTo(33, 5);
  ctx.lineTo(33, 1);
  ctx.lineTo(31, -2);
  ctx.lineTo(12, -4);
  // Steep rugged A-pillar
  ctx.lineTo(3, -10);
  // Flat tall roofline
  ctx.lineTo(-24, -10);
  // Angular rear tailgate
  ctx.lineTo(-31, -5);
  ctx.lineTo(-33, 2);
  ctx.lineTo(-31, 6);
  ctx.lineTo(27, 6);
  ctx.closePath();
  ctx.fill();

  // Roof rack rails & crossbars
  ctx.strokeStyle = '#2f3542';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-20, -12);
  ctx.lineTo(8, -12);
  ctx.stroke();
  // Stanchions
  ctx.fillStyle = '#1e272e';
  ctx.fillRect(-18, -12, 3, 2.5);
  ctx.fillRect(-6, -12, 3, 2.5);
  ctx.fillRect(5, -12, 3, 2.5);

  // SUV Side Windows: 3 dark tinted panes
  const winGrad = ctx.createLinearGradient(-10, -10, 5, -3);
  winGrad.addColorStop(0, '#151d28');
  winGrad.addColorStop(1, '#2c3e50');

  ctx.fillStyle = winGrad;
  // Front cabin window
  ctx.beginPath();
  ctx.moveTo(10, -3.5);
  ctx.lineTo(2, -9);
  ctx.lineTo(-4, -9);
  ctx.lineTo(-4, -3.5);
  ctx.closePath();
  ctx.fill();

  // Rear passenger window
  ctx.beginPath();
  ctx.moveTo(-6, -3.5);
  ctx.lineTo(-6, -9);
  ctx.lineTo(-14, -9);
  ctx.lineTo(-14, -3.5);
  ctx.closePath();
  ctx.fill();

  // Cargo quarter window
  ctx.beginPath();
  ctx.moveTo(-16, -3.5);
  ctx.lineTo(-16, -9);
  ctx.lineTo(-22, -9);
  ctx.lineTo(-28, -5);
  ctx.lineTo(-24, -3.5);
  ctx.closePath();
  ctx.fill();

  // Window gleam
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(2, -8.5);
  ctx.lineTo(6, -4);
  ctx.stroke();

  // Driver silhouette
  ctx.fillStyle = '#0b0e14';
  ctx.beginPath();
  ctx.arc(-1, -6, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Angular cyber body line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(31, -1);
  ctx.lineTo(12, -3);
  ctx.lineTo(-30, -3);
  ctx.stroke();

  // Front Laser Headlight Bar (Cyan)
  ctx.fillStyle = '#00d2d3';
  ctx.shadowColor = '#00d2d3';
  ctx.shadowBlur = 7;
  ctx.fillRect(30, 0, 3.5, 3.5);
  ctx.shadowBlur = 0;

  // Rear Full-Height Vertical LED Blade Taillight (Red)
  ctx.fillStyle = '#ff4757';
  ctx.shadowColor = '#ff4757';
  ctx.shadowBlur = 8;
  ctx.fillRect(-32, -6, 2.5, 8);
  ctx.shadowBlur = 0;
}

// 3. WHITE MINIVAN (Long rounded body, aero profile, sliding-door seam)
export function drawMinivanBody(ctx) {
  // Underbody aero tray
  ctx.fillStyle = '#1a1d24';
  ctx.beginPath();
  ctx.moveTo(-33, 7);
  ctx.lineTo(31, 7);
  ctx.lineTo(33, 6);
  ctx.lineTo(27, 4);
  ctx.lineTo(-32, 4);
  ctx.closePath();
  ctx.fill();

  // Titanium thrusters
  ctx.fillStyle = '#485460';
  ctx.fillRect(-33, 2, 4, 5); // Rear
  ctx.fillRect(-6, 6, 6, 3);  // Underbody

  // Main Body: Pearl White Gradient
  const bodyGrad = ctx.createLinearGradient(0, -10, 0, 8);
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.35, '#f1f2f6');
  bodyGrad.addColorStop(0.85, '#ced6e0');
  bodyGrad.addColorStop(1, '#747d8c');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Low rounded nose curving into sweeping aero windshield
  ctx.moveTo(33, 5);
  ctx.quadraticCurveTo(34, 1, 29, -1);
  ctx.lineTo(18, -3);
  // Smooth raked aero windshield
  ctx.lineTo(7, -8.5);
  // Gently curved spacious roofline
  ctx.quadraticCurveTo(-8, -10, -22, -8);
  // Smooth tapered rear aero hatch
  ctx.quadraticCurveTo(-30, -7, -32, 0);
  ctx.lineTo(-32, 5);
  ctx.lineTo(27, 6);
  ctx.closePath();
  ctx.fill();

  // Continuous Panoramic Glass Canopy
  const glassGrad = ctx.createLinearGradient(-10, -10, 5, -2);
  glassGrad.addColorStop(0, '#101726');
  glassGrad.addColorStop(0.6, '#1e293b');
  glassGrad.addColorStop(1, '#334155');

  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.moveTo(16, -2.5);
  ctx.lineTo(6, -8);
  ctx.quadraticCurveTo(-8, -9.2, -21, -7.5);
  ctx.lineTo(-27, -5);
  ctx.lineTo(-27, -2.5);
  ctx.closePath();
  ctx.fill();

  // Black window pillars (B-pillar and C-pillar)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, -8, 2, 6);
  ctx.fillRect(-11, -8.2, 2, 6);

  // Sliding Door Track & Panel Seam Line
  ctx.strokeStyle = '#57606f';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  // Lower sliding door runner track
  ctx.moveTo(-24, 1.5);
  ctx.lineTo(-6, 1.5);
  // Vertical sliding door shut line
  ctx.moveTo(-5, -2.5);
  ctx.lineTo(-5, 6);
  ctx.stroke();

  // Sleek chrome door handles
  ctx.fillStyle = '#2f3542';
  ctx.fillRect(-4, 0.5, 3.5, 1.2);
  ctx.fillRect(-16, 0.5, 3.5, 1.2);

  // Windshield reflection
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(6, -7.5);
  ctx.lineTo(12, -3);
  ctx.stroke();

  // Driver silhouette
  ctx.fillStyle = '#0b0f19';
  ctx.beginPath();
  ctx.arc(3, -5.5, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Modern Curved LED Matrix Headlight (Ice Blue)
  ctx.fillStyle = '#e0ffff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(33, 3);
  ctx.lineTo(27, 0.5);
  ctx.lineTo(29, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Modern Vertical Ribbon Taillight (Red)
  ctx.fillStyle = '#ff3838';
  ctx.shadowColor = '#ff3838';
  ctx.shadowBlur = 7;
  ctx.fillRect(-32.5, -4, 2.2, 7);
  ctx.shadowBlur = 0;
}

// 4. YELLOW HATCHBACK (Short compact shape, rear roof spoiler)
export function drawHatchbackBody(ctx) {
  // Underbody splitter & diffuser
  ctx.fillStyle = '#141416';
  ctx.beginPath();
  ctx.moveTo(-31, 7);
  ctx.lineTo(31, 7);
  ctx.lineTo(33, 6);
  ctx.lineTo(27, 4);
  ctx.lineTo(-30, 4);
  ctx.closePath();
  ctx.fill();

  // Titanium thrusters
  ctx.fillStyle = '#485460';
  ctx.fillRect(-31, 2, 4, 5); // Rear
  ctx.fillRect(-7, 6, 6, 3);  // Underbody

  // Main Body: Electric Yellow Metallic Gradient
  const bodyGrad = ctx.createLinearGradient(0, -9, 0, 8);
  bodyGrad.addColorStop(0, '#fff200');
  bodyGrad.addColorStop(0.35, '#ffd32a');
  bodyGrad.addColorStop(0.85, '#ff9f1a');
  bodyGrad.addColorStop(1, '#875a00');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Compact front nose & short sporty hood
  ctx.moveTo(32, 5);
  ctx.quadraticCurveTo(33, 1, 29, -1);
  ctx.lineTo(13, -3);
  // Sporty windshield
  ctx.lineTo(3, -9);
  // Compact flat roofline
  ctx.lineTo(-16, -9);
  // Extended aggressive roof spoiler
  ctx.lineTo(-27, -8.5);
  // Sharply chopped vertical rear hatch
  ctx.lineTo(-28, -4);
  ctx.lineTo(-30, 3);
  ctx.lineTo(-29, 6);
  ctx.lineTo(26, 6);
  ctx.closePath();
  ctx.fill();

  // Black contrast sport roof spoiler lip
  ctx.fillStyle = '#1e272e';
  ctx.fillRect(-28, -9.5, 10, 1.8);

  // Side Windows (Sport compact two-box greenhouse)
  const winGrad = ctx.createLinearGradient(-10, -9, 5, -2);
  winGrad.addColorStop(0, '#121824');
  winGrad.addColorStop(1, '#2c3e50');

  ctx.fillStyle = winGrad;
  ctx.beginPath();
  ctx.moveTo(11, -2.5);
  ctx.lineTo(2, -8.2);
  ctx.lineTo(-15, -8.2);
  ctx.lineTo(-22, -4);
  ctx.lineTo(-22, -2.5);
  ctx.closePath();
  ctx.fill();

  // B-pillar divider
  ctx.fillStyle = '#11141a';
  ctx.fillRect(-4, -8.2, 2.5, 6);

  // Windshield specular gleam
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, -7.5);
  ctx.lineTo(7, -3);
  ctx.stroke();

  // Driver silhouette
  ctx.fillStyle = '#0b0e14';
  ctx.beginPath();
  ctx.arc(-2, -5.5, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Sporty shoulder crease line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(28, 0);
  ctx.lineTo(12, -2);
  ctx.lineTo(-26, -2);
  ctx.stroke();

  // Aggressive Front Cat-Eye LED Headlight
  ctx.fillStyle = '#fffbe0';
  ctx.shadowColor = '#ffd32a';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(32, 3);
  ctx.lineTo(26, 1);
  ctx.lineTo(28, 3.5);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Compact Ruby 3D LED Taillight
  ctx.fillStyle = '#ff1744';
  ctx.shadowColor = '#ff1744';
  ctx.shadowBlur = 7;
  ctx.fillRect(-30, -1, 2.4, 4);
  ctx.shadowBlur = 0;
}

// 5. ORANGE SUPERCAR (Very low wedge shape, extreme aerodynamics, prominent rear GT wing)
export function drawSupercarBody(ctx) {
  // Extreme front carbon splitter & dual rear diffuser tunnels
  ctx.fillStyle = '#0d0e12';
  ctx.beginPath();
  ctx.moveTo(-34, 7);
  ctx.lineTo(32, 7);
  ctx.lineTo(35, 6);
  ctx.lineTo(28, 4);
  ctx.lineTo(-33, 4);
  ctx.closePath();
  ctx.fill();

  // Titanium thrusters
  ctx.fillStyle = '#485460';
  ctx.fillRect(-34, 2, 4, 5); // Rear
  ctx.fillRect(-8, 6, 6, 3);  // Underbody

  // Main Body: Volcano Orange Pearl Metallic Gradient
  const bodyGrad = ctx.createLinearGradient(0, -8, 0, 8);
  bodyGrad.addColorStop(0, '#ff9f43');
  bodyGrad.addColorStop(0.35, '#ff5252');
  bodyGrad.addColorStop(0.85, '#d63031');
  bodyGrad.addColorStop(1, '#540614');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Ultra-low pointed nose cone
  ctx.moveTo(34, 5.5);
  ctx.lineTo(34, 4);
  ctx.lineTo(29, 0);
  // Extreme low wedge hood
  ctx.lineTo(11, -2);
  // Fighter-jet bubble canopy
  ctx.lineTo(2, -7.5);
  ctx.quadraticCurveTo(-6, -8.5, -14, -5.5);
  // Long flat rear engine deck
  ctx.lineTo(-29, -2.5);
  ctx.lineTo(-33, 0);
  ctx.lineTo(-33, 6);
  ctx.lineTo(27, 6);
  ctx.closePath();
  ctx.fill();

  // Large Carbon Side NACA Air Duct Scoop
  ctx.fillStyle = '#14151a';
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(-13, -2);
  ctx.lineTo(-13, 3);
  ctx.closePath();
  ctx.fill();

  // Rear High-Downforce GT Wing
  // Dual Carbon Pylons
  ctx.fillStyle = '#1e2026';
  ctx.fillRect(-26, -9.5, 2.2, 7.5);
  ctx.fillRect(-20, -9.5, 2.2, 7.5);

  // Carbon Wing Airfoil Blade & Orange Endplates
  ctx.fillStyle = '#121317';
  ctx.fillRect(-33, -10.5, 16, 2);
  ctx.fillStyle = '#ff5252';
  ctx.fillRect(-33.5, -11.5, 1.5, 4); // Left endplate
  ctx.fillRect(-17.5, -11.5, 1.5, 4); // Right endplate

  // Fighter-Jet Iridescent Cockpit Canopy
  const glassGrad = ctx.createLinearGradient(-10, -8, 5, -2);
  glassGrad.addColorStop(0, '#0a192f');
  glassGrad.addColorStop(0.5, '#112240');
  glassGrad.addColorStop(1, '#1f4068');

  ctx.fillStyle = glassGrad;
  ctx.beginPath();
  ctx.moveTo(9, -2);
  ctx.lineTo(1, -7);
  ctx.quadraticCurveTo(-6, -8, -13, -5);
  ctx.lineTo(-16, -2.2);
  ctx.closePath();
  ctx.fill();

  // Cyan windshield iridescent glare
  ctx.strokeStyle = 'rgba(0, 245, 212, 0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(1, -6.5);
  ctx.lineTo(6, -2.5);
  ctx.stroke();

  // Driver silhouette
  ctx.fillStyle = '#060a12';
  ctx.beginPath();
  ctx.arc(-4, -4.5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Razor-Thin Quad-LED Headlights (Electric Cyan)
  ctx.fillStyle = '#00f5d4';
  ctx.shadowColor = '#00f5d4';
  ctx.shadowBlur = 8;
  ctx.fillRect(30, 2, 3.5, 1.8);
  ctx.shadowBlur = 0;

  // Glowing Neon Taillight Ribbon (Hyper Red)
  ctx.fillStyle = '#ff1744';
  ctx.shadowColor = '#ff1744';
  ctx.shadowBlur = 9;
  ctx.fillRect(-33.5, -2, 2.2, 4);
  ctx.shadowBlur = 0;
}

// Universal Car Dispatcher
export function drawCar(ctx, carDef, wheelRotation) {
  switch (carDef.type) {
    case 'suv':
      drawSUVBody(ctx);
      drawWheel(ctx, carDef.wheelXFront, carDef.wheelY, wheelRotation, '#00d2d3', '#747d8c');
      drawWheel(ctx, carDef.wheelXRear, carDef.wheelY, wheelRotation, '#00d2d3', '#747d8c');
      break;
    case 'minivan':
      drawMinivanBody(ctx);
      drawWheel(ctx, carDef.wheelXFront, carDef.wheelY, wheelRotation, '#3498db', '#bdc3c7');
      drawWheel(ctx, carDef.wheelXRear, carDef.wheelY, wheelRotation, '#3498db', '#bdc3c7');
      break;
    case 'hatchback':
      drawHatchbackBody(ctx);
      drawWheel(ctx, carDef.wheelXFront, carDef.wheelY, wheelRotation, '#e74c3c', '#f1c40f');
      drawWheel(ctx, carDef.wheelXRear, carDef.wheelY, wheelRotation, '#e74c3c', '#f1c40f');
      break;
    case 'supercar':
      drawSupercarBody(ctx);
      drawWheel(ctx, carDef.wheelXFront, carDef.wheelY, wheelRotation, '#f39c12', '#2f3542');
      drawWheel(ctx, carDef.wheelXRear, carDef.wheelY, wheelRotation, '#f39c12', '#2f3542');
      break;
    case 'roadster':
    default:
      drawRoadsterBody(ctx);
      drawWheel(ctx, carDef.wheelXFront, carDef.wheelY, wheelRotation, '#e81123', '#95a5a6');
      drawWheel(ctx, carDef.wheelXRear, carDef.wheelY, wheelRotation, '#e81123', '#95a5a6');
      break;
  }
}
