import { Player, defaultModifiers } from '../entities/Player';
import { MAX_SKILL_SLOTS } from '../constants';
import { getItemValue, ItemDef, ALL_ITEMS, ItemCategory } from '../data/items';
import { FUSION_RECIPES } from '../data/fusionRecipes';

export interface ItemSlot {
  id: string;
  level: number;
}

/** Check if an item ID is a fusion output */
function isFusionOutput(itemId: string): boolean {
  return FUSION_RECIPES.some(r => r.output === itemId);
}

export class ItemSystem {
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  /** Recalculate all modifiers from current items */
  recalculate() {
    const mod = defaultModifiers();

    // Track fusion outputs to grant bonus slots
    let fusionSlotBonus = 0;

    for (const item of this.player.skills) {
      const value = getItemValue(item.id, item.level);
      const def = ALL_ITEMS[item.id];
      if (!def) continue;

      switch (item.id) {
        // ── Weapons ──
        case 'basic_shot':
          mod.damageMul *= value;
          mod.weaponType = mod.weaponType || 'basic_shot';
          break;
        case 'shotgun':
          mod.shotCount += value - 1;
          mod.weaponType = 'shotgun';
          break;
        case 'fireball_orbit':
          mod.orbCount += value;
          mod.weaponType = mod.weaponType || 'fireball_orbit';
          break;
        case 'boomerang':
          mod.boomerangCount += value;
          mod.weaponType = mod.weaponType || 'boomerang';
          break;
        case 'lightning':
          mod.chainCount += value;
          mod.weaponType = mod.weaponType || 'lightning';
          break;
        case 'sword_slash':
          mod.swordArcAngle = 90;
          mod.swordRange = 60 + value * 10;
          mod.damageMul *= value;
          mod.weaponType = 'sword_slash';
          break;
        case 'ice_wave':
          mod.iceSlowAmount = Math.max(mod.iceSlowAmount, 0.3 + value * 0.05);
          mod.damageMul *= value;
          mod.weaponType = 'ice_wave';
          break;
        case 'poison_snake':
          mod.poisonDpsField += value;
          mod.weaponType = 'poison_snake';
          break;
        case 'laser_beam':
          mod.laserDps += value;
          mod.weaponType = 'laser_beam';
          break;
        case 'death_scythe':
          mod.executeThreshold = Math.max(mod.executeThreshold, value);
          mod.weaponType = 'death_scythe';
          break;

        // ── Fusion Weapons ──
        case 'freeze_shotgun':
          mod.shotCount += value - 1;
          mod.slowOnHit = Math.max(mod.slowOnHit, 0.6);
          mod.slowDuration = Math.max(mod.slowDuration, 2.0);
          mod.weaponType = 'freeze_shotgun';
          break;
        case 'hellfire':
          mod.orbCount += value;
          mod.weaponType = 'hellfire';
          break;
        case 'death_wheel':
          mod.boomerangCount += value;
          mod.executeThreshold = Math.max(mod.executeThreshold, 0.15);
          mod.weaponType = 'death_wheel';
          break;
        case 'mega_blaster':
          mod.damageMul *= value;
          mod.pierce += 3;
          mod.weaponType = 'mega_blaster';
          break;
        case 'thunder_slash':
          mod.swordArcAngle = 90;
          mod.swordRange = 60 + value * 10;
          mod.damageMul *= value;
          mod.weaponType = 'thunder_slash';
          break;
        case 'fragment_bomb':
          mod.shotCount += value - 1;
          mod.splashRadius = Math.max(mod.splashRadius, 40);
          mod.weaponType = 'fragment_bomb';
          break;
        case 'thunderstorm':
          mod.chainCount += value;
          mod.weaponType = 'thunderstorm';
          break;
        case 'tracking_fireball':
          mod.orbCount += value;
          mod.weaponType = 'tracking_fireball';
          break;
        case 'frost_storm':
          mod.iceSlowAmount = Math.max(mod.iceSlowAmount, 0.3 + value * 0.05);
          mod.chainCount += Math.floor(value * 0.5);
          mod.damageMul *= value;
          mod.weaponType = 'frost_storm';
          break;
        case 'plague_bomb':
          mod.poisonDpsField += value;
          mod.splashRadius = Math.max(mod.splashRadius, 30);
          mod.weaponType = 'plague_bomb';
          break;
        case 'sun_storm':
          mod.orbCount += value;
          mod.bulletSizeMul *= 1.5;
          mod.weaponType = 'sun_storm';
          break;
        case 'photon_cannon':
          mod.laserDps += value;
          mod.attackSpeedMul *= 0.7;
          mod.weaponType = 'photon_cannon';
          break;
        case 'soul_reaper':
          mod.executeThreshold = Math.max(mod.executeThreshold, value);
          mod.splashRadius = Math.max(mod.splashRadius, 20);
          mod.weaponType = 'soul_reaper';
          break;

        // ── Augments ──
        case 'power':
          mod.damageMul *= value;
          break;
        case 'bullet_speed':
          mod.bulletSpeedMul *= value;
          break;
        case 'bullet_size':
          mod.bulletSizeMul *= value;
          break;
        case 'splash':
          mod.splashRadius = Math.max(mod.splashRadius, value);
          break;
        case 'chain_enhance':
          mod.chainCount += value;
          break;
        case 'pierce_core':
          mod.pierce += value;
          break;
        case 'barrage':
          mod.shotCount += value;
          break;
        case 'attack_speed':
          mod.attackSpeedMul *= value;
          break;
        case 'lucky_star':
          mod.luckyDropMul *= value;
          break;

        // ── Defenses ──
        case 'shield_orbit':
          mod.shieldOrbs += value;
          break;
        case 'repulse':
          mod.repulseRadius = Math.max(mod.repulseRadius, value);
          break;
        case 'heal_cloak':
          mod.healPerTick += value;
          mod.healInterval = 1000;
          break;
        case 'swiftness':
          mod.speedMul *= value;
          break;
        case 'armor':
          mod.shieldReduction = Math.max(mod.shieldReduction, value);
          break;
        case 'ghost_step':
          mod.ghostStepDuration = Math.max(mod.ghostStepDuration, value);
          mod.ghostStepInterval = 8000;
          break;
        case 'magnet':
          mod.magnetRange += value;
          mod.pickupRange += value;
          break;
        case 'reflect_mirror':
          mod.reflectChance = Math.max(mod.reflectChance, value);
          break;
        case 'holy_guard':
          mod.holyGuardThreshold = 0.2;
          mod.holyGuardHealRatio = Math.max(mod.holyGuardHealRatio, value);
          break;

        // ── Fusion Defenses ──
        case 'wind_runner':
          mod.speedMul *= value;
          mod.healPerTick += Math.floor(value * 0.5);
          mod.healInterval = 1000;
          break;
        case 'shield_bash':
          mod.shieldOrbs += value;
          mod.reflectChance = Math.max(mod.reflectChance, 0.3);
          break;
        case 'void_walker':
          mod.ghostStepDuration = Math.max(mod.ghostStepDuration, value);
          mod.ghostStepInterval = 4000;
          mod.speedMul *= 1.2;
          break;
        case 'black_hole':
          mod.repulseRadius = Math.max(mod.repulseRadius, value);
          mod.magnetRange += value * 0.5;
          break;
        case 'absolute_defense':
          mod.shieldOrbs += value;
          mod.reflectChance = Math.max(mod.reflectChance, 0.5);
          mod.shieldReduction = Math.max(mod.shieldReduction, 0.3);
          break;
        case 'angel_embrace':
          mod.holyGuardThreshold = 0.5;
          mod.holyGuardHealRatio = Math.max(mod.holyGuardHealRatio, value);
          mod.ghostStepDuration = Math.max(mod.ghostStepDuration, 3.0);
          break;

        // ── Fusion Augments ──
        case 'nuclear_core':
          mod.damageMul *= value;
          mod.splashRadius = Math.max(mod.splashRadius, 50);
          break;
      }

      // Fusion outputs grant extra skill slots
      if (isFusionOutput(item.id)) {
        fusionSlotBonus++;
      }
    }

    mod.fusionSlotBonus = fusionSlotBonus;
    this.player.modifiers = mod;
  }

  /** Handle picking up an item */
  pickupItem(itemId: string): { success: boolean; message: string; level: number } {
    const def = ALL_ITEMS[itemId];
    if (!def) return { success: false, message: '未知道具', level: 0 };

    // Weapons: only one at a time, replaces current
    if (def.category === 'weapon') {
      const existingWeapon = this.player.skills.find(s => {
        const d = ALL_ITEMS[s.id];
        return d?.category === 'weapon';
      });

      if (existingWeapon && existingWeapon.id !== itemId) {
        // Replace existing weapon
        const idx = this.player.skills.indexOf(existingWeapon);
        this.player.skills[idx] = { id: itemId, level: 1 };
        this.recalculate();
        return { success: true, message: `武器更换: ${def.name}`, level: 1 };
      }
      // Same weapon -> upgrade
      if (existingWeapon && existingWeapon.id === itemId) {
        if (existingWeapon.level < 9) {
          existingWeapon.level++;
          this.recalculate();
          return { success: true, message: `${def.name} 升级到 Lv.${existingWeapon.level}`, level: existingWeapon.level };
        }
        return { success: false, message: `${def.name} 已满级`, level: 9 };
      }
    }

    // Non-weapon items
    const existing = this.player.skills.find(s => s.id === itemId);
    if (existing) {
      if (existing.level < 9) {
        existing.level++;
        this.recalculate();
        return { success: true, message: `${def.name} 升级到 Lv.${existing.level}`, level: existing.level };
      }
      return { success: false, message: `${def.name} 已满级`, level: 9 };
    }

    const maxSlots = MAX_SKILL_SLOTS + this.player.modifiers.fusionSlotBonus;
    if (this.player.skills.length < maxSlots) {
      this.player.skills.push({ id: itemId, level: 1 });
      this.recalculate();
      return { success: true, message: `获得: ${def.name} Lv.1`, level: 1 };
    }

    return { success: false, message: '道具栏已满', level: 0 };
  }

  getPickupRange(): number {
    return 40 * this.player.modifiers.pickupRange;
  }
}
