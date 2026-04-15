export interface SkillDef {
  id: string;
  name: string;
  icon: string;       // 颜色标识 (hex)
  type: 'damage' | 'shoot' | 'defense' | 'utility';
  description: string;
  // Per-level effect values (index 0 = level 1)
  levels: number[];
}

export const SKILLS: Record<string, SkillDef> = {
  fireball: {
    id: 'fireball',
    name: '火球术',
    icon: '#ff6600',
    type: 'damage',
    description: '子弹伤害增加',
    levels: [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0],
  },
  iceShot: {
    id: 'iceShot',
    name: '冰霜射击',
    icon: '#44ddff',
    type: 'damage',
    description: '命中减速敌人',
    levels: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
  },
  multiShot: {
    id: 'multiShot',
    name: '多重射击',
    icon: '#ffff44',
    type: 'shoot',
    description: '额外发射子弹',
    levels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  piercing: {
    id: 'piercing',
    name: '穿透弹',
    icon: '#ff44ff',
    type: 'shoot',
    description: '子弹穿透敌人',
    levels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  lightning: {
    id: 'lightning',
    name: '连锁闪电',
    icon: '#aaddff',
    type: 'damage',
    description: '命中后连锁攻击',
    levels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  poison: {
    id: 'poison',
    name: '毒素',
    icon: '#44cc44',
    type: 'damage',
    description: '命中后持续伤害',
    levels: [3, 4, 5, 6, 7, 8, 9, 10, 12],
  },
  shield: {
    id: 'shield',
    name: '护盾',
    icon: '#8888ff',
    type: 'defense',
    description: '减少受到伤害',
    levels: [0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
  },
  speed: {
    id: 'speed',
    name: '迅捷',
    icon: '#44ff44',
    type: 'utility',
    description: '提升移动速度',
    levels: [1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.6],
  },
  heal: {
    id: 'heal',
    name: '生命回复',
    icon: '#ff4488',
    type: 'utility',
    description: '持续恢复生命',
    levels: [2, 3, 4, 5, 6, 7, 8, 10, 12],
  },
  magnet: {
    id: 'magnet',
    name: '磁力吸引',
    icon: '#ffaa44',
    type: 'utility',
    description: '扩大拾取范围',
    levels: [1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0, 3.5, 4.0],
  },
};

export const SKILL_IDS = Object.keys(SKILLS);

export function getSkillValue(skillId: string, level: number): number {
  const def = SKILLS[skillId];
  if (!def) return 0;
  return def.levels[Math.min(level - 1, def.levels.length - 1)];
}
