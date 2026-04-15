import Phaser from 'phaser';
import { generateAllTextures } from '../utils/pixelAssets';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    generateAllTextures(this);
    window.dispatchEvent(new Event('game-ready'));
    this.scene.start('MenuScene');
  }
}
