import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Bullet } from '../entities/Bullet';
import { Enemy } from '../entities/Enemy';
import { SHOOT_INTERVAL, BULLET_DAMAGE, BULLET_SPEED, BULLET_RANGE } from '../constants';
import { distance } from '../utils/helpers';

/** Poison cloud data */
interface PoisonCloud {
  x: number;
  y: number;
  radius: number;
  dps: number;
  duration: number;
  startTime: number;
  graphic: Phaser.GameObjects.Arc;
}

export class AutoShootSystem {
  scene: Phaser.Scene;
  player: Player;
  bullets: Phaser.Physics.Arcade.Group;
  lastShootTime: number;
  shootInterval: number;

  // Orbiting fireballs (orb system)
  orbs: Phaser.Physics.Arcade.Sprite[] = [];

  // Sword slash visuals
  slashVisuals: Phaser.GameObjects.Arc[] = [];
  lastSlashTime: number = 0;

  // Ice wave visuals
  iceWaves: Phaser.GameObjects.Arc[] = [];
  lastIceWaveTime: number = 0;

  // Laser beam
  laserGraphics: Phaser.GameObjects.Graphics | null = null;
  laserTarget: Enemy | null = null;
  photonImpactCircle: Phaser.GameObjects.Arc | null = null;

  // Lightning system
  lightningGraphics: Phaser.GameObjects.Graphics | null = null;
  lastLightningTime: number = 0;

  // Poison clouds
  poisonClouds: PoisonCloud[] = [];

  /** Called when an orb kills an enemy — set by GameScene */
  onOrbKill: ((enemy: Enemy) => void) | null = null;
  /** Called when any weapon kills — for score/fragment tracking */
  onWeaponKill: ((enemy: Enemy) => void) | null = null;

  constructor(scene: Phaser.Scene, player: Player, bullets: Phaser.Physics.Arcade.Group) {
    this.scene = scene;
    this.player = player;
    this.bullets = bullets;
    this.lastShootTime = 0;
    this.shootInterval = SHOOT_INTERVAL;
  }

  update(time: number, enemies: Enemy[]) {
    if (!this.player.isAlive) return;

    const mod = this.player.modifiers;
    const weaponType = mod.weaponType;

    // ── Bullet recycling & boomerang update ──
    this.updateBullets(enemies);

    // ── Weapon-type specific update systems ──
    // Orbiting fireballs (fireball_orbit, hellfire, tracking_fireball, sun_storm)
    if (weaponType === 'fireball_orbit' || weaponType === 'hellfire' || weaponType === 'tracking_fireball' || weaponType === 'sun_storm') {
      this.updateOrbs(time, enemies);
    } else {
      this.clearOrbs();
    }

    // Sword slash (sword_slash, thunder_slash)
    if (weaponType === 'sword_slash' || weaponType === 'thunder_slash') {
      this.updateSwordSlash(time, enemies);
    }

    // Ice wave (ice_wave, frost_storm)
    if (weaponType === 'ice_wave' || weaponType === 'frost_storm') {
      this.updateIceWave(time, enemies);
    }

    // Laser beam (laser_beam, photon_cannon)
    if (weaponType === 'laser_beam' || weaponType === 'photon_cannon') {
      this.updateLaserBeam(time, enemies);
    } else {
      this.clearLaser();
    }

    // Lightning (lightning, thunderstorm) — no bullets, direct damage + chain
    if (weaponType === 'lightning' || weaponType === 'thunderstorm') {
      this.updateLightning(time, enemies);
    } else {
      this.clearLightning();
    }

    // Poison clouds update
    this.updatePoisonClouds(time, enemies);

    // ── Bullet-firing weapons ──
    // These weapons fire actual bullet projectiles on a timer
    const bulletFiringWeapons = [
      'basic_shot', 'shotgun', 'freeze_shotgun', 'fragment_bomb',
      'boomerang', 'death_wheel',
      'poison_snake', 'plague_bomb',
      'death_scythe', 'soul_reaper',
      'mega_blaster',
    ];

    if (!bulletFiringWeapons.includes(weaponType)) return;

    const effectiveInterval = this.shootInterval * (mod.attackSpeedMul || 1.0);
    if (time - this.lastShootTime < effectiveInterval) return;

    // Find nearest enemy
    const nearest = this.findNearestEnemy(enemies);
    if (!nearest) return;

    this.lastShootTime = time;
    const damage = BULLET_DAMAGE * mod.damageMul;

    switch (weaponType) {
      // ── 1. basic_shot: yellow single bullet ──
      case 'basic_shot':
      default: {
        const extraShots = mod.shotCount;
        if (extraShots === 0) {
          this.fireBullet(nearest.x, nearest.y, damage, 0, weaponType);
        } else {
          const spreadAngle = 0.1 * extraShots;
          for (let i = 0; i < 1 + extraShots; i++) {
            const angleOffset = (1 + extraShots) > 1
              ? -spreadAngle / 2 + (spreadAngle * i) / extraShots : 0;
            this.fireBullet(nearest.x, nearest.y, damage, angleOffset, weaponType);
          }
        }
        break;
      }

      // ── 2. shotgun / freeze_shotgun / fragment_bomb: orange fan burst ──
      case 'shotgun':
      case 'freeze_shotgun':
      case 'fragment_bomb': {
        const count = 3 + mod.shotCount;
        const spreadAngle = 0.15 * (count - 1);
        for (let i = 0; i < count; i++) {
          const angleOffset = count > 1
            ? -spreadAngle / 2 + (spreadAngle * i) / (count - 1) : 0;
          const bulletDamage = weaponType === 'fragment_bomb' ? damage * 0.5 : damage * 0.6;
          this.fireBullet(nearest.x, nearest.y, bulletDamage, angleOffset, weaponType);
        }
        break;
      }

      // ── 4. boomerang / death_wheel: green returning projectile ──
      case 'boomerang':
      case 'death_wheel': {
        const boomerangCount = mod.boomerangCount || 1;
        const extraShots2 = mod.shotCount;
        const total = boomerangCount + extraShots2;
        const boomerangSpread = total > 1 ? 0.3 : 0;
        for (let i = 0; i < total; i++) {
          const angleOffset = total > 1
            ? -boomerangSpread / 2 + (boomerangSpread * i) / (total - 1) : 0;
          const dmg = weaponType === 'death_wheel' ? damage * 1.2 : damage * 0.9;
          this.fireBoomerang(nearest.x, nearest.y, dmg, angleOffset, weaponType);
        }
        break;
      }

      // ── 8. poison_snake / plague_bomb: green bullet leaving poison clouds ──
      case 'poison_snake':
      case 'plague_bomb': {
        const poisonDmg = weaponType === 'plague_bomb' ? damage * 0.5 : damage * 0.7;
        const cloudDps = mod.poisonDpsField || 5;
        this.firePoisonBullet(nearest.x, nearest.y, poisonDmg, 0, weaponType, cloudDps);
        // plague_bomb fires extra shots
        if (weaponType === 'plague_bomb' && mod.shotCount > 0) {
          for (let i = 0; i < mod.shotCount; i++) {
            const angleOffset = (Math.random() - 0.5) * 0.4;
            this.firePoisonBullet(nearest.x, nearest.y, poisonDmg * 0.7, angleOffset, weaponType, cloudDps);
          }
        }
        break;
      }

      // ── 10. death_scythe / soul_reaper: large purple execute bullet ──
      case 'death_scythe':
      case 'soul_reaper': {
        const scytheDamage = weaponType === 'soul_reaper' ? damage * 2.0 : damage * 1.5;
        this.fireScytheBullet(nearest.x, nearest.y, scytheDamage, 0, weaponType);
        break;
      }

      // ── mega_blaster fallback ──
      case 'mega_blaster': {
        this.fireBullet(nearest.x, nearest.y, damage * 2.0, 0, weaponType, 0, 0, 0, true);
        break;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // BULLET MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════

  /** Update all active bullets: recycle out-of-range, update boomerangs */
  private updateBullets(enemies: Enemy[]) {
    const bulletChildren = this.bullets.getChildren() as Bullet[];
    for (const b of bulletChildren) {
      if (!b.active) continue;

      // Boomerang update
      if (b.weaponType === 'boomerang' || b.weaponType === 'death_wheel') {
        b.updateBoomerang();
        continue;
      }

      // Standard range recycling
      const dx = b.x - b.originX;
      const dy = b.y - b.originY;
      if (dx * dx + dy * dy > BULLET_RANGE * BULLET_RANGE) {
        b.recycle();
      }
      if (b.x < -50 || b.y < -50 || b.x > 10000 || b.y > 10000) {
        b.recycle();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. BASIC SHOT
  // ═══════════════════════════════════════════════════════════════════

  /** Generic fire bullet — used for basic_shot, shotgun, mega_blaster */
  private fireBullet(
    targetX: number, targetY: number, damage: number, angleOffset: number,
    weaponType: string = '',
    chainCount: number = 0,
    poisonDps: number = 0,
    executeThreshold: number = 0,
    mega: boolean = false,
  ) {
    let bullet = this.bullets.get(this.player.x, this.player.y) as Bullet | null;
    if (!bullet) {
      const active = this.bullets.getChildren().find(b => (b as Bullet).active) as Bullet | undefined;
      if (active) {
        active.recycle();
        bullet = this.bullets.get(this.player.x, this.player.y) as Bullet;
      }
    }
    if (!bullet) return;

    bullet.setPosition(this.player.x, this.player.y);

    const mod = this.player.modifiers;
    const speed = BULLET_SPEED * mod.bulletSpeedMul * (mega ? 0.6 : 1.0);

    bullet.damage = damage;
    bullet.pierce = mega ? (mod.pierce + 3) : mod.pierce;
    bullet.pierceCount = 0;
    bullet.chainCount = chainCount || mod.chainCount;
    bullet.splashRadius = mod.splashRadius;
    bullet.slowOnHit = mod.slowOnHit || (weaponType === 'freeze_shotgun' ? 0.6 : 0);
    bullet.slowDuration = mod.slowDuration || (weaponType === 'freeze_shotgun' ? 2.0 : 0);
    bullet.poisonDps = mod.poisonDps || poisonDps;
    bullet.poisonDuration = mod.poisonDuration || (poisonDps > 0 ? 3.0 : 0);
    bullet.weaponType = weaponType;
    bullet.executeThreshold = 0;
    bullet.returning = false;
    bullet.playerRef = null;

    const size = mega ? 2.5 : 1.2;
    bullet.setScale(size * mod.bulletSizeMul);

    // Weapon-specific texture tint
    this.applyBulletTint(bullet, weaponType);

    bullet.fire(targetX, targetY, damage, angleOffset, speed);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 4. BOOMERANG / DEATH_WHEEL
  // ═══════════════════════════════════════════════════════════════════

  private fireBoomerang(
    targetX: number, targetY: number, damage: number, angleOffset: number,
    weaponType: string,
  ) {
    let bullet = this.bullets.get(this.player.x, this.player.y) as Bullet | null;
    if (!bullet) {
      const active = this.bullets.getChildren().find(b => (b as Bullet).active) as Bullet | undefined;
      if (active) {
        active.recycle();
        bullet = this.bullets.get(this.player.x, this.player.y) as Bullet;
      }
    }
    if (!bullet) return;

    bullet.setPosition(this.player.x, this.player.y);

    const mod = this.player.modifiers;
    const speed = BULLET_SPEED * mod.bulletSpeedMul * 0.85;

    bullet.damage = damage;
    bullet.pierce = mod.pierce + 3; // boomerangs pierce through multiple enemies
    bullet.pierceCount = 0;
    bullet.chainCount = 0;
    bullet.splashRadius = weaponType === 'death_wheel' ? 25 : 0;
    bullet.slowOnHit = 0;
    bullet.slowDuration = 0;
    bullet.poisonDps = 0;
    bullet.poisonDuration = 0;
    bullet.weaponType = weaponType;
    bullet.executeThreshold = 0;
    bullet.returning = false;
    bullet.maxDistance = BULLET_RANGE * 0.6;
    bullet.returnSpeed = BULLET_SPEED * mod.bulletSpeedMul * 1.1;
    bullet.playerRef = this.player;

    const size = weaponType === 'death_wheel' ? 2.0 : 1.5;
    bullet.setScale(size * mod.bulletSizeMul);

    // Green tint for boomerang
    bullet.setTint(weaponType === 'death_wheel' ? 0x44ff88 : 0x88ff44);

    bullet.fire(targetX, targetY, damage, angleOffset, speed);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 8. POISON_SNAKE / PLAGUE_BOMB
  // ═══════════════════════════════════════════════════════════════════

  private firePoisonBullet(
    targetX: number, targetY: number, damage: number, angleOffset: number,
    weaponType: string, cloudDps: number,
  ) {
    let bullet = this.bullets.get(this.player.x, this.player.y) as Bullet | null;
    if (!bullet) {
      const active = this.bullets.getChildren().find(b => (b as Bullet).active) as Bullet | undefined;
      if (active) {
        active.recycle();
        bullet = this.bullets.get(this.player.x, this.player.y) as Bullet;
      }
    }
    if (!bullet) return;

    bullet.setPosition(this.player.x, this.player.y);

    const mod = this.player.modifiers;
    const speed = BULLET_SPEED * mod.bulletSpeedMul * 0.9;

    bullet.damage = damage;
    bullet.pierce = 0;
    bullet.pierceCount = 0;
    bullet.chainCount = 0;
    bullet.splashRadius = 0;
    bullet.slowOnHit = 0;
    bullet.slowDuration = 0;
    bullet.poisonDps = 0;
    bullet.poisonDuration = 0;
    bullet.weaponType = weaponType;
    bullet.executeThreshold = 0;
    bullet.returning = false;
    bullet.playerRef = null;

    bullet.setScale(1.3 * mod.bulletSizeMul);
    bullet.setTint(0x44cc22); // green poison

    // Store cloud dps for on-hit handling
    (bullet as any)._cloudDps = cloudDps;
    (bullet as any)._weaponType = weaponType;

    bullet.fire(targetX, targetY, damage, angleOffset, speed);
  }

  /** Spawn a poison cloud at position — called from GameScene on bullet hit */
  spawnPoisonCloud(x: number, y: number, dps: number, duration: number) {
    const radius = 30;
    const graphic = this.scene.add.circle(x, y, radius, 0x44cc22, 0.25).setDepth(7);
    this.scene.tweens.add({
      targets: graphic,
      alpha: 0,
      duration: duration * 1000,
      onComplete: () => { if (graphic.active) graphic.destroy(); },
    });
    this.poisonClouds.push({
      x, y, radius, dps,
      duration: duration * 1000,
      startTime: this.scene.time.now,
      graphic,
    });
  }

  private updatePoisonClouds(time: number, enemies: Enemy[]) {
    const dt = this.scene.game.loop.delta / 1000;
    this.poisonClouds = this.poisonClouds.filter(cloud => {
      const elapsed = time - cloud.startTime;
      if (elapsed >= cloud.duration) {
        if (cloud.graphic.active) cloud.graphic.destroy();
        return false;
      }

      // Damage enemies inside cloud
      for (const enemy of enemies) {
        if (!enemy.isAlive || !enemy.active) continue;
        const dist = distance(cloud.x, cloud.y, enemy.x, enemy.y);
        if (dist < cloud.radius + 10) {
          enemy.takeDamage(cloud.dps * dt);
          if (!enemy.isAlive && this.onWeaponKill) {
            this.onWeaponKill(enemy);
          }
        }
      }
      return true;
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 10. DEATH_SCYTHE / SOUL_REAPER
  // ═══════════════════════════════════════════════════════════════════

  private fireScytheBullet(
    targetX: number, targetY: number, damage: number, angleOffset: number,
    weaponType: string,
  ) {
    let bullet = this.bullets.get(this.player.x, this.player.y) as Bullet | null;
    if (!bullet) {
      const active = this.bullets.getChildren().find(b => (b as Bullet).active) as Bullet | undefined;
      if (active) {
        active.recycle();
        bullet = this.bullets.get(this.player.x, this.player.y) as Bullet;
      }
    }
    if (!bullet) return;

    bullet.setPosition(this.player.x, this.player.y);

    const mod = this.player.modifiers;
    const speed = BULLET_SPEED * mod.bulletSpeedMul * 0.7; // large and slow

    bullet.damage = damage;
    bullet.pierce = mod.pierce + 2;
    bullet.pierceCount = 0;
    bullet.chainCount = 0;
    bullet.splashRadius = weaponType === 'soul_reaper' ? 20 : 0;
    bullet.slowOnHit = 0;
    bullet.slowDuration = 0;
    bullet.poisonDps = 0;
    bullet.poisonDuration = 0;
    bullet.weaponType = weaponType;
    bullet.executeThreshold = mod.executeThreshold || 0.15;
    bullet.returning = false;
    bullet.playerRef = null;

    const size = weaponType === 'soul_reaper' ? 3.0 : 2.5;
    bullet.setScale(size * mod.bulletSizeMul);
    bullet.setTint(0xcc44ff); // purple

    bullet.fire(targetX, targetY, damage, angleOffset, speed);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. ORBITING FIREBALLS (fireball_orbit, hellfire, tracking_fireball, sun_storm)
  // ═══════════════════════════════════════════════════════════════════

  private updateOrbs(time: number, enemies: Enemy[]) {
    const mod = this.player.modifiers;
    const targetCount = mod.orbCount;
    const weaponType = mod.weaponType;

    // Spawn or remove orbs to match target count
    while (this.orbs.length < targetCount) {
      const orb = this.scene.physics.add.sprite(this.player.x, this.player.y, 'fireball_orb') as Phaser.Physics.Arcade.Sprite;
      orb.setScale(1.8).setDepth(9);
      this.orbs.push(orb);
    }
    while (this.orbs.length > targetCount) {
      this.orbs.pop()!.destroy();
    }

    // Weapon-specific orb behavior
    const orbitRadius = weaponType === 'sun_storm' ? 70 : 50;
    const orbitSpeed = weaponType === 'hellfire' ? 1.0 : 0.8;
    const orbDamage = BULLET_DAMAGE * mod.damageMul * (weaponType === 'sun_storm' ? 0.8 : 0.5);

    for (let i = 0; i < this.orbs.length; i++) {
      const orb = this.orbs[i];

      // Tint based on weapon type
      if (weaponType === 'hellfire') {
        orb.setTint(0xff4400);
        orb.setScale(2.0);
      } else if (weaponType === 'sun_storm') {
        orb.setTint(0xff8800);
        orb.setScale(2.5);
      } else if (weaponType === 'tracking_fireball') {
        orb.setTint(0xff2200);
        orb.setScale(1.6);
      } else {
        orb.setTint(0xff4400);
        orb.setScale(1.8);
      }

      // Orbit position
      const angle = (time / (800 / orbitSpeed)) + (i * Math.PI * 2 / Math.max(1, this.orbs.length));
      let ox: number, oy: number;

      if (weaponType === 'tracking_fireball') {
        // Tracking fireballs: orbit but also gravitate toward nearest enemy
        const nearest = this.findNearestEnemy(enemies);
        if (nearest) {
          const baseX = this.player.x + Math.cos(angle) * orbitRadius;
          const baseY = this.player.y + Math.sin(angle) * orbitRadius;
          // Blend 70% orbit + 30% toward enemy
          ox = baseX * 0.7 + nearest.x * 0.3;
          oy = baseY * 0.7 + nearest.y * 0.3;
        } else {
          ox = this.player.x + Math.cos(angle) * orbitRadius;
          oy = this.player.y + Math.sin(angle) * orbitRadius;
        }
      } else {
        ox = this.player.x + Math.cos(angle) * orbitRadius;
        oy = this.player.y + Math.sin(angle) * orbitRadius;
      }

      orb.setPosition(ox, oy);

      const body = orb.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(0, 0);
        body.setSize(12, 12);
      }

      // Damage enemies touching orbs
      for (const enemy of enemies) {
        if (!enemy.isAlive || !enemy.active) continue;
        const dist = distance(ox, oy, enemy.x, enemy.y);
        if (dist < 18) {
          enemy.takeDamage(orbDamage);
          if (!enemy.isAlive && this.onOrbKill) {
            this.onOrbKill(enemy);
          }
        }
      }
    }
  }

  private clearOrbs() {
    this.orbs.forEach(o => o.destroy());
    this.orbs = [];
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. LIGHTNING / THUNDERSTORM (no bullets — direct damage + chain)
  // ═══════════════════════════════════════════════════════════════════

  private updateLightning(time: number, enemies: Enemy[]) {
    const mod = this.player.modifiers;
    const weaponType = mod.weaponType;
    const interval = (weaponType === 'thunderstorm' ? 400 : 600) * (mod.attackSpeedMul || 1.0);

    if (time - this.lastLightningTime < interval) return;
    this.lastLightningTime = time;

    // Find nearest enemy within range
    let nearest: Enemy | null = null;
    let nearestDist = Infinity;
    for (const enemy of enemies) {
      if (!enemy.isAlive || !enemy.active) continue;
      const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist < 300 && dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }
    if (!nearest) return;

    const damage = BULLET_DAMAGE * mod.damageMul * (weaponType === 'thunderstorm' ? 1.0 : 0.8);
    const chainCount = mod.chainCount + (weaponType === 'thunderstorm' ? 3 : 1);

    // Draw lightning graphics
    if (!this.lightningGraphics) {
      this.lightningGraphics = this.scene.add.graphics().setDepth(9);
    }
    this.lightningGraphics.clear();

    // Strike the nearest enemy
    this.strikeLightning(this.player.x, this.player.y, nearest, damage, chainCount, enemies);
  }

  private strikeLightning(
    fromX: number, fromY: number, target: Enemy,
    damage: number, chainsLeft: number, enemies: Enemy[],
  ) {
    // Deal damage
    target.takeDamage(damage);
    if (!target.isAlive && this.onWeaponKill) {
      this.onWeaponKill(target);
    }

    // Draw zigzag lightning line
    this.drawLightningBolt(fromX, fromY, target.x, target.y);

    // Chain to nearby enemies
    if (chainsLeft > 0) {
      const chainRange = 120;
      let closest: Enemy | null = null;
      let closestDist = Infinity;
      for (const enemy of enemies) {
        if (!enemy.isAlive || !enemy.active || enemy === target) continue;
        const dist = distance(target.x, target.y, enemy.x, enemy.y);
        if (dist < chainRange && dist < closestDist) {
          closestDist = dist;
          closest = enemy;
        }
      }
      if (closest) {
        // Slight delay for visual chaining effect
        this.scene.time.delayedCall(60, () => {
          if (closest!.isAlive) {
            this.strikeLightning(target.x, target.y, closest!, damage * 0.7, chainsLeft - 1, enemies);
          }
        });
      }
    }
  }

  private drawLightningBolt(x1: number, y1: number, x2: number, y2: number) {
    if (!this.lightningGraphics) return;

    const segments = 5;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const perpX = -dy / len;
    const perpY = dx / len;

    // Bright core
    this.lightningGraphics.lineStyle(3, 0x88ccff, 0.9);
    this.lightningGraphics.beginPath();
    this.lightningGraphics.moveTo(x1, y1);

    const points: { x: number; y: number }[] = [{ x: x1, y: y1 }];
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const jitter = (Math.random() - 0.5) * 20;
      const px = x1 + dx * t + perpX * jitter;
      const py = y1 + dy * t + perpY * jitter;
      this.lightningGraphics.lineTo(px, py);
      points.push({ x: px, y: py });
    }
    this.lightningGraphics.lineTo(x2, y2);
    points.push({ x: x2, y: y2 });
    this.lightningGraphics.strokePath();

    // White glow on top
    this.lightningGraphics.lineStyle(1, 0xffffff, 0.7);
    this.lightningGraphics.beginPath();
    this.lightningGraphics.moveTo(x1, y1);
    for (let i = 1; i < points.length - 1; i++) {
      this.lightningGraphics.lineTo(points[i].x, points[i].y);
    }
    this.lightningGraphics.lineTo(x2, y2);
    this.lightningGraphics.strokePath();

    // Clear after brief display
    this.scene.time.delayedCall(100, () => {
      if (this.lightningGraphics) this.lightningGraphics.clear();
    });
  }

  private clearLightning() {
    if (this.lightningGraphics) {
      this.lightningGraphics.clear();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 6. SWORD_SLASH / THUNDER_SLASH (no bullets — frontal arc)
  // ═══════════════════════════════════════════════════════════════════

  private updateSwordSlash(time: number, enemies: Enemy[]) {
    const mod = this.player.modifiers;
    const weaponType = mod.weaponType;
    const slashInterval = (weaponType === 'thunder_slash' ? 500 : 600) * (mod.attackSpeedMul || 1.0);

    if (time - this.lastSlashTime < slashInterval) return;
    this.lastSlashTime = time;

    // Find nearest enemy for slash direction
    const allEnemies = this.getEnemiesFromPhysics();

    let nearest: Enemy | null = null;
    let nearestDist = Infinity;
    for (const enemy of allEnemies) {
      if (!enemy.isAlive || !enemy.active) continue;
      const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist < nearestDist && dist < 120) {
        nearestDist = dist;
        nearest = enemy;
      }
    }

    const slashAngle = nearest
      ? Math.atan2(nearest.y - this.player.y, nearest.x - this.player.x)
      : (this.player.moveDir.x !== 0 || this.player.moveDir.y !== 0
        ? Math.atan2(this.player.moveDir.y, this.player.moveDir.x)
        : -Math.PI / 2);
    const slashRange = mod.swordRange || 80;
    const slashArc = mod.swordArcAngle || Math.PI * 0.6;
    const damage = BULLET_DAMAGE * mod.damageMul * (weaponType === 'thunder_slash' ? 1.5 : 1.0);

    // Visual: arc slash effect — multiple arcs for a more dramatic look
    const isThunder = weaponType === 'thunder_slash';
    const slashColor = isThunder ? 0x88aaff : 0xddddee;

    // Main arc
    const slashVisual = this.scene.add.arc(
      this.player.x + Math.cos(slashAngle) * 30,
      this.player.y + Math.sin(slashAngle) * 30,
      slashRange * 0.5, 0, 360, false,
      slashColor, 0.5,
    ).setDepth(9);
    this.scene.tweens.add({
      targets: slashVisual, alpha: 0, scaleX: 1.8, scaleY: 1.8,
      duration: 200, onComplete: () => slashVisual.destroy(),
    });

    // Trail arcs (thunder slash gets more arcs)
    const trailCount = isThunder ? 2 : 1;
    for (let t = 0; t < trailCount; t++) {
      const trailAngle = slashAngle + (t + 1) * 0.15;
      const trail = this.scene.add.arc(
        this.player.x + Math.cos(trailAngle) * 35,
        this.player.y + Math.sin(trailAngle) * 35,
        slashRange * 0.4, 0, 360, false,
        slashColor, 0.3,
      ).setDepth(9);
      this.scene.tweens.add({
        targets: trail, alpha: 0, scaleX: 1.5, scaleY: 1.5,
        duration: 250, delay: t * 50, onComplete: () => trail.destroy(),
      });
    }

    // Damage enemies in arc
    for (const enemy of allEnemies) {
      if (!enemy.isAlive || !enemy.active) continue;
      const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist > slashRange) continue;
      const angle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
      let angleDiff = Math.abs(angle - slashAngle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      if (angleDiff < slashArc / 2) {
        enemy.takeDamage(damage);
        // Thunder slash: chain mini-lightning to nearby enemy
        if (isThunder && enemy.isAlive) {
          const nearTarget = this.findNearestEnemyInRange(
            allEnemies.filter(e => e !== enemy), enemy.x, enemy.y, 80,
          );
          if (nearTarget) {
            // Draw mini chain
            const chainLine = this.scene.add.line(
              0, 0, enemy.x, enemy.y, nearTarget.x, nearTarget.y,
              0x88aaff, 0.5,
            ).setDepth(9).setLineWidth(2);
            this.scene.time.delayedCall(150, () => { if (chainLine.active) chainLine.destroy(); });
            nearTarget.takeDamage(damage * 0.3);
            if (!nearTarget.isAlive && this.onWeaponKill) {
              this.onWeaponKill(nearTarget);
            }
          }
        }
        if (!enemy.isAlive && this.onWeaponKill) {
          this.onWeaponKill(enemy);
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 7. ICE_WAVE / FROST_STORM (no bullets — frontal cone + expanding ring)
  // ═══════════════════════════════════════════════════════════════════

  private updateIceWave(time: number, enemies: Enemy[]) {
    const mod = this.player.modifiers;
    const weaponType = mod.weaponType;
    const interval = (weaponType === 'frost_storm' ? 1000 : 1500) * (mod.attackSpeedMul || 1.0);

    if (time - this.lastIceWaveTime < interval) return;
    this.lastIceWaveTime = time;

    const coneRange = weaponType === 'frost_storm' ? 130 : 100;
    const allEnemies = this.getEnemiesFromPhysics();

    // Determine facing direction
    const facingAngle = (this.player.moveDir.x !== 0 || this.player.moveDir.y !== 0)
      ? Math.atan2(this.player.moveDir.y, this.player.moveDir.x)
      : -Math.PI / 2;

    const coneHalfAngle = Math.PI * 0.4; // 72 degree half-angle = 144 degree cone

    // Damage and slow enemies in frontal cone
    for (const enemy of allEnemies) {
      if (!enemy.isAlive || !enemy.active) continue;
      const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist > coneRange) continue;

      const angle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
      let angleDiff = Math.abs(angle - facingAngle);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      if (angleDiff < coneHalfAngle) {
        const damage = BULLET_DAMAGE * mod.damageMul * 0.5;
        const slowAmount = mod.iceSlowAmount || 0.5;
        enemy.takeDamage(damage, [{
          type: 'slow', value: slowAmount, duration: 2000, startTime: time,
        }]);
        if (!enemy.isAlive && this.onWeaponKill) {
          this.onWeaponKill(enemy);
        }
      }
    }

    // Visual: expanding cone-shaped ring
    const ringCount = weaponType === 'frost_storm' ? 3 : 2;
    for (let r = 0; r < ringCount; r++) {
      const ring = this.scene.add.circle(
        this.player.x + Math.cos(facingAngle) * 15,
        this.player.y + Math.sin(facingAngle) * 15,
        20, 0x88ddff, 0.35,
      ).setDepth(8);
      this.scene.tweens.add({
        targets: ring,
        alpha: 0,
        scaleX: (3 + r * 0.5),
        scaleY: (2 + r * 0.3),
        duration: 400 + r * 100,
        onComplete: () => ring.destroy(),
      });
    }

    // Frost storm: also fire a ring around the player
    if (weaponType === 'frost_storm') {
      const auraRing = this.scene.add.circle(
        this.player.x, this.player.y,
        coneRange, 0xaaddff, 0.15,
      ).setDepth(7);
      this.scene.tweens.add({
        targets: auraRing,
        alpha: 0, scaleX: 1.2, scaleY: 1.2,
        duration: 500, onComplete: () => auraRing.destroy(),
      });

      // Slow all nearby enemies in aura
      for (const enemy of allEnemies) {
        if (!enemy.isAlive || !enemy.active) continue;
        const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
        if (dist <= coneRange) {
          enemy.takeDamage(BULLET_DAMAGE * mod.damageMul * 0.2, [{
            type: 'slow', value: 0.3, duration: 1500, startTime: time,
          }]);
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 9. LASER_BEAM / PHOTON_CANNON (no bullets — continuous beam)
  // ═══════════════════════════════════════════════════════════════════

  private updateLaserBeam(time: number, enemies: Enemy[]) {
    const mod = this.player.modifiers;
    const weaponType = mod.weaponType;
    const laserRange = 300;
    const isPhoton = weaponType === 'photon_cannon';
    const dps = (mod.laserDps || 15) * (isPhoton ? 1.5 : 1.0);

    // Find nearest enemy within range
    let nearest: Enemy | null = null;
    let nearestDist = Infinity;
    for (const enemy of enemies) {
      if (!enemy.isAlive || !enemy.active) continue;
      const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist < laserRange && dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }

    if (!nearest) {
      this.clearLaser();
      return;
    }

    // Apply continuous damage
    const dt = this.scene.game.loop.delta / 1000;
    const damage = dps * mod.damageMul * dt;
    nearest.takeDamage(damage);
    if (!nearest.isAlive && this.onWeaponKill) {
      this.onWeaponKill(nearest);
    }

    // Draw laser line
    if (!this.laserGraphics) {
      this.laserGraphics = this.scene.add.graphics().setDepth(9);
    }
    this.laserGraphics.clear();

    // Outer glow
    const glowWidth = isPhoton ? 8 : 4;
    const glowColor = isPhoton ? 0xff88ff : 0xff44ff;
    this.laserGraphics.lineStyle(glowWidth, glowColor, 0.4);
    this.laserGraphics.lineBetween(this.player.x, this.player.y, nearest.x, nearest.y);

    // Main beam
    const beamWidth = isPhoton ? 5 : 3;
    const beamColor = isPhoton ? 0xffaaff : 0xff66ff;
    this.laserGraphics.lineStyle(beamWidth, beamColor, 0.7);
    this.laserGraphics.lineBetween(this.player.x, this.player.y, nearest.x, nearest.y);

    // Core bright line
    this.laserGraphics.lineStyle(2, 0xffffff, 0.9);
    this.laserGraphics.lineBetween(this.player.x, this.player.y, nearest.x, nearest.y);

    // Photon cannon: pulsing glow on target (reuse single circle)
    if (isPhoton && nearest.active) {
      const pulseAlpha = 0.3 + Math.sin(time / 50) * 0.2;
      if (!this.photonImpactCircle) {
        this.photonImpactCircle = this.scene.add.circle(
          nearest.x, nearest.y, 8, 0xffaaff, pulseAlpha,
        ).setDepth(9);
      } else {
        this.photonImpactCircle.setPosition(nearest.x, nearest.y);
        this.photonImpactCircle.setAlpha(pulseAlpha);
        this.photonImpactCircle.setScale(1);
      }
      this.laserTarget = nearest;
    } else {
      if (this.photonImpactCircle) {
        this.photonImpactCircle.destroy();
        this.photonImpactCircle = null;
      }
      this.laserTarget = null;
    }
  }

  private clearLaser() {
    if (this.laserGraphics) {
      this.laserGraphics.clear();
    }
    if (this.photonImpactCircle) {
      this.photonImpactCircle.destroy();
      this.photonImpactCircle = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════

  private findNearestEnemy(enemies: Enemy[]): Enemy | null {
    let nearest: Enemy | null = null;
    let nearestDist = Infinity;
    for (const enemy of enemies) {
      if (!enemy.isAlive || !enemy.active) continue;
      const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  private findNearestEnemyInRange(enemies: Enemy[], x: number, y: number, range: number): Enemy | null {
    let nearest: Enemy | null = null;
    let nearestDist = Infinity;
    for (const enemy of enemies) {
      if (!enemy.isAlive || !enemy.active) continue;
      const dist = distance(x, y, enemy.x, enemy.y);
      if (dist < range && dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }
    return nearest;
  }

  /** Get all living enemies from the physics world */
  private getEnemiesFromPhysics(): Enemy[] {
    return this.scene.physics.world.bodies.entries
      .filter(b => b.gameObject && (b.gameObject as any).isAlive)
      .map(b => b.gameObject as unknown as Enemy);
  }

  /** Apply visual tint to bullet based on weapon type */
  private applyBulletTint(bullet: Bullet, weaponType: string) {
    switch (weaponType) {
      case 'shotgun':
      case 'freeze_shotgun':
      case 'fragment_bomb':
        bullet.setTint(0xff8844); // orange
        break;
      case 'lightning':
      case 'thunderstorm':
      case 'thunder_slash':
        bullet.setTint(0x88aaff); // blue
        break;
      case 'poison_snake':
      case 'plague_bomb':
        bullet.setTint(0x88cc44); // green
        break;
      case 'death_scythe':
      case 'soul_reaper':
        bullet.setTint(0xcc44ff); // purple
        break;
      case 'boomerang':
      case 'death_wheel':
        bullet.setTint(0x88ff44); // green
        break;
      case 'mega_blaster':
        bullet.setTint(0xffcc44); // gold
        break;
      default:
        bullet.clearTint(); // default yellow
        break;
    }
  }

  /** Repulse enemies — called from GameScene */
  applyRepulse(enemies: Enemy[]) {
    const radius = this.player.modifiers.repulseRadius;
    if (radius <= 0) return;

    for (const enemy of enemies) {
      if (!enemy.isAlive || !enemy.active) continue;
      const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist < radius && dist > 0) {
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const nx = dx / dist;
        const ny = dy / dist;
        const pushForce = 200 * (1 - dist / radius);
        enemy.setVelocity(nx * pushForce, ny * pushForce);
        enemy.takeDamage(3);
      }
    }
  }

  destroy() {
    this.clearOrbs();
    this.clearLaser();
    if (this.laserGraphics) {
      this.laserGraphics.destroy();
      this.laserGraphics = null;
    }
    if (this.lightningGraphics) {
      this.lightningGraphics.destroy();
      this.lightningGraphics = null;
    }
    // Clean up poison clouds
    for (const cloud of this.poisonClouds) {
      if (cloud.graphic.active) cloud.graphic.destroy();
    }
    this.poisonClouds = [];
  }
}
