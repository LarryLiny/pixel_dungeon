import Phaser from 'phaser';
import {
  FacingDirection,
  getDirectionFromVector,
  getEnemyTextureKey,
  PlayerMotionState,
} from '../utils/direction';

export interface EnemyData {
  key: string;
  hp: number;
  speed: number;
  score: number;
  scale: number;
  bodySize: number;
  damage: number;
  behavior: 'chase' | 'zigzag' | 'dash' | 'ranged' | 'tank' | 'phase' | 'boss';
}

export interface StatusEffect {
  type: 'slow' | 'poison';
  value: number;
  duration: number;
  startTime: number;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  enemyData: EnemyData;
  hp: number;
  maxHp: number;
  score: number;
  isAlive: boolean;
  scored: boolean;
  effects: StatusEffect[];
  lastDashTime: number;
  lastShootTime: number;
  zigzagOffset: number;
  phaseVisible: boolean;
  phaseTimer: number;

  // Wall avoidance
  stuckTimer: number = 0;
  lastX: number = 0;
  lastY: number = 0;
  wallAvoidAngle: number = 0;
  avoidingWall: boolean = false;
  facing: FacingDirection = 'down';
  motionState: PlayerMotionState = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number, enemyData: EnemyData) {
    super(scene, x, y, enemyData.key);

    this.enemyData = enemyData;
    this.hp = enemyData.hp;
    this.maxHp = enemyData.hp;
    this.score = enemyData.score;
    this.isAlive = true;
    this.scored = false;
    this.effects = [];
    this.lastDashTime = 0;
    this.lastShootTime = 0;
    this.zigzagOffset = Math.random() * Math.PI * 2;
    this.phaseVisible = true;
    this.phaseTimer = 0;
    this.lastX = x;
    this.lastY = y;

    this.setScale(enemyData.scale);
    this.setDepth(5);
  }

  initBody() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(this.enemyData.bodySize, this.enemyData.bodySize);
      body.setCollideWorldBounds(true);
      // Bounce slightly off walls to help unstuck
      body.setBounce(0.2, 0.2);
    }
  }

  getSpeed(): number {
    let speed = this.enemyData.speed;
    const slowEffect = this.effects.find(e => e.type === 'slow');
    if (slowEffect) {
      speed *= (1 - slowEffect.value);
    }
    return speed;
  }

  takeDamage(amount: number, effects?: StatusEffect[]) {
    if (!this.isAlive) return;
    this.hp -= amount;

    if (effects) {
      for (const effect of effects) {
        this.applyEffect(effect);
      }
    }

    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.isAlive && this.active) this.clearTint();
    });

    if (this.hp <= 0) {
      this.die();
    }
  }

  applyEffect(effect: StatusEffect) {
    const existing = this.effects.find(e => e.type === effect.type);
    if (existing) {
      // Keep the stronger effect: higher slow value or longer remaining poison
      const isStronger = effect.type === 'slow'
        ? effect.value > existing.value
        : effect.value > existing.value;
      if (isStronger || effect.duration > existing.duration - (this.scene.time.now - existing.startTime)) {
        existing.value = effect.value;
        existing.duration = effect.duration;
        existing.startTime = effect.startTime;
      }
    } else {
      this.effects.push({ ...effect });
    }
  }

  updateEffects(time: number) {
    this.effects = this.effects.filter(e => {
      const elapsed = time - e.startTime;
      if (elapsed >= e.duration) return false;

      if (e.type === 'poison') {
        const dps = e.value;
        const dt = Math.min(this.scene.game.loop.delta / 1000, 0.05);
        this.hp -= dps * dt;
        if (this.hp <= 0) this.die();
      }
      return true;
    });
  }

  /** Check if stuck (not moving much) and engage wall avoidance */
  checkStuck(delta: number): boolean {
    this.stuckTimer += delta;

    // Check every 500ms
    if (this.stuckTimer < 500) return this.avoidingWall;
    this.stuckTimer = 0;

    const dx = this.x - this.lastX;
    const dy = this.y - this.lastY;
    const moved = dx * dx + dy * dy;
    this.lastX = this.x;
    this.lastY = this.y;

    // If barely moved (< 2px in 500ms), consider stuck
    if (moved < 4) {
      if (!this.avoidingWall) {
        // Pick a perpendicular avoidance angle
        this.wallAvoidAngle = Math.random() * Math.PI * 2;
        this.avoidingWall = true;
      } else {
        // Already avoiding, try different angle
        this.wallAvoidAngle += Math.PI * 0.5;
      }
      return true;
    } else {
      this.avoidingWall = false;
      return false;
    }
  }

  update(time: number, delta: number, playerX: number, playerY: number) {
    if (!this.isAlive || !this.active) return;

    this.updateEffects(time);

    const speed = this.getSpeed();
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const nx = dx / len;
    const ny = dy / len;

    // Check if stuck on wall
    const stuck = this.checkStuck(delta);

    if (stuck) {
      // Wall avoidance: move in avoidance direction for a bit
      const ax = Math.cos(this.wallAvoidAngle) * speed;
      const ay = Math.sin(this.wallAvoidAngle) * speed;
      this.setVelocity(ax, ay);
      this.updateFacingTexture(ax, ay, time);
      return;
    }

    let vx = 0;
    let vy = 0;

    switch (this.enemyData.behavior) {
      case 'chase':
        vx = nx * speed;
        vy = ny * speed;
        break;
      case 'zigzag':
        vx = nx * speed + Math.sin(time / 300 + this.zigzagOffset) * speed * 0.5;
        vy = ny * speed + Math.cos(time / 300 + this.zigzagOffset) * speed * 0.5;
        break;
      case 'dash':
        if (time - this.lastDashTime > 3000) {
          vx = nx * speed * 3;
          vy = ny * speed * 3;
          this.lastDashTime = time;
        } else {
          vx = nx * speed * 0.5;
          vy = ny * speed * 0.5;
        }
        break;
      case 'tank':
        vx = nx * speed;
        vy = ny * speed;
        break;
      case 'ranged':
        if (len < 150) {
          vx = -nx * speed;
          vy = -ny * speed;
        } else if (len > 250) {
          vx = nx * speed;
          vy = ny * speed;
        } else {
          // Strafe instead of standing still
          vx = -ny * speed * 0.6;
          vy = nx * speed * 0.6;
        }
        break;
      case 'phase':
        this.phaseTimer += delta;
        if (this.phaseTimer > 2000) {
          this.phaseVisible = !this.phaseVisible;
          this.phaseTimer = 0;
          this.setAlpha(this.phaseVisible ? 1 : 0.3);
        }
        vx = nx * speed;
        vy = ny * speed;
        break;
      case 'boss':
        const angle = time / 1000;
        vx = nx * speed + Math.cos(angle) * speed * 0.7;
        vy = ny * speed + Math.sin(angle) * speed * 0.7;
        break;
    }

    this.setVelocity(vx, vy);
    this.updateFacingTexture(vx, vy, time);
  }

  die() {
    this.isAlive = false;
    this.effects = [];
    this.setActive(false).setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.stop();
    }
  }

  private updateFacingTexture(vx: number, vy: number, time: number) {
    this.facing = getDirectionFromVector(vx, vy, this.facing);
    const moving = vx !== 0 || vy !== 0;
    this.motionState = moving
      ? (Math.floor(time / 220) % 2 === 0 ? 'walk1' : 'walk2')
      : 'idle';

    const key = getEnemyTextureKey(this.enemyData.key, this.facing, this.motionState);
    if (this.texture.key !== key && this.scene.textures.exists(key)) {
      this.setTexture(key);
      this.setFlipX(false);
    }
  }
}
