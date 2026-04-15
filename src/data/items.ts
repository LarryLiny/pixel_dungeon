export type ItemCategory = 'weapon' | 'augment' | 'defense';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  description: string;
  color: string;
  icon: string;
  maxLevel: number;
  levels: number[];
  /** If true, must be unlocked via fragments before it appears in drops */
  locked: boolean;
}

// Rarity colors for UI
export const RARITY_COLORS: Record<ItemRarity, number> = {
  common: 0xcccccc,
  uncommon: 0x44cc44,
  rare: 0x4488ff,
  epic: 0xaa44ff,
  legendary: 0xffaa00,
};

export const RARITY_NAMES: Record<ItemRarity, string> = {
  common: '普通',
  uncommon: '优秀',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

/* ============================================================
   武器类（10种）— 决定攻击形态
   ============================================================ */
export const WEAPONS: Record<string, ItemDef> = {
  basic_shot: {
    id: 'basic_shot',
    name: '基础弹',
    category: 'weapon',
    rarity: 'common',
    description: '单发瞄准射击',
    color: '#ffee55',
    icon: '●',
    maxLevel: 9,
    levels: [1.0, 1.3, 1.6, 2.0, 2.5, 3.0, 3.8, 5.0, 7.0],
    locked: false,
  },
  shotgun: {
    id: 'shotgun',
    name: '霰弹枪',
    category: 'weapon',
    rarity: 'common',
    description: '扇形发射多颗子弹',
    color: '#ff8844',
    icon: '火',
    maxLevel: 9,
    levels: [3, 5, 7, 9, 11, 14, 17, 20, 24],
    locked: false,
  },
  fireball_orbit: {
    id: 'fireball_orbit',
    name: '旋转火球',
    category: 'weapon',
    rarity: 'common',
    description: '环绕玩家的火球自动攻击',
    color: '#ff4422',
    icon: '球',
    maxLevel: 9,
    levels: [1, 2, 3, 4, 5, 7, 9, 11, 14],
    locked: false,
  },
  boomerang: {
    id: 'boomerang',
    name: '回旋镖',
    category: 'weapon',
    rarity: 'common',
    description: '飞出后自动飞回，往返伤害',
    color: '#44ddaa',
    icon: '镖',
    maxLevel: 9,
    levels: [1, 2, 3, 4, 5, 7, 9, 11, 14],
    locked: false,
  },
  lightning: {
    id: 'lightning',
    name: '闪电链',
    category: 'weapon',
    rarity: 'uncommon',
    description: '命中后连锁跳电攻击附近敌人',
    color: '#aaddff',
    icon: '电',
    maxLevel: 9,
    levels: [1, 2, 3, 4, 5, 7, 9, 12, 15],
    locked: true,
  },
  sword_slash: {
    id: 'sword_slash',
    name: '剑气斩',
    category: 'weapon',
    rarity: 'uncommon',
    description: '前方扇形近战范围斩击',
    color: '#ddddff',
    icon: '斩',
    maxLevel: 9,
    levels: [1.5, 2.0, 2.8, 3.5, 4.5, 5.5, 7.0, 9.0, 12.0],
    locked: true,
  },
  ice_wave: {
    id: 'ice_wave',
    name: '冰冻波',
    category: 'weapon',
    rarity: 'rare',
    description: '前方锥形减速并造成伤害',
    color: '#88ddff',
    icon: '冰',
    maxLevel: 9,
    levels: [1.2, 1.6, 2.0, 2.5, 3.2, 4.0, 5.0, 6.5, 8.5],
    locked: true,
  },
  poison_snake: {
    id: 'poison_snake',
    name: '毒蛇弹',
    category: 'weapon',
    rarity: 'rare',
    description: '命中后留下毒雾区域持续伤害',
    color: '#88cc44',
    icon: '毒',
    maxLevel: 9,
    levels: [1.0, 1.5, 2.0, 2.5, 3.2, 4.0, 5.0, 6.5, 8.0],
    locked: true,
  },
  laser_beam: {
    id: 'laser_beam',
    name: '激光束',
    category: 'weapon',
    rarity: 'epic',
    description: '持续照射一条直线造成伤害',
    color: '#ff44ff',
    icon: '光',
    maxLevel: 9,
    levels: [1.5, 2.0, 2.8, 3.5, 4.5, 5.5, 7.0, 9.0, 12.0],
    locked: true,
  },
  death_scythe: {
    id: 'death_scythe',
    name: '死亡镰刀',
    category: 'weapon',
    rarity: 'legendary',
    description: '大范围斩杀低血量敌人',
    color: '#cc44ff',
    icon: '镰',
    maxLevel: 9,
    levels: [0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.60], // execute threshold
    locked: true,
  },
};

/* ============================================================
   增益类（9种）— 强化武器属性
   ============================================================ */
export const AUGMENTS: Record<string, ItemDef> = {
  power: {
    id: 'power',
    name: '力量宝石',
    category: 'augment',
    rarity: 'common',
    description: '增加攻击力',
    color: '#ff4466',
    icon: '力',
    maxLevel: 9,
    levels: [1.5, 2.0, 2.8, 3.5, 4.5, 5.5, 7.0, 9.0, 12.0],
    locked: false,
  },
  bullet_speed: {
    id: 'bullet_speed',
    name: '疾风弹',
    category: 'augment',
    rarity: 'common',
    description: '增加子弹飞行速度',
    color: '#44eeff',
    icon: '速',
    maxLevel: 9,
    levels: [1.4, 1.8, 2.2, 2.7, 3.2, 3.8, 4.5, 5.5, 7.0],
    locked: false,
  },
  bullet_size: {
    id: 'bullet_size',
    name: '巨型弹',
    category: 'augment',
    rarity: 'common',
    description: '增大子弹体积和伤害范围',
    color: '#ddaa44',
    icon: '大',
    maxLevel: 9,
    levels: [1.6, 2.0, 2.5, 3.0, 3.8, 4.5, 5.5, 7.0, 9.0],
    locked: false,
  },
  splash: {
    id: 'splash',
    name: '爆裂弹',
    category: 'augment',
    rarity: 'uncommon',
    description: '子弹命中后产生溅射伤害',
    color: '#ff6644',
    icon: '爆',
    maxLevel: 9,
    levels: [25, 40, 55, 75, 95, 120, 150, 185, 230],
    locked: true,
  },
  chain_enhance: {
    id: 'chain_enhance',
    name: '连锁增强',
    category: 'augment',
    rarity: 'uncommon',
    description: '增加弹射/穿透次数',
    color: '#44aaff',
    icon: '链',
    maxLevel: 9,
    levels: [1, 2, 2, 3, 3, 4, 5, 6, 8],
    locked: true,
  },
  pierce_core: {
    id: 'pierce_core',
    name: '穿透核心',
    category: 'augment',
    rarity: 'rare',
    description: '子弹穿透敌人',
    color: '#aaddcc',
    icon: '穿',
    maxLevel: 9,
    levels: [1, 1, 2, 2, 3, 3, 4, 5, 7],
    locked: true,
  },
  barrage: {
    id: 'barrage',
    name: '弹幕增幅',
    category: 'augment',
    rarity: 'rare',
    description: '增加同时发射的子弹数量',
    color: '#ffaa44',
    icon: '弹',
    maxLevel: 9,
    levels: [1, 2, 2, 3, 3, 4, 5, 6, 8],
    locked: true,
  },
  attack_speed: {
    id: 'attack_speed',
    name: '攻速符文',
    category: 'augment',
    rarity: 'epic',
    description: '大幅缩短射击间隔',
    color: '#ff88cc',
    icon: '符',
    maxLevel: 9,
    levels: [0.85, 0.75, 0.65, 0.55, 0.48, 0.40, 0.33, 0.28, 0.20], // interval multiplier
    locked: true,
  },
  lucky_star: {
    id: 'lucky_star',
    name: '幸运星',
    category: 'augment',
    rarity: 'legendary',
    description: '提升掉落率和道具品质',
    color: '#ffdd44',
    icon: '★',
    maxLevel: 9,
    levels: [1.2, 1.4, 1.6, 1.9, 2.2, 2.6, 3.0, 3.5, 4.5], // drop multiplier
    locked: true,
  },
};

/* ============================================================
   防御类（9种）— 保护玩家
   ============================================================ */
export const DEFENSES: Record<string, ItemDef> = {
  shield_orbit: {
    id: 'shield_orbit',
    name: '旋转护盾',
    category: 'defense',
    rarity: 'common',
    description: '环绕护盾球，阻挡并伤害敌人',
    color: '#4488ff',
    icon: '盾',
    maxLevel: 9,
    levels: [1, 2, 3, 4, 5, 7, 9, 11, 14],
    locked: false,
  },
  repulse: {
    id: 'repulse',
    name: '抗拒光环',
    category: 'defense',
    rarity: 'common',
    description: '周期性推开附近敌人并造成伤害',
    color: '#aa66ff',
    icon: '斥',
    maxLevel: 9,
    levels: [70, 100, 130, 170, 210, 260, 320, 400, 500],
    locked: false,
  },
  heal_cloak: {
    id: 'heal_cloak',
    name: '治愈披风',
    category: 'defense',
    rarity: 'common',
    description: '每秒回复少量生命值',
    color: '#44ff88',
    icon: '愈',
    maxLevel: 9,
    levels: [2, 4, 6, 9, 13, 18, 24, 32, 45],
    locked: false,
  },
  swiftness: {
    id: 'swiftness',
    name: '疾风之靴',
    category: 'defense',
    rarity: 'uncommon',
    description: '提升移动速度',
    color: '#88ff44',
    icon: '靴',
    maxLevel: 9,
    levels: [1.25, 1.5, 1.8, 2.1, 2.5, 3.0, 3.6, 4.3, 5.5],
    locked: true,
  },
  armor: {
    id: 'armor',
    name: '铁甲',
    category: 'defense',
    rarity: 'uncommon',
    description: '减少受到的伤害',
    color: '#aaaaaa',
    icon: '甲',
    maxLevel: 9,
    levels: [0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.78, 0.85, 0.92],
    locked: true,
  },
  ghost_step: {
    id: 'ghost_step',
    name: '幽灵步',
    category: 'defense',
    rarity: 'rare',
    description: '每8秒短暂无敌1秒',
    color: '#aabbcc',
    icon: '幽',
    maxLevel: 9,
    levels: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.3, 2.6, 3.0], // invincible duration
    locked: true,
  },
  magnet: {
    id: 'magnet',
    name: '磁力场',
    category: 'defense',
    rarity: 'rare',
    description: '自动吸引远处的拾取物',
    color: '#ff8844',
    icon: '磁',
    maxLevel: 9,
    levels: [1.5, 2.0, 2.5, 3.0, 3.8, 4.5, 5.5, 7.0, 9.0], // pickup range multiplier
    locked: true,
  },
  reflect_mirror: {
    id: 'reflect_mirror',
    name: '反弹镜',
    category: 'defense',
    rarity: 'epic',
    description: '概率反弹敌人子弹',
    color: '#ccddff',
    icon: '镜',
    maxLevel: 9,
    levels: [0.10, 0.15, 0.20, 0.28, 0.35, 0.42, 0.50, 0.60, 0.75], // reflect chance
    locked: true,
  },
  holy_guard: {
    id: 'holy_guard',
    name: '圣光守护',
    category: 'defense',
    rarity: 'legendary',
    description: '血量低于20%时触发大回血',
    color: '#ffff88',
    icon: '圣',
    maxLevel: 9,
    levels: [0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.65], // hp restored ratio
    locked: true,
  },
};

/* ============================================================
   融合产物（20种）— 两个道具融合后的产出
   ============================================================ */
export const FUSION_ITEMS: Record<string, ItemDef> = {
  freeze_shotgun: { id: 'freeze_shotgun', name: '急冻霰弹', category: 'weapon', rarity: 'uncommon', description: '子弹减速敌人60%', color: '#88ccff', icon: '冻', maxLevel: 9, levels: [3, 5, 7, 9, 11, 14, 17, 20, 24], locked: false },
  hellfire: { id: 'hellfire', name: '地狱火', category: 'weapon', rarity: 'uncommon', description: '火球点燃地面持续灼烧', color: '#ff6622', icon: '焰', maxLevel: 9, levels: [1, 2, 3, 4, 5, 7, 9, 11, 14], locked: false },
  death_wheel: { id: 'death_wheel', name: '死亡轮盘', category: 'weapon', rarity: 'uncommon', description: '巨大回旋镖斩杀低血量目标', color: '#22ddaa', icon: '轮', maxLevel: 9, levels: [1, 2, 3, 4, 5, 7, 9, 11, 14], locked: false },
  wind_runner: { id: 'wind_runner', name: '风行者', category: 'defense', rarity: 'uncommon', description: '移动时回血速度翻倍', color: '#66ffaa', icon: '风', maxLevel: 9, levels: [1.5, 2.0, 2.5, 3.0, 3.8, 4.5, 5.5, 7.0, 9.0], locked: false },
  mega_blaster: { id: 'mega_blaster', name: '巨炮', category: 'weapon', rarity: 'uncommon', description: '单发巨型弹，高伤害+穿透', color: '#ffcc44', icon: '炮', maxLevel: 9, levels: [1.0, 1.3, 1.6, 2.0, 2.5, 3.0, 3.8, 5.0, 7.0], locked: false },
  shield_bash: { id: 'shield_bash', name: '铁壁', category: 'defense', rarity: 'uncommon', description: '护盾反弹伤害给敌人', color: '#6688cc', icon: '铁', maxLevel: 9, levels: [1, 2, 3, 4, 5, 7, 9, 11, 14], locked: false },
  thunder_slash: { id: 'thunder_slash', name: '雷暴斩', category: 'weapon', rarity: 'rare', description: '剑气命中触发连锁闪电', color: '#88aaff', icon: '雷', maxLevel: 9, levels: [1.5, 2.0, 2.8, 3.5, 4.5, 5.5, 7.0, 9.0, 12.0], locked: false },
  fragment_bomb: { id: 'fragment_bomb', name: '碎裂炮', category: 'weapon', rarity: 'rare', description: '命中分裂成小弹片，范围伤害', color: '#ff7744', icon: '碎', maxLevel: 9, levels: [3, 5, 7, 9, 11, 14, 17, 20, 24], locked: false },
  thunderstorm: { id: 'thunderstorm', name: '雷暴', category: 'weapon', rarity: 'rare', description: '穿透型闪电攻击', color: '#6699ff', icon: '暴', maxLevel: 9, levels: [1, 2, 3, 4, 5, 7, 9, 12, 15], locked: false },
  tracking_fireball: { id: 'tracking_fireball', name: '追踪火球', category: 'weapon', rarity: 'rare', description: '火球自动追踪最近敌人', color: '#ff5533', icon: '追', maxLevel: 9, levels: [1, 2, 3, 4, 5, 7, 9, 11, 14], locked: false },
  void_walker: { id: 'void_walker', name: '虚空行者', category: 'defense', rarity: 'rare', description: '无敌频率大幅提升', color: '#99aacc', icon: '虚', maxLevel: 9, levels: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.3, 2.6, 3.0], locked: false },
  frost_storm: { id: 'frost_storm', name: '雷暴冰霜', category: 'weapon', rarity: 'epic', description: '冰冻后闪电爆裂双重伤害', color: '#44ccff', icon: '霜', maxLevel: 9, levels: [1.2, 1.6, 2.0, 2.5, 3.2, 4.0, 5.0, 6.5, 8.5], locked: false },
  plague_bomb: { id: 'plague_bomb', name: '瘟疫炸弹', category: 'weapon', rarity: 'epic', description: '毒雾范围爆炸持续伤害', color: '#66aa22', icon: '瘟', maxLevel: 9, levels: [1.0, 1.5, 2.0, 2.5, 3.2, 4.0, 5.0, 6.5, 8.0], locked: false },
  black_hole: { id: 'black_hole', name: '黑洞', category: 'defense', rarity: 'epic', description: '吸引+减速+伤害+爆炸', color: '#8844cc', icon: '洞', maxLevel: 9, levels: [70, 100, 130, 170, 210, 260, 320, 400, 500], locked: false },
  sun_storm: { id: 'sun_storm', name: '太阳风暴', category: 'weapon', rarity: 'epic', description: '超大火球灼烧范围内所有敌人', color: '#ff8822', icon: '阳', maxLevel: 9, levels: [1, 2, 3, 4, 5, 7, 9, 11, 14], locked: false },
  nuclear_core: { id: 'nuclear_core', name: '核弹核心', category: 'augment', rarity: 'epic', description: '命中触发范围爆炸', color: '#ff3355', icon: '核', maxLevel: 9, levels: [25, 40, 55, 75, 95, 120, 150, 185, 230], locked: false },
  photon_cannon: { id: 'photon_cannon', name: '光子炮', category: 'weapon', rarity: 'legendary', description: '持续扫射激光束', color: '#ff44ff', icon: '光', maxLevel: 9, levels: [1.5, 2.0, 2.8, 3.5, 4.5, 5.5, 7.0, 9.0, 12.0], locked: false },
  absolute_defense: { id: 'absolute_defense', name: '绝对防御', category: 'defense', rarity: 'legendary', description: '护盾反弹+无敌帧大幅增加', color: '#ccddff', icon: '绝', maxLevel: 9, levels: [1, 2, 3, 4, 5, 7, 9, 11, 14], locked: false },
  soul_reaper: { id: 'soul_reaper', name: '灵魂收割', category: 'weapon', rarity: 'legendary', description: '斩杀触发范围爆炸+回复', color: '#aa22ff', icon: '魂', maxLevel: 9, levels: [0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.60], locked: false },
  angel_embrace: { id: 'angel_embrace', name: '天使之拥', category: 'defense', rarity: 'legendary', description: '低于50%血自动大回血+无敌3s', color: '#ffffaa', icon: '使', maxLevel: 9, levels: [0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.65], locked: false },
};

/** All items including fusion outputs */
export const ALL_ITEMS: Record<string, ItemDef> = {
  ...WEAPONS,
  ...AUGMENTS,
  ...DEFENSES,
  ...FUSION_ITEMS,
};

export const ITEM_IDS = Object.keys(ALL_ITEMS);

export function getItemDef(id: string): ItemDef | undefined {
  return ALL_ITEMS[id];
}

export function getItemValue(id: string, level: number): number {
  const def = ALL_ITEMS[id];
  if (!def) return 0;
  if (level <= 0) return 0;
  return def.levels[Math.min(level - 1, def.levels.length - 1)];
}

/** Get only unlocked item IDs (for spawning drops) */
export function getUnlockedItemIds(unlockedSet: Set<string>): string[] {
  return ITEM_IDS.filter(id => {
    const def = ALL_ITEMS[id];
    if (!def) return false;
    if (def.locked && !unlockedSet.has(id)) return false;
    return true;
  });
}
