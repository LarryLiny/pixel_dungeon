import Phaser from 'phaser';
import { PICKUP_SIZE } from '../constants';
import { ItemCategory, ItemRarity } from '../data/items';
import { FRAGMENT_DEFS } from '../data/fragments';

export type PickupType = 'item' | 'potion' | 'fragment';

const CATEGORY_COLORS: Record<string, number> = {
  weapon: 0xff8844,
  augment: 0x44eeff,
  defense: 0x44ff88,
};

const FRAGMENT_TEXTURE_KEY: Record<ItemRarity, string> = {
  common: 'fragment_common',
  uncommon: 'fragment_uncommon',
  rare: 'fragment_rare',
  epic: 'fragment_epic',
  legendary: 'fragment_legendary',
};

/** Map item id → icon texture key (same mapping as HUD) */
const ITEM_ICON_MAP: Record<string, string> = {
  basic_shot: 'icon_basic_shot',
  shotgun: 'icon_shotgun',
  fireball_orbit: 'icon_fireball_orbit',
  boomerang: 'icon_boomerang',
  lightning: 'icon_lightning',
  sword_slash: 'icon_sword_slash',
  ice_wave: 'icon_ice_wave',
  poison_snake: 'icon_poison_snake',
  laser_beam: 'icon_laser_beam',
  death_scythe: 'icon_death_scythe',
  power: 'icon_power',
  bullet_speed: 'icon_bullet_speed',
  bullet_size: 'icon_bullet_size',
  splash: 'icon_splash',
  chain_enhance: 'icon_chain_enhance',
  pierce_core: 'icon_pierce_core',
  barrage: 'icon_barrage',
  attack_speed: 'icon_attack_speed',
  lucky_star: 'icon_lucky_star',
  shield_orbit: 'icon_shield_orbit',
  repulse: 'icon_repulse',
  heal_cloak: 'icon_heal_cloak',
  swiftness: 'icon_swiftness',
  armor: 'icon_armor',
  ghost_step: 'icon_ghost_step',
  magnet: 'icon_magnet',
  reflect_mirror: 'icon_reflect_mirror',
  holy_guard: 'icon_holy_guard',
  freeze_shotgun: 'icon_freeze_shotgun',
  hellfire: 'icon_hellfire',
  death_wheel: 'icon_death_wheel',
  mega_blaster: 'icon_mega_blaster',
  thunder_slash: 'icon_thunder_slash',
  fragment_bomb: 'icon_fragment_bomb',
  thunderstorm: 'icon_thunderstorm',
  tracking_fireball: 'icon_tracking_fireball',
  frost_storm: 'icon_frost_storm',
  plague_bomb: 'icon_plague_bomb',
  sun_storm: 'icon_sun_storm',
  photon_cannon: 'icon_photon_cannon',
  soul_reaper: 'icon_soul_reaper',
  wind_runner: 'icon_wind_runner',
  shield_bash: 'icon_shield_bash',
  void_walker: 'icon_void_walker',
  black_hole: 'icon_black_hole',
  absolute_defense: 'icon_absolute_defense',
  angel_embrace: 'icon_angel_embrace',
  nuclear_core: 'icon_nuclear_core',
};

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  pickupType: PickupType;
  itemId: string | null;
  itemCategory: ItemCategory | null;
  healAmount: number;
  bobOffset: number;
  glowRing: Phaser.GameObjects.Arc | null;
  fragmentRarity: ItemRarity | null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: PickupType,
    itemId: string | null = null,
    itemCategory: ItemCategory | null = null,
    healAmount: number = 30,
    fragmentRarity: ItemRarity | null = null
  ) {
    let textureKey: string;
    if (type === 'item') {
      textureKey = (itemId && ITEM_ICON_MAP[itemId]) || 'item_pickup';
    } else if (type === 'fragment') {
      textureKey = FRAGMENT_TEXTURE_KEY[fragmentRarity || 'common'];
    } else {
      textureKey = 'potion';
    }
    super(scene, x, y, textureKey);

    this.pickupType = type;
    this.itemId = itemId;
    this.itemCategory = itemCategory;
    this.healAmount = healAmount;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.glowRing = null;
    this.fragmentRarity = fragmentRarity;

    this.setScale(1.5);
    this.setDepth(6);

    // Color the glow based on type / category
    let glowColor: number;
    if (type === 'potion') {
      glowColor = 0x44ff66;
    } else if (type === 'fragment' && fragmentRarity) {
      const hexStr = FRAGMENT_DEFS[fragmentRarity].color;
      glowColor = parseInt(hexStr.replace('#', ''), 16);
    } else {
      glowColor = CATEGORY_COLORS[itemCategory || 'weapon'] || 0xffdd44;
    }
    this.glowRing = scene.add.circle(x, y, 14, glowColor, 0.25).setDepth(5);
  }

  destroy(fromScene?: boolean) {
    if (this.glowRing) {
      this.glowRing.destroy();
      this.glowRing = null;
    }
    super.destroy(fromScene);
  }
}
