// ============================================================================
// CAR SHOP CONTROLLER & HANGAR UI MANAGER
// Single-car carousel showcase, 3D underglow preview stage, confirmation buy flow.
// ============================================================================

import { CARS } from './config.js';
import { Garage } from './storage.js';
import { drawCar } from './rendering/car-draw.js';

export function updateAllCoinDisplays() {
  const coins = Garage.getCoins();
  const titleDisp = document.getElementById('title-coin-display');
  if (titleDisp) titleDisp.textContent = coins.toLocaleString();
  const shopDisp = document.getElementById('shop-coins-val');
  if (shopDisp) shopDisp.textContent = coins.toLocaleString();
}

export const ShopController = {
  currentIndex: 0,
  confirmingCarId: null,
  confirmTimer: null,
  newCarId: null,
  previewAnimId: null,
  previewTime: 0,
  getRoadster: null,
  getAudio: null,

  init(options = {}) {
    if (options.getRoadster) this.getRoadster = options.getRoadster;
    if (options.getAudio) this.getAudio = options.getAudio;

    // Find equipped car index
    const equippedId = Garage.getEquippedCarId();
    const idx = CARS.findIndex(c => c.id === equippedId);
    this.currentIndex = idx !== -1 ? idx : 0;

    // Build carousel dots
    const dotsContainer = document.getElementById('shop-carousel-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      CARS.forEach((car, i) => {
        const dot = document.createElement('button');
        dot.className = 'shop-dot' + (i === this.currentIndex ? ' active' : '');
        dot.type = 'button';
        dot.title = car.name;
        dot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.goTo(i, i > this.currentIndex ? 'next' : 'prev');
        });
        dotsContainer.appendChild(dot);
      });
    }

    updateAllCoinDisplays();
  },

  open() {
    const modal = document.getElementById('shop-modal');
    if (!modal) return;

    const equippedId = Garage.getEquippedCarId();
    const idx = CARS.findIndex(c => c.id === equippedId);
    this.currentIndex = idx !== -1 ? idx : 0;
    this.confirmingCarId = null;

    modal.classList.add('active');
    this.renderCard();
    this.startPreviewLoop();
    updateAllCoinDisplays();
  },

  close() {
    const modal = document.getElementById('shop-modal');
    if (modal) modal.classList.remove('active');
    this.stopPreviewLoop();
    this.confirmingCarId = null;
    if (this.confirmTimer) {
      clearTimeout(this.confirmTimer);
      this.confirmTimer = null;
    }
    updateAllCoinDisplays();
  },

  goTo(index, dir = 'next') {
    const card = document.getElementById('shop-car-card');
    if (card) {
      card.classList.remove('slide-next', 'slide-prev');
      // Force reflow for CSS animation restart
      void card.offsetWidth;
      card.classList.add(dir === 'next' ? 'slide-next' : 'slide-prev');
      setTimeout(() => {
        if (card) card.classList.remove('slide-next', 'slide-prev');
      }, 240);
    }

    this.currentIndex = ((index % CARS.length) + CARS.length) % CARS.length;
    this.confirmingCarId = null;
    if (this.confirmTimer) {
      clearTimeout(this.confirmTimer);
      this.confirmTimer = null;
    }
    this.renderCard();
  },

  prev() {
    this.goTo(this.currentIndex - 1, 'prev');
  },

  next() {
    this.goTo(this.currentIndex + 1, 'next');
  },

  renderCard() {
    const car = CARS[this.currentIndex];
    const isOwned = Garage.isCarOwned(car.id);
    const isEquipped = Garage.getEquippedCarId() === car.id;
    const coins = Garage.getCoins();
    const canAfford = coins >= car.price;

    // Meta info
    const nameEl = document.getElementById('shop-car-name');
    if (nameEl) nameEl.textContent = car.name.toUpperCase();
    const subEl = document.getElementById('shop-car-subtitle');
    if (subEl) subEl.textContent = car.subtitle;

    // Price tag
    const priceTag = document.getElementById('shop-car-price-tag');
    if (priceTag) {
      if (car.price === 0) {
        priceTag.textContent = 'FREE (DEFAULT)';
      } else if (isOwned) {
        priceTag.textContent = 'PURCHASED & READY';
      } else {
        priceTag.textContent = `${car.price} COINS`;
      }
    }

    // Status pill
    const statusPill = document.getElementById('shop-car-status-pill');
    if (statusPill) {
      statusPill.className = 'status-pill';
      if (isEquipped) {
        statusPill.classList.add('equipped');
        statusPill.textContent = 'EQUIPPED';
      } else if (isOwned) {
        statusPill.classList.add('owned');
        statusPill.textContent = 'OWNED';
      } else {
        statusPill.classList.add('locked');
        statusPill.textContent = 'LOCKED';
      }
    }

    // Lock overlay
    const lockOverlay = document.getElementById('shop-lock-overlay');
    const lockPrice = document.getElementById('shop-lock-price');
    if (lockOverlay) {
      if (!isOwned) {
        lockOverlay.style.display = 'flex';
        if (lockPrice) lockPrice.textContent = `${car.price} 🪙`;
      } else {
        lockOverlay.style.display = 'none';
      }
    }

    // NEW badge
    const newBadge = document.getElementById('shop-new-badge');
    if (newBadge) {
      newBadge.style.display = this.newCarId === car.id ? 'inline-flex' : 'none';
    }

    // Action button
    const actBtn = document.getElementById('shop-action-btn');
    if (actBtn) {
      actBtn.className = 'btn-shop-action';
      if (isEquipped) {
        actBtn.classList.add('btn-shop-equipped');
        actBtn.textContent = 'EQUIPPED';
        actBtn.disabled = true;
      } else if (isOwned) {
        actBtn.classList.add('btn-shop-equip');
        actBtn.textContent = 'EQUIP VEHICLE';
        actBtn.disabled = false;
      } else {
        // Locked car
        if (this.confirmingCarId === car.id) {
          actBtn.classList.add('btn-shop-confirm');
          actBtn.textContent = `CONFIRM PURCHASE (${car.price} 🪙)`;
          actBtn.disabled = false;
        } else if (canAfford) {
          actBtn.classList.add('btn-shop-buy');
          actBtn.textContent = `BUY VEHICLE (${car.price} 🪙)`;
          actBtn.disabled = false;
        } else {
          actBtn.classList.add('btn-shop-disabled');
          actBtn.textContent = `NEED ${car.price} 🪙 (${car.price - coins} MORE)`;
          actBtn.disabled = true;
        }
      }
    }

    // Update dots
    const dots = document.querySelectorAll('.shop-dot');
    dots.forEach((dot, i) => {
      if (i === this.currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    updateAllCoinDisplays();
  },

  handleAction() {
    const car = CARS[this.currentIndex];
    const isOwned = Garage.isCarOwned(car.id);
    const isEquipped = Garage.getEquippedCarId() === car.id;

    if (isEquipped) return;

    if (isOwned) {
      // Equip owned vehicle
      Garage.setEquippedCarId(car.id);
      const roadster = this.getRoadster ? this.getRoadster() : null;
      if (roadster) {
        roadster.carDef = car;
      }
      this.renderCard();
      return;
    }

    // Locked car: buy flow
    const coins = Garage.getCoins();
    if (coins < car.price) return;

    if (this.confirmingCarId !== car.id) {
      // Step 1: Confirmation prompt
      this.confirmingCarId = car.id;
      this.renderCard();

      if (this.confirmTimer) clearTimeout(this.confirmTimer);
      this.confirmTimer = setTimeout(() => {
        if (this.confirmingCarId === car.id) {
          this.confirmingCarId = null;
          this.renderCard();
        }
      }, 4000);
    } else {
      // Step 2: Confirmed purchase!
      if (this.confirmTimer) clearTimeout(this.confirmTimer);
      this.confirmTimer = null;

      if (Garage.spendCoins(car.price)) {
        Garage.unlockCar(car.id);
        Garage.setEquippedCarId(car.id);
        this.confirmingCarId = null;
        this.newCarId = car.id;

        // Play synthesized celebratory purchase sound
        const audio = this.getAudio ? this.getAudio() : null;
        if (audio) {
          audio.playPurchaseSound();
        }

        // Equip immediately in active game
        const roadster = this.getRoadster ? this.getRoadster() : null;
        if (roadster) {
          roadster.carDef = car;
        }

        updateAllCoinDisplays();
        this.renderCard();
      }
    }
  },

  startPreviewLoop() {
    if (this.previewAnimId) cancelAnimationFrame(this.previewAnimId);
    let lastTimestamp = performance.now();

    const loop = (timestamp) => {
      const modal = document.getElementById('shop-modal');
      if (!modal || !modal.classList.contains('active')) {
        this.previewAnimId = null;
        return;
      }

      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;
      this.previewTime += dt;

      this.renderPreview(dt);
      this.previewAnimId = requestAnimationFrame(loop);
    };

    this.previewAnimId = requestAnimationFrame(loop);
  },

  stopPreviewLoop() {
    if (this.previewAnimId) {
      cancelAnimationFrame(this.previewAnimId);
      this.previewAnimId = null;
    }
  },

  renderPreview() {
    const canvas = document.getElementById('shop-preview-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Cyber stage background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0c101a');
    bgGrad.addColorStop(0.7, '#141a29');
    bgGrad.addColorStop(1, '#080a10');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Perspective floor grid
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 210, 211, 0.14)';
    ctx.lineWidth = 1;
    const horizonY = 96;

    // Horizon line
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(W, horizonY);
    ctx.stroke();

    // Floor grid lines
    for (let y = horizonY + 8; y < H; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    for (let x = -80; x < W + 80; x += 38) {
      ctx.beginPath();
      ctx.moveTo(x, H);
      ctx.lineTo(W / 2 + (x - W / 2) * 0.35, horizonY);
      ctx.stroke();
    }
    ctx.restore();

    // Subtle underglow spotlight on floor
    const glowGrad = ctx.createRadialGradient(W / 2, horizonY + 12, 10, W / 2, horizonY + 12, 110);
    glowGrad.addColorStop(0, 'rgba(0, 210, 211, 0.28)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, horizonY - 10, W, H - horizonY + 10);

    // Car drawing with gentle bobbing motion
    const car = CARS[this.currentIndex];
    const bobY = 66 + Math.sin(this.previewTime * 2.8) * 4.5;
    const bobTilt = Math.sin(this.previewTime * 2.8) * 0.025;
    const wheelRot = this.previewTime * 3.5;

    // Gentle thruster hover puff in preview
    if (Math.sin(this.previewTime * 2.8) > 0.85) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      const puffX = W / 2 + car.underNozzle.x;
      const puffY = bobY + car.underNozzle.y + 6;
      ctx.beginPath();
      ctx.arc(puffX, puffY, 3 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(W / 2, bobY);
    ctx.rotate(bobTilt);

    // Scale up slightly for preview fidelity (1.4x scale)
    ctx.scale(1.4, 1.4);

    drawCar(ctx, car, wheelRot);

    ctx.restore();
  }
};
