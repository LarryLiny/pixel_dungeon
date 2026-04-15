export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  costPerLevel: number[];
  effectPerLevel: number[];
  stat: string; // modifier key: 'maxHp', 'speed', 'pickupRange', 'damage', 'luck', 'startingShots'
}

export const UPGRADES: Record<string, UpgradeDef> = {
  hp_boost: {
    id: 'hp_boost',
    name: '生命强化',
    description: '+10% 生命上限',
    maxLevel: 8,
    costPerLevel: [20, 40, 70, 110, 160, 220, 300, 400],
    effectPerLevel: [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10],
    stat: 'maxHp',
  },
  speed_boost: {
    id: 'speed_boost',
    name: '移速强化',
    description: '+8% 移动速度',
    maxLevel: 8,
    costPerLevel: [25, 50, 85, 130, 185, 250, 330, 430],
    effectPerLevel: [0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08],
    stat: 'speed',
  },
  pickup_range: {
    id: 'pickup_range',
    name: '拾取范围',
    description: '+15% 拾取半径',
    maxLevel: 8,
    costPerLevel: [15, 35, 60, 95, 140, 200, 275, 365],
    effectPerLevel: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
    stat: 'pickupRange',
  },
  damage_boost: {
    id: 'damage_boost',
    name: '伤害强化',
    description: '+10% 攻击伤害',
    maxLevel: 8,
    costPerLevel: [30, 60, 100, 150, 210, 280, 370, 480],
    effectPerLevel: [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10],
    stat: 'damage',
  },
  luck_boost: {
    id: 'luck_boost',
    name: '幸运强化',
    description: '+10% 掉落概率',
    maxLevel: 8,
    costPerLevel: [20, 45, 75, 120, 175, 240, 320, 420],
    effectPerLevel: [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10],
    stat: 'luck',
  },
  weapon_mastery: {
    id: 'weapon_mastery',
    name: '武器精通',
    description: '开局额外+1弹幕数量',
    maxLevel: 5,
    costPerLevel: [100, 200, 350, 550, 800],
    effectPerLevel: [1, 1, 1, 1, 1],
    stat: 'startingShots',
  },
};

export const UPGRADE_IDS = Object.keys(UPGRADES);

export function getUpgradeDef(id: string): UpgradeDef | undefined {
  return UPGRADES[id];
}
