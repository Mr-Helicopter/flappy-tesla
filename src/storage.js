// ============================================================================
// STORAGE & IDENTITY MANAGER (LocalStorage persistence with validation)
// Player ID, pilot name, high scores, coins wallet, and garage inventory.
// ============================================================================

import { CARS } from './config.js';

export function getOrGeneratePlayerId() {
  let id = localStorage.getItem('flappy_tesla_player_id');
  if (!id) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    try {
      localStorage.setItem('flappy_tesla_player_id', id);
    } catch (e) {}
  }
  return id;
}

export function getPlayerId() {
  return localStorage.getItem('flappy_tesla_player_id') || getOrGeneratePlayerId();
}

export function getPlayerName() {
  try {
    return (localStorage.getItem('flappy_tesla_player_name') || '').trim();
  } catch (e) {
    return '';
  }
}

export function setPlayerName(name) {
  const trimmed = (name || '').trim().slice(0, 12);
  if (trimmed) {
    try {
      localStorage.setItem('flappy_tesla_player_name', trimmed);
    } catch (e) {}
  }
  return trimmed;
}

export function getHighScore() {
  try {
    const val = localStorage.getItem('flappy_tesla_highscore');
    return val ? parseInt(val, 10) || 0 : 0;
  } catch (e) {
    return 0;
  }
}

export function saveHighScore(score) {
  try {
    localStorage.setItem('flappy_tesla_highscore', score.toString());
  } catch (e) {}
}

export const Garage = {
  getCoins() {
    try {
      const val = localStorage.getItem('flappy_tesla_coins');
      return val ? Math.max(0, parseInt(val, 10) || 0) : 0;
    } catch (e) {
      return 0;
    }
  },
  addCoins(amount) {
    const cur = this.getCoins();
    const next = cur + Math.max(0, Math.floor(amount));
    try {
      localStorage.setItem('flappy_tesla_coins', next.toString());
    } catch (e) {}
    return next;
  },
  spendCoins(amount) {
    const cur = this.getCoins();
    if (cur < amount) return false;
    const next = cur - amount;
    try {
      localStorage.setItem('flappy_tesla_coins', next.toString());
    } catch (e) {}
    return true;
  },
  getOwnedCars() {
    try {
      const raw = localStorage.getItem('flappy_tesla_owned_cars');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.includes('roadster')) {
          // Keep only valid car IDs
          const valid = parsed.filter(id => CARS.some(c => c.id === id));
          if (!valid.includes('roadster')) valid.unshift('roadster');
          return valid;
        }
      }
    } catch (e) {}
    const fallback = ['roadster'];
    try {
      localStorage.setItem('flappy_tesla_owned_cars', JSON.stringify(fallback));
    } catch (e) {}
    return fallback;
  },
  isCarOwned(carId) {
    return this.getOwnedCars().includes(carId);
  },
  unlockCar(carId) {
    const owned = this.getOwnedCars();
    if (!owned.includes(carId)) {
      owned.push(carId);
      try {
        localStorage.setItem('flappy_tesla_owned_cars', JSON.stringify(owned));
      } catch (e) {}
    }
    return owned;
  },
  getEquippedCarId() {
    try {
      const equipped = localStorage.getItem('flappy_tesla_equipped_car');
      if (equipped && CARS.some(c => c.id === equipped) && this.isCarOwned(equipped)) {
        return equipped;
      }
    } catch (e) {}
    return 'roadster';
  },
  setEquippedCarId(carId) {
    if (CARS.some(c => c.id === carId) && this.isCarOwned(carId)) {
      try {
        localStorage.setItem('flappy_tesla_equipped_car', carId);
      } catch (e) {}
      return true;
    }
    return false;
  }
};
