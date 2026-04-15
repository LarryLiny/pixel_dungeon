import Phaser from 'phaser';
import { BULLET_SPEED, BULLET_SIZE, BULLET_DAMAGE, BULLET_RANGE } from '../constants';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  damage: number;
  pierce: number;
  pierceCount: number;
  slowOnHit: number;
  slowDuration: number;
  poisonDps: number;
  poisonDuration: number;
  chainCount: number;
  splashRadius: number;
  originX: number;
  originY: number;

  // Boomerang support
  returning: boolean;
  maxDistance: number;
  returnSpeed: number;
  weaponType: string;
  executeThreshold: number;
  /** Reference to player for boomerang return targeting */
  playerRef: Phaser.Physics.Arcade.Sprite | null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');
    this.damage = BULLET_DAMAGE;
    this.pierce = 0;
    this.pierceCount = 0;
    this.slowOnHit = 0;
    this.slowDuration = 0;
    this.poisonDps = 0;
    this.poisonDuration = 0;
    this.chainCount = 0;
    this.splashRadius = 0;
    this.originX = x;
    this.originY = y;
    this.returning = false;
    this.maxDistance = 250;
    this.returnSpeed = 400;
    this.weaponType = '';
    this.executeThreshold = 0;
    this.playerRef = null;

    this.setScale(1.2);
    this.setDepth(8);
  }

  fire(targetX: number, targetY: number, damage: number, angle: number = 0, speed: number = BULLET_SPEED) {
    this.damage = damage;
    this.originX = this.x;
    this.originY = this.y;
    this.pierceCount = 0;
    this.returning = false;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) { this.recycle(); return; }

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = (dx / len) * cos - (dy / len) * sin;
    const ny = (dx / len) * sin + (dy / len) * cos;

    // Ensure body is ready before setting velocity
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(BULLET_SIZE, BULLET_SIZE);
      body.setVelocity(nx * speed, ny * speed);
      body.enable = true;
    }
    this.setRotation(Math.atan2(ny, nx));
    this.setActive(true).setVisible(true);
  }

  /** Called every frame by AutoShootSystem for boomerang update logic */
  updateBoomerang() {
    if (!this.active || !this.playerRef) return;
    if (this.weaponType !== 'boomerang' && this.weaponType !== 'death_wheel') return;

    const dx = this.x - this.originX;
    const dy = this.y - this.originY;
    const distFromOrigin = Math.sqrt(dx * dx + dy * dy);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    if (!this.returning) {
      // Check if bullet has travelled far enough to start returning
      if (distFromOrigin >= this.maxDistance) {
        this.returning = true;
        this.setScale(this.scaleX * 0.7); // shrink when returning
      }
    }

    if (this.returning) {
      // Calculate direction toward player
      const toPlayerX = this.playerRef.x - this.x;
      const toPlayerY = this.playerRef.y - this.y;
      const toPlayerLen = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY);

      if (toPlayerLen < 15) {
        // Returned to player, recycle
        this.recycle();
        return;
      }

      const nx = toPlayerX / toPlayerLen;
      const ny = toPlayerY / toPlayerLen;
      body.setVelocity(nx * this.returnSpeed, ny * this.returnSpeed);
      this.setRotation(Math.atan2(ny, nx));

      // Gradually shrink as it gets closer
      const shrinkFactor = Math.max(0.4, toPlayerLen / this.maxDistance);
      this.setScale(shrinkFactor * 1.2);
    }
  }

  onHitEnemy() {
    // Boomerang-type bullets don't die on hit — they keep going or returning
    if (this.weaponType === 'boomerang' || this.weaponType === 'death_wheel') {
      this.pierceCount++;
      // Only recycle if pierce limit reached AND already returning
      if (this.pierceCount > this.pierce + 5 && this.returning) {
        this.recycle();
      }
      return;
    }
    this.pierceCount++;
    if (this.pierceCount > this.pierce) {
      this.recycle();
    }
  }

  recycle() {
    this.setActive(false).setVisible(false);
    this.returning = false;
    this.weaponType = '';
    this.executeThreshold = 0;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.stop();
      body.enable = false;
    }
  }
}
