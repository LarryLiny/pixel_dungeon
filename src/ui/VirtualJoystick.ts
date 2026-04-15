import Phaser from 'phaser';

/** Detect if device is touch-primary */
function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export class VirtualJoystick {
  scene: Phaser.Scene;
  base: Phaser.GameObjects.Arc;
  thumb: Phaser.GameObjects.Arc;
  ring: Phaser.GameObjects.Arc;
  isActive: boolean;
  pointerId: number;
  baseX: number;
  baseY: number;
  dx: number;
  dy: number;
  radius: number;
  deadZone: number;
  isMobile: boolean;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isActive = false;
    this.pointerId = -1;
    this.dx = 0;
    this.dy = 0;
    this.radius = 55;
    this.deadZone = 8;
    this.baseX = 0;
    this.baseY = 0;
    this.isMobile = isTouchDevice();

    // Outer ring (subtle guide)
    this.ring = scene.add.circle(0, 0, this.radius + 8, 0x6666aa, 0.15)
      .setDepth(99)
      .setVisible(false)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0x8888cc, 0.3);

    // Base circle
    this.base = scene.add.circle(0, 0, this.radius, 0x444466, 0.35)
      .setDepth(100)
      .setVisible(false)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0x7777aa, 0.4);

    // Thumb (finger indicator)
    this.thumb = scene.add.circle(0, 0, 22, 0xaaaacc, 0.6)
      .setDepth(101)
      .setVisible(false)
      .setScrollFactor(0)
      .setStrokeStyle(2, 0xccccff, 0.5);

    this.setupInput();

    // On desktop, hide joystick visuals entirely (still works via WASD)
    if (!this.isMobile) {
      this.base.setAlpha(0);
      this.thumb.setAlpha(0);
      this.ring.setAlpha(0);
    }
  }

  private setupInput() {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isActive) return;

      const sw = this.scene.scale.width;
      const sh = this.scene.scale.height;

      // Only respond to touches in the left 60% of screen, bottom 70%
      if (pointer.x < sw * 0.6 && pointer.y > sh * 0.3) {
        this.isActive = true;
        this.pointerId = pointer.id;
        this.baseX = pointer.x;
        this.baseY = pointer.y;

        this.ring.setPosition(pointer.x, pointer.y).setVisible(true);
        this.base.setPosition(pointer.x, pointer.y).setVisible(true);
        this.thumb.setPosition(pointer.x, pointer.y).setVisible(true);

        if (this.isMobile) {
          this.ring.setAlpha(0.15);
          this.base.setAlpha(0.35);
          this.thumb.setAlpha(0.6);
        }
      }
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isActive || pointer.id !== this.pointerId) return;

      const rawDx = pointer.x - this.baseX;
      const rawDy = pointer.y - this.baseY;
      const dist = Math.sqrt(rawDx * rawDx + rawDy * rawDy);

      // Dead zone
      if (dist < this.deadZone) {
        this.dx = 0;
        this.dy = 0;
        this.thumb.setPosition(this.baseX, this.baseY);
        return;
      }

      if (dist > this.radius) {
        this.dx = rawDx / dist;
        this.dy = rawDy / dist;
        this.thumb.setPosition(
          this.baseX + this.dx * this.radius,
          this.baseY + this.dy * this.radius
        );
      } else {
        this.dx = rawDx / this.radius;
        this.dy = rawDy / this.radius;
        this.thumb.setPosition(pointer.x, pointer.y);
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this.pointerId) return;
      this.deactivate();
    });

    // Also handle pointercancel (finger slides off screen edge)
    this.scene.input.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id !== this.pointerId) return;
      this.deactivate();
    });
  }

  private deactivate() {
    this.isActive = false;
    this.dx = 0;
    this.dy = 0;
    this.pointerId = -1;

    if (this.isMobile) {
      this.base.setVisible(false);
      this.thumb.setVisible(false);
      this.ring.setVisible(false);
    }
  }

  getDirection(): { x: number; y: number } {
    return { x: this.dx, y: this.dy };
  }

  destroy() {
    this.ring.destroy();
    this.base.destroy();
    this.thumb.destroy();
  }
}
