import Phaser from 'phaser';
import { gameConfig } from './config';

// Prevent all default touch behaviors that interfere with the game
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('gesturechange', e => e.preventDefault());
document.addEventListener('gestureend', e => e.preventDefault());

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, { passive: false });

// Prevent context menu on long press
document.addEventListener('contextmenu', e => e.preventDefault());

const game = new Phaser.Game(gameConfig);

// Auto-resize when orientation changes or keyboard appears on mobile
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

// Handle mobile viewport changes (address bar show/hide)
if ('visualViewport' in window) {
  window.visualViewport!.addEventListener('resize', () => {
    const vv = window.visualViewport!;
    game.scale.resize(vv.width, vv.height);
  });
}
