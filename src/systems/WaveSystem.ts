import Phaser from 'phaser';
import { WAVE_DURATION } from '../constants';
import { getWaveConfig, WaveConfig } from '../data/waves';

export class WaveSystem {
  scene: Phaser.Scene;
  currentWave: number;
  waveStartTime: number;
  waveConfig: WaveConfig;
  enemiesSpawned: number;
  onWaveStart?: (wave: number) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.currentWave = 0;
    this.waveStartTime = 0;
    this.waveConfig = getWaveConfig(1);
    this.enemiesSpawned = 0;
  }

  start(time: number) {
    this.currentWave = 1;
    this.waveStartTime = time;
    this.waveConfig = getWaveConfig(1);
    this.enemiesSpawned = 0;
    this.onWaveStart?.(this.currentWave);
  }

  update(time: number): boolean {
    if (time - this.waveStartTime >= WAVE_DURATION) {
      this.nextWave(time);
      return true;
    }
    return false;
  }

  nextWave(time: number) {
    this.currentWave++;
    this.waveStartTime = time;
    this.waveConfig = getWaveConfig(this.currentWave);
    this.enemiesSpawned = 0;
    this.onWaveStart?.(this.currentWave);
  }

  getConfig(): WaveConfig {
    return this.waveConfig;
  }

  getWaveProgress(time: number): number {
    return (time - this.waveStartTime) / WAVE_DURATION;
  }

  getRemainingTime(time: number): number {
    return Math.max(0, WAVE_DURATION - (time - this.waveStartTime));
  }

  shouldSpawn(): boolean {
    if (this.enemiesSpawned < this.waveConfig.enemyCount) {
      this.enemiesSpawned++;
      return true;
    }
    return false;
  }
}
