import { ItemCategory } from '../data/items';

export type ItemVisualType = 'direct' | 'area' | 'orbit' | 'beam' | 'augment' | 'defense';

export interface ItemVisualStyle {
  type: ItemVisualType;
  label: string;
  shortLabel: string;
  messagePrefix: string;
  color: number;
  bgColor: number;
  borderColor: number;
}

const ORBIT_ITEMS = new Set([
  'fireball_orbit',
  'lightning',
  'hellfire',
  'thunderstorm',
  'tracking_fireball',
  'sun_storm',
  'shield_orbit',
  'shield_bash',
  'absolute_defense',
]);

const AREA_ITEMS = new Set([
  'sword_slash',
  'ice_wave',
  'poison_snake',
  'death_scythe',
  'thunder_slash',
  'fragment_bomb',
  'frost_storm',
  'plague_bomb',
  'soul_reaper',
  'nuclear_core',
]);

const BEAM_ITEMS = new Set([
  'laser_beam',
  'photon_cannon',
]);

const VISUAL_STYLES: Record<ItemVisualType, ItemVisualStyle> = {
  direct: {
    type: 'direct',
    label: '直射武器',
    shortLabel: '射',
    messagePrefix: '获得直射武器',
    color: 0xffb057,
    bgColor: 0x3a2412,
    borderColor: 0xff8844,
  },
  area: {
    type: 'area',
    label: '范围攻击',
    shortLabel: '范',
    messagePrefix: '获得范围攻击',
    color: 0xd58cff,
    bgColor: 0x2b183a,
    borderColor: 0xaa66ff,
  },
  orbit: {
    type: 'orbit',
    label: '环绕被动',
    shortLabel: '环',
    messagePrefix: '获得环绕被动',
    color: 0xff6f5c,
    bgColor: 0x371716,
    borderColor: 0xff5533,
  },
  beam: {
    type: 'beam',
    label: '持续攻击',
    shortLabel: '束',
    messagePrefix: '获得持续攻击',
    color: 0xff77d6,
    bgColor: 0x351430,
    borderColor: 0xff44cc,
  },
  augment: {
    type: 'augment',
    label: '属性强化',
    shortLabel: '强',
    messagePrefix: '获得属性强化',
    color: 0x66e9ff,
    bgColor: 0x12313c,
    borderColor: 0x44ddff,
  },
  defense: {
    type: 'defense',
    label: '生存防御',
    shortLabel: '防',
    messagePrefix: '获得生存防御',
    color: 0x70f0a0,
    bgColor: 0x143321,
    borderColor: 0x44ff88,
  },
};

export function getItemVisualType(itemId: string, category?: ItemCategory): ItemVisualStyle {
  if (ORBIT_ITEMS.has(itemId)) return VISUAL_STYLES.orbit;
  if (AREA_ITEMS.has(itemId)) return VISUAL_STYLES.area;
  if (BEAM_ITEMS.has(itemId)) return VISUAL_STYLES.beam;
  if (category === 'augment') return VISUAL_STYLES.augment;
  if (category === 'defense') return VISUAL_STYLES.defense;
  return VISUAL_STYLES.direct;
}
