import Phaser from 'phaser';
import { randFloat } from '../utils/helpers';

/**
 * CombatFeedbackSystem — manages hit/kill visual feedback
 * Screen shake, damage numbers, death particles, knockback
 */
export class CombatFeedbackSystem {
  scene: Phaser.Scene;
  camera: Phaser.Cameras.Scene2D.Camera;
  damageTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
  }

  /** Call every frame */
  update(delta: number) {
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
    // Visual-only kill feedback: camera flash + shake (NO physics timeScale)
    const duration = heavy ? 120 : 60;
    this.camera.flash(duration, 255, 255, 255, true, undefined as any, this.scene);
    if (heavy) {
      this.camera.shake(80, 0.005);
    }
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
  }

  /** Skill acquired — dramatic reveal with starburst + floating name */
  skillAcquired(x: number, y: number, skillName: string, color: number) {
    // Starburst particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = this.scene.add.rectangle(x, y, 3, 3, color).setDepth(100);
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 35,
        y: y + Math.sin(angle) * 35,
        alpha: 0,
        duration: 400,
        onComplete: () => { if (particle.active) particle.destroy(); },
      });
    }

    // Floating skill name
    const colorHex = '#' + color.toString(16).padStart(6, '0');
    const nameText = this.scene.add.text(x, y - 20, skillName, {
      fontSize: '14px', color: colorHex, fontFamily: 'monospace', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200).setScrollFactor(1);
    this.scene.tweens.add({
      targets: nameText,
      y: y - 55, alpha: 0,
      duration: 1200,
      onComplete: () => { if (nameText.active) nameText.destroy(); },
    });
  }

  /** Level-up ring at player position (called externally with coords) */
  levelUpRing(x: number, y: number) {
    const ring = this.scene.add.circle(x, y, 10, 0xffdd44, 0.4).setDepth(100);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 8,
        scaleY: 8,
        alpha: 0,
        onComplete: () => { if (ring.active) ring.destroy(); },
      });
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

  /** Clean up resources on scene shutdown */
  destroy() {
    for (const t of this.damageTexts) {
      if (t.active) t.destroy();
    }
    this.damageTexts = [];
  }
}
