// ============================================================================
// INPUT SYSTEM (Keyboard, Mouse, Touch with continuous hold support)
// ============================================================================

import { CONSTANTS } from './config.js';

export class InputHandler {
  constructor(getPhaseCallback) {
    this.isThrusting = false;
    this.thrustJustPressed = false;
    this.anyKeyJustPressed = false;
    this.muteToggled = false;
    this.getPhase = getPhaseCallback || (() => 'TITLE');

    // Event listeners
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Pointer events (handles both mouse and touch transparently)
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
      // Prevent default touch gestures (scrolling/zoom)
      canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
      canvas.addEventListener('touchend', (e) => e.preventDefault(), { passive: false });
    }
    window.addEventListener('pointerup', (e) => this.onPointerUp(e));
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e));

    // Window blur safety
    window.addEventListener('blur', () => {
      this.isThrusting = false;
    });
  }

  onKeyDown(e) {
    // Ignore key events when user is typing in an input/textarea (preserves SPACE in text field)
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }
    // If modal overlay is active, ignore game controls but allow Escape to close
    if (document.querySelector('.modal-overlay.active')) {
      if (e.code === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (!this.isThrusting) {
        this.thrustJustPressed = true;
      }
      this.isThrusting = true;
      this.anyKeyJustPressed = true;
    } else if (e.code === 'KeyM') {
      this.muteToggled = true;
    }
  }

  onKeyUp(e) {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }
    if (document.querySelector('.modal-overlay.active')) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      this.isThrusting = false;
    }
  }

  onPointerDown(e) {
    if (document.querySelector('.modal-overlay.active')) {
      return;
    }
    // If clicking inside HUD buttons or panels, do not trigger canvas thrust
    const target = e.target;
    if (target && target.closest && (target.closest('.ui-panel') || target.closest('.modal-card'))) {
      return;
    }

    e.preventDefault();
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CONSTANTS.VIRTUAL_WIDTH / rect.width;
    const scaleY = CONSTANTS.VIRTUAL_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Clickable HUD mute toggle button in top right
    const isTitle = (this.getPhase() === 'TITLE');
    const muteMinY = isTitle ? 48 : 0;
    const muteMaxY = isTitle ? 82 : 45;
    if (clickX > CONSTANTS.VIRTUAL_WIDTH - 150 && clickY >= muteMinY && clickY <= muteMaxY) {
      this.muteToggled = true;
      return;
    }

    if (!this.isThrusting) {
      this.thrustJustPressed = true;
    }
    this.isThrusting = true;
    this.anyKeyJustPressed = true;
  }

  onPointerUp() {
    this.isThrusting = false;
  }

  // Clear one-frame triggers at end of each frame
  endFrame() {
    this.thrustJustPressed = false;
    this.anyKeyJustPressed = false;
    this.muteToggled = false;
  }
}
