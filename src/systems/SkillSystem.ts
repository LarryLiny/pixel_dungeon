import { Player, PlayerModifiers, defaultModifiers } from '../entities/Player';
import { getSkillValue, SKILLS } from '../data/skills';

export class SkillSystem {
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  /** Recalculate all modifiers from current skills */
  recalculate() {
    const mod = defaultModifiers();

    for (const skill of this.player.skills) {
      const value = getSkillValue(skill.id, skill.level);
      switch (skill.id) {
        case 'fireball':
          mod.damageMul *= value;
          break;
        case 'iceShot':
          mod.slowOnHit = Math.max(mod.slowOnHit, value);
          mod.slowDuration = 1.0 + (skill.level - 1) * 0.2;
          break;
        case 'multiShot':
          mod.shotCount += value;
          break;
        case 'piercing':
          mod.pierce += value;
          break;
        case 'lightning':
          mod.chainCount += value;
          break;
        case 'poison':
          mod.poisonDps = Math.max(mod.poisonDps, value);
          mod.poisonDuration = 2.0 + (skill.level - 1) * 0.5;
          break;
        case 'shield':
          mod.shieldReduction = Math.max(mod.shieldReduction, value);
          break;
        case 'speed':
          mod.speedMul *= value;
          break;
        case 'heal':
          mod.healPerTick += value;
          mod.healInterval = 5000;
          break;
        case 'magnet':
          mod.pickupRange *= value;
          break;
      }
    }

    this.player.modifiers = mod;
  }

  /** Handle picking up a skill orb */
  pickupSkill(skillId: string): { success: boolean; message: string; level: number } {
    const result = this.player.addSkill(skillId);
    if (result.added) {
      this.recalculate();
      return { success: true, message: `获得技能: ${SKILLS[skillId].name} Lv.1`, level: 1 };
    }
    if (result.upgraded) {
      this.recalculate();
      const skill = this.player.skills.find(s => s.id === skillId)!;
      return { success: true, message: `${SKILLS[skillId].name} 升级到 Lv.${skill.level}`, level: skill.level };
    }
    if (this.player.skills.length >= 5) {
      return { success: false, message: '技能栏已满', level: 0 };
    }
    return { success: false, message: '无法拾取', level: 0 };
  }

  /** Get magnet pickup range in pixels */
  getPickupRange(): number {
    return 40 * this.player.modifiers.pickupRange;
  }
}
