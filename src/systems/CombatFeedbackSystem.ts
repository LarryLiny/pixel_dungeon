import Phaser from 'phaser';
import { randFloat } from '../utils/helpers';

/**
 * CombatFeedbackSystem — manages hit/kill visual feedback
 * Screen shake, damage numbers, kill slow-mo, death particles, knockback
 */
export class CombatFeedbackSystem {
  scene: Phaser.Scene;
  camera: Phaser.Cameras.Scene2D.Camera;
  damageTexts: Phaser.GameObjects.Text[] = [];
  slowMoTimer: number = 0;
  slowMoDuration: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  /** Call every frame */
  update(delta: number) {
    // Update slow-mo
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= delta;
      if (this.slowMoTimer <= 0) {
        this.scene.physics.world.timeScale = 1.0;
        this.slowMoTimer = 0;
      }
    }

    // Cleanup old damage texts
    this.damageTexts = this.damageTexts.filter(t => t.active);
  }

  /** Screen shake on bullet hit */
  onHit(heavy: boolean = false) {
    const intensity = heavy ? 0.008 : 0.003;
    const duration = heavy ? 120 : 60;
    this.camera.shake(duration, intensity);
  }

  /** Floating damage number */
  showDamage(x: number, y: number, damage: number, crit: boolean = false, color: string = '#ff4444') {
    const fontSize = crit ? 16 : 12;
    const text = this.scene.add.text(x + randFloat(-8, 8), y - 10, `${Math.round(damage)}`, {
      fontSize: `${fontSize}px`,
      color: crit ? '#ffdd44' : color,
      fontFamily: 'monospace',
      fontStyle: crit ? 'bold' : 'normal',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(100).setScrollFactor(1);

    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      scaleX: crit ? 1.5 : 1.0,
      scaleY: crit ? 1.5 : 1.0,
      duration: crit ? 800 : 500,
      ease: 'Power2',
      onComplete: () => { if (text.active) text.destroy(); },
    });

    this.damageTexts.push(text);
  }

  /** Kill slow-motion effect (brief time scale reduction) */
  onKill(heavy: boolean = false) {
    const duration = heavy ? 150 : 80;
    const scale = heavy ? 0.3 : 0.5;
    this.scene.physics.world.timeScale = scale;
    this.slowMoTimer = duration;

    // Flash white
    this.camera.flash(duration, 255, 255, 255, true, undefined as any, this.scene);
  }

  /** Enhanced death particle explosion */
  deathExplosion(x: number, y: number, color: number = 0xffaa44, count: number = 6) {
    // Ring expanding outward
    const ring = this.scene.add.circle(x, y, 4, color, 0.5).setDepth(15);
    this.scene.tweens.add({
      targets: ring,
      radius: 20,
      alpha: 0,
      duration: 300,
      onUpdate: (tween) => {
        const r = ring.geom.radius;
        ring.setScale(r / 4);
      },
      onComplete: () => { if (ring.active) ring.destroy(); },
    });

    // Particles flying outward
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = randFloat(15, 35);
      const size = randFloat(2, 5);
      const particle = this.scene.add.rectangle(x, y, size, size, color).setDepth(15);
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: randFloat(200, 400),
        ease: 'Power2',
        onComplete: () => { if (particle.active) particle.destroy(); },
      });
    }
  }

  /** Level-up flash — no shake, just glow */
  levelUpFlash() {
    // Gentle white flash only, no shake
    this.camera.flash(250, 255, 255, 150, true, undefined as any, this.scene);

    // Expanding golden ring at player position
    const player = (this.scene as any).player;
    if (player) {
      const ring = this.scene.add.circle(player.x, player.y, 10, 0xffdd44, 0.4).setDepth(100);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 8,
        scaleY: 8,
        alpha: 0,
        duration: 500,
        onComplete: () => { if (ring.active) ring.destroy(); },
      });
    }
  }

  /** Fusion effect — even bigger than level up */
  fusionFlash(x: number, y: number) {
    this.camera.flash(400, 255, 255, 255, true, undefined as any, this.scene);
    this.camera.shake(300, 0.015);

    // Triple expanding rings
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        const ring = this.scene.add.circle(x, y, 10, [0xffdd44, 0xff8844, 0xffffff][i], 0.5).setDepth(100);
        this.scene.tweens.add({
          targets: ring,
          scaleX: 10,
          scaleY: 10,
          alpha: 0,
          duration: 600,
          onComplete: () => { if (ring.active) ring.destroy(); },
        });
      });
    }
  }
}
