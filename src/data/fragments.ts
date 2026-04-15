import { ItemRarity } from './items';

export interface FragmentDef {
  rarity: ItemRarity;
  name: string;
  color: string;
  dropWaveRange: [number, number]; // [minWave, maxWave]
  dropRate: number; // base drop chance per enemy kill in range
  requiredToUnlock: number; // fragments needed to unlock one item
  unlockableRarities: ItemRarity[]; // which rarities this fragment can unlock
}

export const FRAGMENT_DEFS: Record<ItemRarity, FragmentDef> = {
  common: {
    rarity: 'common',
    name: '白色碎片',
    color: '#cccccc',
    dropWaveRange: [1, 3],
    dropRate: 0.15,
    requiredToUnlock: 3,
    unlockableRarities: ['common'],
  },
  uncommon: {
    rarity: 'uncommon',
    name: '绿色碎片',
    color: '#44cc44',
    dropWaveRange: [4, 7],
    dropRate: 0.10,
    requiredToUnlock: 5,
    unlockableRarities: ['uncommon'],
  },
  rare: {
    rarity: 'rare',
    name: '蓝色碎片',
    color: '#4488ff',
    dropWaveRange: [8, 12],
    dropRate: 0.07,
    requiredToUnlock: 8,
    unlockableRarities: ['rare'],
  },
  epic: {
    rarity: 'epic',
    name: '紫色碎片',
    color: '#aa44ff',
    dropWaveRange: [13, 18],
    dropRate: 0.04,
    requiredToUnlock: 12,
    unlockableRarities: ['epic'],
  },
  legendary: {
    rarity: 'legendary',
    name: '金色碎片',
    color: '#ffaa00',
    dropWaveRange: [18, 999],
    dropRate: 0.02,
    requiredToUnlock: 20,
    unlockableRarities: ['legendary'],
  },
};

/** Determine which fragment rarity can drop at a given wave */
export function getFragmentRarityForWave(wave: number): ItemRarity | null {
  for (const [rarity, def] of Object.entries(FRAGMENT_DEFS)) {
    if (wave >= def.dropWaveRange[0] && wave <= def.dropWaveRange[1]) {
      return rarity as ItemRarity;
    }
  }
  return null;
}

/** Storage key for LocalStorage */
export const FRAGMENT_STORAGE_KEY = 'dungeon_fragments';
export const UNLOCK_STORAGE_KEY = 'dungeon_unlocked_items';
