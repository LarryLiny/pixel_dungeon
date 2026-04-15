// ── Types ────────────────────────────────────────────────────

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export type ObjectiveType =
  | 'kill_with_weapon'
  | 'survive_wave'
  | 'no_damage_taken'
  | 'kill_enemies'
  | 'collect_items'
  | 'no_potion'
  | 'defense_only';

export interface ChallengeObjective {
  type: ObjectiveType;
  /** weaponId, count, wave, etc. — depends on objective type */
  params: Record<string, number>;
  /** Chinese description for the UI */
  description: string;
}

export interface ChallengeTemplate {
  id: string;
  difficulty: ChallengeDifficulty;
  /** Chinese description */
  description: string;
  objectives: ChallengeObjective[];
}

// ── Easy (1 objective each) — at least 10 ────────────────────

const EASY_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'easy_kill_slimes',
    difficulty: 'easy',
    description: '击杀30只史莱姆',
    objectives: [
      { type: 'kill_enemies', params: { count: 30 }, description: '击杀30只敌人' },
    ],
  },
  {
    id: 'easy_survive_wave5',
    difficulty: 'easy',
    description: '存活到第5波',
    objectives: [
      { type: 'survive_wave', params: { wave: 5 }, description: '存活到第5波' },
    ],
  },
  {
    id: 'easy_kill_with_basic',
    difficulty: 'easy',
    description: '用基础弹击杀20个敌人',
    objectives: [
      { type: 'kill_with_weapon', params: { weaponId: 0, count: 20 }, description: '用基础弹击杀20个敌人' },
    ],
  },
  {
    id: 'easy_collect_8',
    difficulty: 'easy',
    description: '拾取8个道具',
    objectives: [
      { type: 'collect_items', params: { count: 8 }, description: '拾取8个道具' },
    ],
  },
  {
    id: 'easy_kill_50',
    difficulty: 'easy',
    description: '击杀50个敌人',
    objectives: [
      { type: 'kill_enemies', params: { count: 50 }, description: '击杀50个敌人' },
    ],
  },
  {
    id: 'easy_survive_wave3_nodmg',
    difficulty: 'easy',
    description: '前3波不受伤',
    objectives: [
      { type: 'no_damage_taken', params: { wave: 3 }, description: '前3波不受伤' },
    ],
  },
  {
    id: 'easy_kill_with_shotgun',
    difficulty: 'easy',
    description: '用霰弹枪击杀15个敌人',
    objectives: [
      { type: 'kill_with_weapon', params: { weaponId: 1, count: 15 }, description: '用霰弹枪击杀15个敌人' },
    ],
  },
  {
    id: 'easy_collect_5',
    difficulty: 'easy',
    description: '拾取5个道具',
    objectives: [
      { type: 'collect_items', params: { count: 5 }, description: '拾取5个道具' },
    ],
  },
  {
    id: 'easy_no_potion_wave5',
    difficulty: 'easy',
    description: '前5波不使用药水',
    objectives: [
      { type: 'no_potion', params: { wave: 5 }, description: '前5波不使用药水' },
    ],
  },
  {
    id: 'easy_survive_wave7',
    difficulty: 'easy',
    description: '存活到第7波',
    objectives: [
      { type: 'survive_wave', params: { wave: 7 }, description: '存活到第7波' },
    ],
  },
];

// ── Medium (2 objectives each) — at least 10 ─────────────────

const MEDIUM_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'med_survive8_kill60',
    difficulty: 'medium',
    description: '存活到第8波并击杀60个敌人',
    objectives: [
      { type: 'survive_wave', params: { wave: 8 }, description: '存活到第8波' },
      { type: 'kill_enemies', params: { count: 60 }, description: '击杀60个敌人' },
    ],
  },
  {
    id: 'med_no_dmg_wave5_kill40',
    difficulty: 'medium',
    description: '前5波不受伤并击杀40个敌人',
    objectives: [
      { type: 'no_damage_taken', params: { wave: 5 }, description: '前5波不受伤' },
      { type: 'kill_enemies', params: { count: 40 }, description: '击杀40个敌人' },
    ],
  },
  {
    id: 'med_kill_with_boomerang_collect10',
    difficulty: 'medium',
    description: '用回旋镖击杀25个敌人并拾取10个道具',
    objectives: [
      { type: 'kill_with_weapon', params: { weaponId: 3, count: 25 }, description: '用回旋镖击杀25个敌人' },
      { type: 'collect_items', params: { count: 10 }, description: '拾取10个道具' },
    ],
  },
  {
    id: 'med_no_potion_wave8_kill50',
    difficulty: 'medium',
    description: '前8波不使用药水并击杀50个敌人',
    objectives: [
      { type: 'no_potion', params: { wave: 8 }, description: '前8波不使用药水' },
      { type: 'kill_enemies', params: { count: 50 }, description: '击杀50个敌人' },
    ],
  },
  {
    id: 'med_defense_only_wave6',
    difficulty: 'medium',
    description: '仅用防御道具存活到第6波',
    objectives: [
      { type: 'defense_only', params: { wave: 6 }, description: '仅装备防御道具存活到第6波' },
      { type: 'survive_wave', params: { wave: 6 }, description: '存活到第6波' },
    ],
  },
  {
    id: 'med_kill_with_fireball_collect12',
    difficulty: 'medium',
    description: '用旋转火球击杀30个敌人并拾取12个道具',
    objectives: [
      { type: 'kill_with_weapon', params: { weaponId: 2, count: 30 }, description: '用旋转火球击杀30个敌人' },
      { type: 'collect_items', params: { count: 12 }, description: '拾取12个道具' },
    ],
  },
  {
    id: 'med_no_dmg_wave3_collect8',
    difficulty: 'medium',
    description: '前3波不受伤并拾取8个道具',
    objectives: [
      { type: 'no_damage_taken', params: { wave: 3 }, description: '前3波不受伤' },
      { type: 'collect_items', params: { count: 8 }, description: '拾取8个道具' },
    ],
  },
  {
    id: 'med_survive10_no_potion',
    difficulty: 'medium',
    description: '存活到第10波且不使用药水',
    objectives: [
      { type: 'survive_wave', params: { wave: 10 }, description: '存活到第10波' },
      { type: 'no_potion', params: { wave: 10 }, description: '不使用药水' },
    ],
  },
  {
    id: 'med_kill_with_basic_80',
    difficulty: 'medium',
    description: '用基础弹击杀80个敌人并存活到第7波',
    objectives: [
      { type: 'kill_with_weapon', params: { weaponId: 0, count: 80 }, description: '用基础弹击杀80个敌人' },
      { type: 'survive_wave', params: { wave: 7 }, description: '存活到第7波' },
    ],
  },
  {
    id: 'med_defense_only_kill30',
    difficulty: 'medium',
    description: '仅用防御道具并击杀30个敌人',
    objectives: [
      { type: 'defense_only', params: { wave: 5 }, description: '仅装备防御道具' },
      { type: 'kill_enemies', params: { count: 30 }, description: '击杀30个敌人' },
    ],
  },
];

// ── Hard (3 objectives each) — at least 10 ───────────────────

const HARD_TEMPLATES: ChallengeTemplate[] = [
  {
    id: 'hard_survive15_nodmg5_kill100',
    difficulty: 'hard',
    description: '存活到第15波，前5波不受伤，击杀100个敌人',
    objectives: [
      { type: 'survive_wave', params: { wave: 15 }, description: '存活到第15波' },
      { type: 'no_damage_taken', params: { wave: 5 }, description: '前5波不受伤' },
      { type: 'kill_enemies', params: { count: 100 }, description: '击杀100个敌人' },
    ],
  },
  {
    id: 'hard_no_potion_nodmg3_survive12',
    difficulty: 'hard',
    description: '不使用药水，前3波不受伤，存活到第12波',
    objectives: [
      { type: 'no_potion', params: { wave: 12 }, description: '不使用药水' },
      { type: 'no_damage_taken', params: { wave: 3 }, description: '前3波不受伤' },
      { type: 'survive_wave', params: { wave: 12 }, description: '存活到第12波' },
    ],
  },
  {
    id: 'hard_kill_lightning_collect15_survive10',
    difficulty: 'hard',
    description: '用闪电链击杀50个敌人，拾取15个道具，存活到第10波',
    objectives: [
      { type: 'kill_with_weapon', params: { weaponId: 4, count: 50 }, description: '用闪电链击杀50个敌人' },
      { type: 'collect_items', params: { count: 15 }, description: '拾取15个道具' },
      { type: 'survive_wave', params: { wave: 10 }, description: '存活到第10波' },
    ],
  },
  {
    id: 'hard_defense_only_nodmg5_kill50',
    difficulty: 'hard',
    description: '仅用防御道具，前5波不受伤，击杀50个敌人',
    objectives: [
      { type: 'defense_only', params: { wave: 8 }, description: '仅装备防御道具' },
      { type: 'no_damage_taken', params: { wave: 5 }, description: '前5波不受伤' },
      { type: 'kill_enemies', params: { count: 50 }, description: '击杀50个敌人' },
    ],
  },
  {
    id: 'hard_no_potion_kill120_survive10',
    difficulty: 'hard',
    description: '不使用药水，击杀120个敌人，存活到第10波',
    objectives: [
      { type: 'no_potion', params: { wave: 10 }, description: '不使用药水' },
      { type: 'kill_enemies', params: { count: 120 }, description: '击杀120个敌人' },
      { type: 'survive_wave', params: { wave: 10 }, description: '存活到第10波' },
    ],
  },
  {
    id: 'hard_kill_sword_collect20_nodmg3',
    difficulty: 'hard',
    description: '用剑气斩击杀40个敌人，拾取20个道具，前3波不受伤',
    objectives: [
      { type: 'kill_with_weapon', params: { weaponId: 5, count: 40 }, description: '用剑气斩击杀40个敌人' },
      { type: 'collect_items', params: { count: 20 }, description: '拾取20个道具' },
      { type: 'no_damage_taken', params: { wave: 3 }, description: '前3波不受伤' },
    ],
  },
  {
    id: 'hard_survive15_no_potion_kill80',
    difficulty: 'hard',
    description: '存活到第15波，不使用药水，击杀80个敌人',
    objectives: [
      { type: 'survive_wave', params: { wave: 15 }, description: '存活到第15波' },
      { type: 'no_potion', params: { wave: 15 }, description: '不使用药水' },
      { type: 'kill_enemies', params: { count: 80 }, description: '击杀80个敌人' },
    ],
  },
  {
    id: 'hard_kill_ice_wave_collect18_survive12',
    difficulty: 'hard',
    description: '用冰冻波击杀45个敌人，拾取18个道具，存活到第12波',
    objectives: [
      { type: 'kill_with_weapon', params: { weaponId: 6, count: 45 }, description: '用冰冻波击杀45个敌人' },
      { type: 'collect_items', params: { count: 18 }, description: '拾取18个道具' },
      { type: 'survive_wave', params: { wave: 12 }, description: '存活到第12波' },
    ],
  },
  {
    id: 'hard_nodmg8_kill60_no_potion',
    difficulty: 'hard',
    description: '前8波不受伤，击杀60个敌人，不使用药水',
    objectives: [
      { type: 'no_damage_taken', params: { wave: 8 }, description: '前8波不受伤' },
      { type: 'kill_enemies', params: { count: 60 }, description: '击杀60个敌人' },
      { type: 'no_potion', params: { wave: 8 }, description: '不使用药水' },
    ],
  },
  {
    id: 'hard_defense_only_survive15_collect15',
    difficulty: 'hard',
    description: '仅用防御道具存活到第15波并拾取15个道具',
    objectives: [
      { type: 'defense_only', params: { wave: 15 }, description: '仅装备防御道具' },
      { type: 'survive_wave', params: { wave: 15 }, description: '存活到第15波' },
      { type: 'collect_items', params: { count: 15 }, description: '拾取15个道具' },
    ],
  },
];

// ── Aggregated exports ───────────────────────────────────────

export const EASY_CHALLENGES: readonly ChallengeTemplate[] = EASY_TEMPLATES;
export const MEDIUM_CHALLENGES: readonly ChallengeTemplate[] = MEDIUM_TEMPLATES;
export const HARD_CHALLENGES: readonly ChallengeTemplate[] = HARD_TEMPLATES;

/** All templates grouped by difficulty for convenient lookup */
export const CHALLENGE_TEMPLATES: Record<ChallengeDifficulty, readonly ChallengeTemplate[]> = {
  easy: EASY_TEMPLATES,
  medium: MEDIUM_TEMPLATES,
  hard: HARD_TEMPLATES,
};
