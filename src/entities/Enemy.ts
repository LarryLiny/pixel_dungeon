import Phaser from 'phaser';

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
      return;
    }

    switch (this.enemyData.behavior) {
      case 'chase':
        this.setVelocity(nx * speed, ny * speed);
        break;
      case 'zigzag':
        this.setVelocity(
          nx * speed + Math.sin(time / 300 + this.zigzagOffset) * speed * 0.5,
          ny * speed + Math.cos(time / 300 + this.zigzagOffset) * speed * 0.5
        );
        break;
      case 'dash':
        if (time - this.lastDashTime > 3000) {
          this.setVelocity(nx * speed * 3, ny * speed * 3);
          this.lastDashTime = time;
        } else {
          this.setVelocity(nx * speed * 0.5, ny * speed * 0.5);
        }
        break;
      case 'tank':
        this.setVelocity(nx * speed, ny * speed);
        break;
      case 'ranged':
        if (len < 150) {
          this.setVelocity(-nx * speed, -ny * speed);
        } else if (len > 250) {
          this.setVelocity(nx * speed, ny * speed);
        } else {
          // Strafe instead of standing still
          const perpX = -ny * speed * 0.6;
          const perpY = nx * speed * 0.6;
          this.setVelocity(perpX, perpY);
        }
        break;
      case 'phase':
        this.phaseTimer += delta;
        if (this.phaseTimer > 2000) {
          this.phaseVisible = !this.phaseVisible;
          this.phaseTimer = 0;
          this.setAlpha(this.phaseVisible ? 1 : 0.3);
        }
        this.setVelocity(nx * speed, ny * speed);
        break;
      case 'boss':
        const angle = time / 1000;
        this.setVelocity(
          nx * speed + Math.cos(angle) * speed * 0.7,
          ny * speed + Math.sin(angle) * speed * 0.7
        );
        break;
    }

    if (dx < 0) this.setFlipX(true);
    else this.setFlipX(false);
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
}
