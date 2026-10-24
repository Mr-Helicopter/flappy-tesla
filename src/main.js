// ============================================================================
// MAIN APPLICATION ENTRY POINT
// Initializes styles, DOM UI listeners, modal controllers, and launches the game.
// ============================================================================

import './style.css';
import { getOrGeneratePlayerId, getPlayerName, setPlayerName } from './storage.js';
import { loadLeaderboardView } from './leaderboard.js';
import { ShopController } from './shop.js';
import { Game } from './game.js';

export function initUI() {
  const nameModal = document.getElementById('name-modal');
  const nameInput = document.getElementById('player-name-input');
  const nameError = document.getElementById('name-error');
  const nameSubmitBtn = document.getElementById('name-submit-btn');
  const pilotDisplay = document.getElementById('pilot-name-display');
  const changeNameBtn = document.getElementById('change-name-btn');
  const leaderboardModal = document.getElementById('leaderboard-modal');
  const openLeaderboardBtn = document.getElementById('open-leaderboard-btn');
  const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
  const modalContent = document.getElementById('leaderboard-modal-content');

  // Ensure UUID player_id exists in localStorage on first load
  getOrGeneratePlayerId();

  const currentName = getPlayerName();
  if (!currentName) {
    // First visit: show name modal before title screen
    if (nameModal) {
      nameModal.classList.add('active');
      setTimeout(() => { if (nameInput) nameInput.focus(); }, 80);
    }
  } else {
    if (pilotDisplay) pilotDisplay.textContent = currentName;
  }

  function submitName() {
    if (!nameInput) return;
    const val = (nameInput.value || '').trim().slice(0, 12);
    if (!val) {
      if (nameError) {
        nameError.textContent = 'Callsign required (1–12 characters)';
        nameError.style.display = 'block';
      }
      nameInput.focus();
      return;
    }
    if (nameError) nameError.style.display = 'none';
    setPlayerName(val);
    if (pilotDisplay) pilotDisplay.textContent = val;
    if (nameModal) nameModal.classList.remove('active');
  }

  // Name input listeners (prevent space from triggering game thrust)
  if (nameInput) {
    nameInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        submitName();
      }
    });
    nameInput.addEventListener('keyup', (e) => e.stopPropagation());
    nameInput.addEventListener('keypress', (e) => e.stopPropagation());
  }

  if (nameSubmitBtn) {
    nameSubmitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      submitName();
    });
  }

  // Change Name button on title screen
  if (changeNameBtn) {
    changeNameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (nameInput) {
        nameInput.value = getPlayerName();
        if (nameError) nameError.style.display = 'none';
      }
      if (nameModal) {
        nameModal.classList.add('active');
        setTimeout(() => {
          if (nameInput) {
            nameInput.focus();
            nameInput.select();
          }
        }, 80);
      }
    });
  }

  // Leaderboard button on title screen
  if (openLeaderboardBtn) {
    openLeaderboardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (leaderboardModal) {
        leaderboardModal.classList.add('active');
        loadLeaderboardView(modalContent);
      }
    });
  }

  if (closeLeaderboardBtn) {
    closeLeaderboardBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (leaderboardModal) leaderboardModal.classList.remove('active');
    });
  }

  if (leaderboardModal) {
    leaderboardModal.addEventListener('click', (e) => {
      if (e.target === leaderboardModal) {
        leaderboardModal.classList.remove('active');
      }
    });
  }

  // Shop UI elements
  const shopModal = document.getElementById('shop-modal');
  const openShopBtn = document.getElementById('open-shop-btn');
  const closeShopBtn = document.getElementById('close-shop-btn');
  const prevShopBtn = document.getElementById('shop-prev-btn');
  const nextShopBtn = document.getElementById('shop-next-btn');
  const shopActionBtn = document.getElementById('shop-action-btn');

  if (openShopBtn) {
    openShopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ShopController.open();
    });
  }

  if (closeShopBtn) {
    closeShopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ShopController.close();
    });
  }

  if (prevShopBtn) {
    prevShopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ShopController.prev();
    });
  }

  if (nextShopBtn) {
    nextShopBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ShopController.next();
    });
  }

  if (shopActionBtn) {
    shopActionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      ShopController.handleAction();
    });
  }

  if (shopModal) {
    shopModal.addEventListener('click', (e) => {
      if (e.target === shopModal) {
        ShopController.close();
      }
    });
  }

  // Keyboard controls for Shop Modal
  window.addEventListener('keydown', (e) => {
    if (!shopModal || !shopModal.classList.contains('active')) return;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      ShopController.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      ShopController.next();
    } else if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      ShopController.handleAction();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      ShopController.close();
    }
  }, true);
}

// Bootstrap application on load
function bootstrap() {
  initUI();
  const game = new Game();
  return game;
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
