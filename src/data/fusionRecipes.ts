import { ItemRarity } from './items';

export interface FusionRecipe {
  id: string;
  name: string;
  description: string;
  inputs: [string, string]; // two item IDs that fuse
  minLevel: number; // both items must be >= this level
  output: string; // resulting fused item ID (replaces both inputs)
  outputRarity: ItemRarity;
  color: string; // display color
  /** Category the fused item belongs to for display */
  category: 'weapon' | 'augment' | 'defense';
}

/**
 * Fusion Recipes
 * When two items in the player's inventory match a recipe AND both are >= minLevel,
 * a fusion prompt appears (or auto-fuses). The two items are consumed and replaced
 * by the output, freeing one slot.
 */
export const FUSION_RECIPES: FusionRecipe[] = [
  // ── Common × Common ──────────────────────────────
  {
    id: 'freeze_shotgun',
    name: '急冻霰弹',
    description: '子弹减速敌人60%',
    inputs: ['shotgun', 'bullet_speed'],
    minLevel: 3,
    output: 'freeze_shotgun',
    outputRarity: 'uncommon',
    color: '#88ccff',
    category: 'weapon',
  },
  {
    id: 'hellfire',
    name: '地狱火',
    description: '火球点燃地面持续灼烧',
    inputs: ['fireball_orbit', 'power'],
    minLevel: 3,
    output: 'hellfire',
    outputRarity: 'uncommon',
    color: '#ff6622',
    category: 'weapon',
  },
  {
    id: 'death_wheel',
    name: '死亡轮盘',
    description: '巨大回旋镖斩杀低血量目标',
    inputs: ['boomerang', 'bullet_size'],
    minLevel: 3,
    output: 'death_wheel',
    outputRarity: 'uncommon',
    color: '#22ddaa',
    category: 'weapon',
  },
  {
    id: 'wind_runner',
    name: '风行者',
    description: '移动时回血速度翻倍',
    inputs: ['heal_cloak', 'swiftness'],
    minLevel: 3,
    output: 'wind_runner',
    outputRarity: 'uncommon',
    color: '#66ffaa',
    category: 'defense',
  },
  {
    id: 'mega_blaster',
    name: '巨炮',
    description: '单发巨型弹，高伤害+穿透',
    inputs: ['basic_shot', 'bullet_size'],
    minLevel: 3,
    output: 'mega_blaster',
    outputRarity: 'uncommon',
    color: '#ffcc44',
    category: 'weapon',
  },
  {
    id: 'shield_bash',
    name: '铁壁',
    description: '护盾反弹伤害给敌人',
    inputs: ['shield_orbit', 'armor'],
    minLevel: 3,
    output: 'shield_bash',
    outputRarity: 'uncommon',
    color: '#6688cc',
    category: 'defense',
  },

  // ── Uncommon × Uncommon / Cross ──────────────────
  {
    id: 'thunder_slash',
    name: '雷暴斩',
    description: '剑气命中触发连锁闪电',
    inputs: ['sword_slash', 'lightning'],
    minLevel: 3,
    output: 'thunder_slash',
    outputRarity: 'rare',
    color: '#88aaff',
    category: 'weapon',
  },
  {
    id: 'fragment_bomb',
    name: '碎裂炮',
    description: '命中分裂成小弹片，范围伤害',
    inputs: ['shotgun', 'splash'],
    minLevel: 3,
    output: 'fragment_bomb',
    outputRarity: 'rare',
    color: '#ff7744',
    category: 'weapon',
  },
  {
    id: 'thunderstorm',
    name: '雷暴',
    description: '穿透型闪电攻击',
    inputs: ['lightning', 'pierce_core'],
    minLevel: 3,
    output: 'thunderstorm',
    outputRarity: 'rare',
    color: '#6699ff',
    category: 'weapon',
  },
  {
    id: 'tracking_fireball',
    name: '追踪火球',
    description: '火球自动追踪最近敌人',
    inputs: ['fireball_orbit', 'bullet_speed'],
    minLevel: 3,
    output: 'tracking_fireball',
    outputRarity: 'rare',
    color: '#ff5533',
    category: 'weapon',
  },
  {
    id: 'void_walker',
    name: '虚空行者',
    description: '无敌频率大幅提升',
    inputs: ['ghost_step', 'swiftness'],
    minLevel: 3,
    output: 'void_walker',
    outputRarity: 'rare',
    color: '#99aacc',
    category: 'defense',
  },

  // ── Rare × Rare / Cross ──────────────────────────
  {
    id: 'frost_storm',
    name: '雷暴冰霜',
    description: '冰冻后闪电爆裂双重伤害',
    inputs: ['ice_wave', 'lightning'],
    minLevel: 3,
    output: 'frost_storm',
    outputRarity: 'epic',
    color: '#44ccff',
    category: 'weapon',
  },
  {
    id: 'plague_bomb',
    name: '瘟疫炸弹',
    description: '毒雾范围爆炸持续伤害',
    inputs: ['poison_snake', 'splash'],
    minLevel: 3,
    output: 'plague_bomb',
    outputRarity: 'epic',
    color: '#66aa22',
    category: 'weapon',
  },
  {
    id: 'black_hole',
    name: '黑洞',
    description: '吸引+减速+伤害+爆炸',
    inputs: ['magnet', 'repulse'],
    minLevel: 3,
    output: 'black_hole',
    outputRarity: 'epic',
    color: '#8844cc',
    category: 'defense',
  },
  {
    id: 'sun_storm',
    name: '太阳风暴',
    description: '超大火球灼烧范围内所有敌人',
    inputs: ['fireball_orbit', 'bullet_size'],
    minLevel: 4,
    output: 'sun_storm',
    outputRarity: 'epic',
    color: '#ff8822',
    category: 'weapon',
  },
  {
    id: 'nuclear_core',
    name: '核弹核心',
    description: '命中触发范围爆炸',
    inputs: ['power', 'splash'],
    minLevel: 4,
    output: 'nuclear_core',
    outputRarity: 'epic',
    color: '#ff3355',
    category: 'augment',
  },

  // ── Epic × Epic ─────────────────────────────────
  {
    id: 'photon_cannon',
    name: '光子炮',
    description: '持续扫射激光束',
    inputs: ['laser_beam', 'attack_speed'],
    minLevel: 3,
    output: 'photon_cannon',
    outputRarity: 'legendary',
    color: '#ff44ff',
    category: 'weapon',
  },
  {
    id: 'absolute_defense',
    name: '绝对防御',
    description: '护盾反弹+无敌帧大幅增加',
    inputs: ['reflect_mirror', 'shield_orbit'],
    minLevel: 3,
    output: 'absolute_defense',
    outputRarity: 'legendary',
    color: '#ccddff',
    category: 'defense',
  },

  // ── Legendary × Legendary ───────────────────────
  {
    id: 'soul_reaper',
    name: '灵魂收割',
    description: '斩杀触发范围爆炸+回复',
    inputs: ['death_scythe', 'power'],
    minLevel: 3,
    output: 'soul_reaper',
    outputRarity: 'legendary',
    color: '#aa22ff',
    category: 'weapon',
  },
  {
    id: 'angel_embrace',
    name: '天使之拥',
    description: '低于50%血自动大回血+无敌3s',
    inputs: ['holy_guard', 'heal_cloak'],
    minLevel: 3,
    output: 'angel_embrace',
    outputRarity: 'legendary',
    color: '#ffffaa',
    category: 'defense',
  },
];

/** Find a fusion recipe matching two items in the inventory */
export function findFusionRecipe(itemA: string, itemB: string): FusionRecipe | undefined {
  return FUSION_RECIPES.find(r =>
    (r.inputs[0] === itemA && r.inputs[1] === itemB) ||
    (r.inputs[0] === itemB && r.inputs[1] === itemA)
  );
}

/** Find all possible fusions from current inventory */
export function findPossibleFusions(
  items: { id: string; level: number }[]
): { recipe: FusionRecipe; indexA: number; indexB: number }[] {
  const results: { recipe: FusionRecipe; indexA: number; indexB: number }[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const recipe = findFusionRecipe(items[i].id, items[j].id);
      if (recipe && items[i].level >= recipe.minLevel && items[j].level >= recipe.minLevel) {
        results.push({ recipe, indexA: i, indexB: j });
      }
    }
  }
  return results;
}
