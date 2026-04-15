import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { ShopScene } from './scenes/ShopScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: document.body,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    // Expand to fill screen
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    min: {
      width: 320,
      height: 480,
    },
  },
  // Better touch input config
  input: {
    activePointers: 3, // Support multi-touch (joystick + taps)
    touch: {
      capture: true,
    },
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene, LeaderboardScene, ShopScene],
};
