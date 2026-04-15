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
      textureKey = 'item_pickup';
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
