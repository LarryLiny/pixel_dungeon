import Phaser from 'phaser';
import { PLAYER_SPEED, PLAYER_MAX_HP, PLAYER_SIZE, MAX_SKILL_SLOTS } from '../constants';

export interface SkillSlot {
  id: string;
  level: number;
}

export interface PlayerModifiers {
  damageMul: number;
  speedMul: number;
  shotCount: number;
  pierce: number;
  shieldReduction: number;
  pickupRange: number;
  slowOnHit: number;
  slowDuration: number;
  poisonDps: number;
  poisonDuration: number;
  chainCount: number;
  healPerTick: number;
  healInterval: number;
  // Weapon system
  weaponType: string;
  bulletSpeedMul: number;
  bulletSizeMul: number;
  splashRadius: number;
  orbCount: number;
  boomerangCount: number;
  // Defense system
  shieldOrbs: number;
  repulseRadius: number;
  // ── New weapon modifiers ──
  ghostStepDuration: number;
  ghostStepInterval: number;
  magnetRange: number;
  reflectChance: number;
  holyGuardThreshold: number;
  holyGuardHealRatio: number;
  executeThreshold: number;
  swordArcAngle: number;
  swordRange: number;
  iceSlowAmount: number;
  poisonDpsField: number;
  laserDps: number;
  // ── New augment modifiers ──
  attackSpeedMul: number;
  luckyDropMul: number;
  fusionSlotBonus: number;
}

export function defaultModifiers(): PlayerModifiers {
  return {
    damageMul: 1.0,
    speedMul: 1.0,
    shotCount: 0,
    pierce: 0,
    shieldReduction: 0,
    pickupRange: 1.0,
    slowOnHit: 0,
    slowDuration: 0,
    poisonDps: 0,
    poisonDuration: 0,
    chainCount: 0,
    healPerTick: 0,
    healInterval: 5000,
    weaponType: 'basic_shot',
    bulletSpeedMul: 1.0,
    bulletSizeMul: 1.0,
    splashRadius: 0,
    orbCount: 0,
    boomerangCount: 0,
    shieldOrbs: 0,
    repulseRadius: 0,
    // New weapon modifiers
    ghostStepDuration: 0,
    ghostStepInterval: 8000,
    magnetRange: 0,
    reflectChance: 0,
    holyGuardThreshold: 0.2,
    holyGuardHealRatio: 0,
    executeThreshold: 0,
    swordArcAngle: 0,
    swordRange: 0,
    iceSlowAmount: 0,
    poisonDpsField: 0,
    laserDps: 0,
    // New augment modifiers
    attackSpeedMul: 1.0,
    luckyDropMul: 1.0,
    fusionSlotBonus: 0,
  };
}

const INVINCIBLE_DURATION = 800; // ms

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  skills: SkillSlot[];
  modifiers: PlayerModifiers;
  isAlive: boolean;
  lastHealTime: number;
  moveDir: { x: number; y: number };
  isInvincible: boolean;
  invincibleTimer: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = PLAYER_MAX_HP;
    this.maxHp = PLAYER_MAX_HP;
    this.skills = [];
    this.modifiers = defaultModifiers();
    this.isAlive = true;
    this.lastHealTime = 0;
    this.moveDir = { x: 0, y: 0 };
    this.isInvincible = false;
    this.invincibleTimer = 0;

    this.setScale(1.5);
    this.setDepth(10);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(PLAYER_SIZE, PLAYER_SIZE);
      body.setOffset(1, 1);
      body.setCollideWorldBounds(true);
    }
  }

  setMoveDirection(dx: number, dy: number) {
    this.moveDir = { x: dx, y: dy };
  }

  update(time: number, _delta: number) {
    if (!this.isAlive) return;

    const speed = PLAYER_SPEED * this.modifiers.speedMul;
    this.setVelocity(this.moveDir.x * speed, this.moveDir.y * speed);

    // Invincibility flash
    if (this.isInvincible) {
      if (time > this.invincibleTimer) {
        this.isInvincible = false;
        this.clearTint();
        this.setAlpha(1);
      } else {
        // Blink effect
        this.setAlpha(Math.sin(time / 50) > 0 ? 1 : 0.3);
      }
    }

    // Heal skill
    if (this.modifiers.healPerTick > 0) {
      if (time - this.lastHealTime >= this.modifiers.healInterval) {
        this.heal(this.modifiers.healPerTick);
        this.lastHealTime = time;
      }
    }
  }

  takeDamage(amount: number) {
    if (this.isInvincible || !this.isAlive) return;

    const actualDamage = amount * (1 - this.modifiers.shieldReduction);
    this.hp = Math.max(0, this.hp - actualDamage);

    // Activate invincibility frames
    this.isInvincible = true;
    this.invincibleTimer = this.scene.time.now + INVINCIBLE_DURATION;
    this.setTint(0xff8888);

    if (this.hp <= 0) {
      this.isAlive = false;
      this.setActive(false).setVisible(false);
    }
  }

  heal(amount: number) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addSkill(skillId: string): { added: boolean; upgraded: boolean; replaced: boolean } {
    const existing = this.skills.find(s => s.id === skillId);
    if (existing) {
      if (existing.level < 9) {
        existing.level++;
        return { added: false, upgraded: true, replaced: false };
      }
      return { added: false, upgraded: false, replaced: false };
    }
    if (this.skills.length < MAX_SKILL_SLOTS) {
      this.skills.push({ id: skillId, level: 1 });
      return { added: true, upgraded: false, replaced: false };
    }
    return { added: false, upgraded: false, replaced: false };
  }

  replaceSkill(index: number, newSkillId: string) {
    if (index >= 0 && index < this.skills.length) {
      this.skills[index] = { id: newSkillId, level: 1 };
    }
  }
}
