import Phaser from 'phaser';
import { Enemy, EnemyData } from '../entities/Enemy';
import { Pickup } from '../entities/Pickup';
import { ENEMIES, WAVE_ENEMIES } from '../data/enemies';
import { MAX_ENEMIES, MAX_PICKUPS, TILE_SIZE, MAP_COLS, MAP_ROWS } from '../constants';
import { WaveConfig } from '../data/waves';
import { randomPick, randInt } from '../utils/helpers';

import { ITEM_IDS, ALL_ITEMS, getUnlockedItemIds, ItemRarity } from '../data/items';

export class SpawnSystem {
  scene: Phaser.Scene;
  enemies: Phaser.Physics.Arcade.Group;
  pickups: Phaser.Physics.Arcade.Group;
  mapWidth: number;
  mapHeight: number;
  playerX: number;
  playerY: number;
  grid: number[][]; // dungeon grid: 0=floor, 1=wall
  unlockedItems: Set<string>;
  private cachedFloorTiles: { x: number; y: number }[] | null = null;

  constructor(
    scene: Phaser.Scene,
    enemies: Phaser.Physics.Arcade.Group,
    pickups: Phaser.Physics.Arcade.Group,
    mapWidth: number,
    mapHeight: number,
    grid: number[][],
    unlockedItems: Set<string> = new Set()
  ) {
    this.scene = scene;
    this.enemies = enemies;
    this.pickups = pickups;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.grid = grid;
    this.playerX = mapWidth / 2;
    this.playerY = mapHeight / 2;
    this.unlockedItems = unlockedItems;
  }

  setUnlockedItems(set: Set<string>) {
    this.unlockedItems = set;
  }

  setPlayerPos(x: number, y: number) {
    this.playerX = x;
    this.playerY = y;
  }

  /** Check if a pixel position is on a floor tile */
  isFloor(px: number, py: number): boolean {
    const col = Math.floor(px / TILE_SIZE);
    const row = Math.floor(py / TILE_SIZE);
    if (row <= 0 || row >= MAP_ROWS - 1 || col <= 0 || col >= MAP_COLS - 1) return false;
    return this.grid[row]?.[col] === 0;
  }

  cleanupEnemies() {
    const dead = this.enemies.getChildren().filter(e => !(e as unknown as Enemy).active);
    for (const e of dead) {
      this.enemies.remove(e, true, true);
    }
  }

  cleanupPickups() {
    while (this.pickups.countActive() > MAX_PICKUPS) {
      const oldest = this.pickups.getFirstAlive();
      if (oldest) {
        const p = oldest as unknown as Pickup;
        if (p.glowRing) p.glowRing.destroy();
        this.pickups.remove(oldest, true, true);
      } else break;
    }
  }

  spawnEnemy(config: WaveConfig): Enemy | null {
    if (this.enemies.getChildren().length > MAX_ENEMIES * 2) {
      this.cleanupEnemies();
    }
    if (this.enemies.countActive() >= MAX_ENEMIES) return null;

    const tier = randomPick(config.availableTiers);
    const enemyId = randomPick(WAVE_ENEMIES[tier]);
    const data = ENEMIES[enemyId];
    if (!data) return null;

    const modifiedData: EnemyData = {
      ...data,
      hp: Math.round(data.hp * config.hpMultiplier),
      speed: data.speed * config.speedMultiplier,
    };

    const pos = this.getSpawnPosition();
    const enemy = new Enemy(this.scene, pos.x, pos.y, modifiedData);
    this.enemies.add(enemy, true);
    enemy.initBody();
    return enemy;
  }

  spawnItemPickup(x?: number, y?: number, itemId?: string): Pickup | null {
    this.cleanupPickups();
    const pos = x !== undefined ? { x, y: y! } : this.getSpawnPosition();
    const availableIds = getUnlockedItemIds(this.unlockedItems);
    const chosenId = itemId || randomPick(availableIds.length > 0 ? availableIds : ITEM_IDS);
    const def = ALL_ITEMS[chosenId];
    if (!def) return null;

    const pickup = new Pickup(this.scene, pos.x, pos.y, 'item', chosenId, def.category);
    this.pickups.add(pickup, true);
    const body = pickup.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(12 + 4, 12 + 4);
      body.setAllowGravity(false);
      body.setImmovable(true);
    }
    return pickup;
  }

  spawnPotion(x?: number, y?: number): Pickup | null {
    const pos = x !== undefined ? { x, y: y! } : this.getSpawnPosition();
    const pickup = new Pickup(this.scene, pos.x, pos.y, 'potion');
    this.pickups.add(pickup, true);
    const body = pickup.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(12 + 4, 12 + 4);
      body.setAllowGravity(false);
      body.setImmovable(true);
    }
    return pickup;
  }

  spawnFragmentPickup(x: number, y: number, rarity: ItemRarity): Pickup | null {
    const pickup = new Pickup(this.scene, x, y, 'fragment', null, null, 0, rarity);
    this.pickups.add(pickup, true);
    const body = pickup.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(12 + 4, 12 + 4);
      body.setAllowGravity(false);
      body.setImmovable(true);
    }
    return pickup;
  }

  private getSpawnPosition(): { x: number; y: number } {
    // Try to find a floor tile near player but not too close
    for (let attempt = 0; attempt < 30; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 350 + Math.random() * 250;
      let x = this.playerX + Math.cos(angle) * dist;
      let y = this.playerY + Math.sin(angle) * dist;

      x = Phaser.Math.Clamp(x, TILE_SIZE * 2, this.mapWidth - TILE_SIZE * 2);
      y = Phaser.Math.Clamp(y, TILE_SIZE * 2, this.mapHeight - TILE_SIZE * 2);

      if (this.isFloor(x, y)) {
        return { x, y };
      }
    }

    // Fallback: use cached floor tiles
    if (!this.cachedFloorTiles) {
      this.cachedFloorTiles = [];
      for (let row = 2; row < MAP_ROWS - 2; row++) {
        for (let col = 2; col < MAP_COLS - 2; col++) {
          if (this.grid[row][col] === 0) {
            this.cachedFloorTiles.push({
              x: col * TILE_SIZE + TILE_SIZE / 2,
              y: row * TILE_SIZE + TILE_SIZE / 2,
            });
          }
        }
      }
    }

    // Filter to tiles far enough from player
    const farTiles = this.cachedFloorTiles.filter(t => {
      const dx = t.x - this.playerX;
      const dy = t.y - this.playerY;
      return dx * dx + dy * dy > 200 * 200;
    });

    if (farTiles.length > 0) {
      return farTiles[randInt(0, farTiles.length - 1)];
    }

    // Ultimate fallback: player position + offset, validated against grid
    for (let offset = 64; offset < 300; offset += 32) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const fx = this.playerX + Math.cos(angle) * offset;
        const fy = this.playerY + Math.sin(angle) * offset;
        if (this.isFloor(fx, fy)) {
          return { x: fx, y: fy };
        }
      }
    }
    // Absolute fallback: player position itself
    return { x: this.playerX, y: this.playerY };
  }
}
