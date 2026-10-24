# Flappy Tesla - Cold-Gas Thruster Flight Test 🚀

A high-fidelity retro arcade flight test simulator built with HTML5 Canvas, Web Audio API, and Supabase telemetry. Pilot a cold-gas thruster equipped electric vehicle through the SpaceX Starbase launch complex at Boca Chica, Texas.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `dist/`.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🔧 Environment Variables

By default, the game connects to the Starbase global flight leaderboard. To use your own Supabase project:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 📁 Architecture & Module Structure

The project has been refactored into modular ES modules:

| Path | Responsibility |
| :--- | :--- |
| `src/config.js` | Physics constants, speed scaling intervals, tower geometry, car definitions, and Supabase config. |
| `src/storage.js` | LocalStorage persistence, UUID pilot identity, high score, coins wallet, and garage inventory. |
| `src/supabase.js` | Supabase client initialization, `submit_score` RPC, and global leaderboard fetching. |
| `src/audio.js` | Pure Web Audio API synthesizers (continuous nitrogen hiss loop, valve bursts, score chimes, crash impact). |
| `src/effects/particles.js` | Particle emitters (cold-gas vapor plumes, initial burst puffs, tarmac ground dust, spoiler trails, crash debris). |
| `src/entities/car.js` | `Roadster` vehicle entity with continuous thruster output ramping, terminal velocity clamping, and tilt dynamics. |
| `src/entities/obstacles.js` | `ObstacleManager` launch tower obstacles, dynamic spacing scaling, Milestone 60 +20% spacing, and hit detection. |
| `src/rendering/background.js` | Texas Boca Chica dusk sky gradient, procedural twinkling stars, distant mesas, and Mega Bay/Starship horizon. |
| `src/rendering/car-draw.js` | Vector rendering routines for all 5 vehicles (Roadster, SUV, Minivan, Hatchback, Supercar) and spinning alloy wheels. |
| `src/rendering/hud.js` | In-canvas title banner, flight thruster telemetry gauge, speed alerts, and game-over statistics panel. |
| `src/state.js` | Single centralized state container (`TITLE`, `PLAYING`, `GAMEOVER`) tracking scores, speed, and timers. |
| `src/input.js` | Keyboard (`Space`, `M`, `Escape`) and canvas touch/pointer hold listeners. |
| `src/shop.js` | Single-car carousel hangar showcase, 3D underglow preview stage, and buy/equip flow. |
| `src/leaderboard.js` | DOM leaderboard table rendering with strict textContent escaping and personal best fallback. |
| `src/game.js` | Core Game engine class, delta-time game loop, HiDPI Retina canvas scaling, and state machine. |
| `src/main.js` | Application bootstrap, modal event bindings, and DOM lifecycle. |
| `src/style.css` | Cyber-aerospace Starbase dark theme, modal glassmorphism, responsive canvas container. |

---

## 🚀 Deployment

The `dist/` directory produced by `npm run build` contains static assets ready for deployment to any static host:
- **Vercel**: Run `vercel` or link your Git repository.
- **Netlify**: Deploy directory `dist/`.
- **Cloudflare Pages**: Set build command to `npm run build` and output directory to `dist`.
- **GitHub Pages**: Build and push `dist` or use the GitHub Pages static deployment action.
