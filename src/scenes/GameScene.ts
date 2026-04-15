import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Pickup } from '../entities/Pickup';
import { AutoShootSystem } from '../systems/AutoShootSystem';
import { SpawnSystem } from '../systems/SpawnSystem';
import { ItemSystem } from '../systems/ItemSystem';
import { FusionSystem } from '../systems/FusionSystem';
import { FragmentSystem } from '../systems/FragmentSystem';
import { CombatFeedbackSystem } from '../systems/CombatFeedbackSystem';
import { ALL_ITEMS, ITEM_IDS } from '../data/items';
import { WaveSystem } from '../systems/WaveSystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { HUD } from '../ui/HUD';
import {
  TILE_SIZE, MAP_COLS, MAP_ROWS, MAP_WIDTH, MAP_HEIGHT,
  PICKUP_SPAWN_INTERVAL, MAX_BULLETS,
  SKILL_DROP_CHANCE, POTION_DROP_CHANCE,
} from '../constants';
import { distance, randFloat, randInt } from '../utils/helpers';

export class GameScene extends Phaser.Scene {
  player!: Player;
  enemies!: Phaser.Physics.Arcade.Group;
  bullets!: Phaser.Physics.Arcade.Group;
  pickups!: Phaser.Physics.Arcade.Group;
  walls!: Phaser.Physics.Arcade.StaticGroup;
  floorTiles!: Phaser.GameObjects.Group;
  dungeonGrid!: number[][]; // 0=floor, 1=wall

  shootSystem!: AutoShootSystem;
  spawnSystem!: SpawnSystem;
  itemSystem!: ItemSystem;
  fusionSystem!: FusionSystem;
  fragmentSystem!: FragmentSystem;
  combatFeedback!: CombatFeedbackSystem;
  waveSystem!: WaveSystem;
  scoreSystem!: ScoreSystem;
  hud!: HUD;
  joystick!: VirtualJoystick;

  wasdKeys!: Record<string, Phaser.Input.Keyboard.Key>;
  lastEnemySpawn: number = 0;
  lastPickupSpawn: number = 0;
  gameTime: number = 0;
  messageText!: Phaser.GameObjects.Text;
  cleanupTimer: number = 0;
  fusionCheckTimer: number = 0;

  // Stacking message system
  messageQueue: { text: Phaser.GameObjects.Text; age: number; duration: number }[] = [];
  maxMessages: number = 5;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.gameTime = 0;
    this.lastEnemySpawn = 0;
    this.lastPickupSpawn = 0;
    this.cleanupTimer = 0;
    this.fusionCheckTimer = 0;

    this.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    this.createRandomDungeon();

    this.enemies = this.physics.add.group({ runChildUpdate: false });
    this.bullets = this.physics.add.group({ classType: Bullet, runChildUpdate: false, maxSize: MAX_BULLETS });
    this.pickups = this.physics.add.group({ runChildUpdate: false });

    this.player = new Player(this, MAP_WIDTH / 2, MAP_HEIGHT / 2);
    // Player constructor already calls scene.add.existing + scene.physics.add.existing

    this.shootSystem = new AutoShootSystem(this, this.player, this.bullets);
    this.shootSystem.onOrbKill = (enemy: Enemy) => {
      if (enemy.scored) return;
      enemy.scored = true;
      this.scoreSystem.addKill(enemy.score);
      this.onEnemyKilled(enemy);
    };
    this.shootSystem.onWeaponKill = (enemy: Enemy) => {
      if (enemy.scored) return;
      enemy.scored = true;
      this.scoreSystem.addKill(enemy.score);
      this.onEnemyKilled(enemy);
      this.combatFeedback.onKill(false);
      this.combatFeedback.deathExplosion(enemy.x, enemy.y, 0xffaa44, 4);
    };

    // Initialize FragmentSystem (uses localStorage for persistence)
    this.fragmentSystem = new FragmentSystem();

    this.spawnSystem = new SpawnSystem(
      this, this.enemies, this.pickups,
      MAP_WIDTH, MAP_HEIGHT, this.dungeonGrid,
      this.fragmentSystem.getUnlockedItems()
    );
    this.itemSystem = new ItemSystem(this.player);
    this.fusionSystem = new FusionSystem(this.player, this.itemSystem);
    this.combatFeedback = new CombatFeedbackSystem(this);
    this.waveSystem = new WaveSystem(this);
    this.scoreSystem = new ScoreSystem();
    this.waveSystem.start(this.time.now);

    this.physics.add.overlap(this.bullets, this.enemies, this.onBulletHitEnemy as any, undefined, this);
    this.physics.add.overlap(this.player, this.pickups, this.onPlayerPickup as any, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemyHitPlayer as any, undefined, this);
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);

    this.hud = new HUD(this);
    this.joystick = new VirtualJoystick(this);

    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // Message display area (center-top of screen)
    this.messageText = this.add.text(this.scale.width / 2, 60, '', {
      fontSize: '16px', color: '#ffdd44', fontFamily: 'monospace',
    }).setOrigin(0.5, 0).setDepth(200).setScrollFactor(0).setVisible(false);

    this.waveSystem.onWaveStart = (wave: number) => {
      this.showMessage(`第 ${wave} 波开始!`, 2000);
    };

    this.setupKeyboard();
  }

  /** Procedurally generate a random dungeon map */
  createRandomDungeon() {
    this.walls = this.physics.add.staticGroup();
    this.floorTiles = this.add.group();

    // Grid: 0=floor, 1=wall
    const grid: number[][] = Array.from({ length: MAP_ROWS }, () => Array(MAP_COLS).fill(1));

    // Generate rooms
    const rooms: { x: number; y: number; w: number; h: number }[] = [];
    const roomCount = 12 + randInt(0, 6);
    const minSize = 4, maxSize = 10;

    for (let attempt = 0; attempt < roomCount * 5 && rooms.length < roomCount; attempt++) {
      const w = randInt(minSize, maxSize);
      const h = randInt(minSize, maxSize);
      const rx = randInt(2, MAP_COLS - w - 2);
      const ry = randInt(2, MAP_ROWS - h - 2);

      // Check overlap (with 1 tile padding)
      let overlaps = false;
      for (const room of rooms) {
        if (rx - 1 < room.x + room.w && rx + w + 1 > room.x &&
            ry - 1 < room.y + room.h && ry + h + 1 > room.y) {
          overlaps = true;
          break;
        }
      }
      if (overlaps) continue;

      rooms.push({ x: rx, y: ry, w, h });

      // Carve room
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          grid[ry + dy][rx + dx] = 0;
        }
      }
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
      const a = rooms[i - 1];
      const b = rooms[i];
      const ax = Math.floor(a.x + a.w / 2);
      const ay = Math.floor(a.y + a.h / 2);
      const bx = Math.floor(b.x + b.w / 2);
      const by = Math.floor(b.y + b.h / 2);

      // L-shaped corridor
      let cx = ax, cy = ay;
      while (cx !== bx) {
        grid[cy][cx] = 0;
        // Make corridor 2 tiles wide
        if (cy > 0) grid[cy - 1][cx] = 0;
        if (cy < MAP_ROWS - 1) grid[cy + 1][cx] = 0;
        cx += cx < bx ? 1 : -1;
      }
      while (cy !== by) {
        grid[cy][cx] = 0;
        if (cx > 0) grid[cy][cx - 1] = 0;
        if (cx < MAP_COLS - 1) grid[cy][cx + 1] = 0;
        cy += cy < by ? 1 : -1;
      }
    }

    // Ensure center area (player spawn) is clear
    const centerCol = Math.floor(MAP_COLS / 2);
    const centerRow = Math.floor(MAP_ROWS / 2);
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const r = centerRow + dy;
        const c = centerCol + dx;
        if (r > 0 && r < MAP_ROWS - 1 && c > 0 && c < MAP_COLS - 1) {
          grid[r][c] = 0;
        }
      }
    }

    // Render grid
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;

        if (row === 0 || row === MAP_ROWS - 1 || col === 0 || col === MAP_COLS - 1) {
          // Always wall border
          const wall = this.walls.create(x, y, 'wall') as Phaser.Physics.Arcade.Sprite;
          wall.setImmovable(true).setDepth(2);
        } else if (grid[row][col] === 1) {
          // Interior wall
          const wall = this.walls.create(x, y, 'wall') as Phaser.Physics.Arcade.Sprite;
          wall.setImmovable(true).setDepth(2);
        } else {
          // Floor
          this.add.image(x, y, 'floor').setDepth(0);
        }
      }
    }

    // Store grid for spawn system
    this.dungeonGrid = grid;
  }

  setupKeyboard() {
    if (!this.input.keyboard) return;
    this.wasdKeys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>;
  }

  update(time: number, delta: number) {
    if (!this.player.isAlive) return;

    this.gameTime += delta;
    this.cleanupTimer += delta;

    // Periodic cleanup of dead objects (every 2s)
    if (this.cleanupTimer > 2000) {
      this.cleanupTimer = 0;
      this.spawnSystem.cleanupEnemies();
    }

    // Player movement
    let dx = 0, dy = 0;
    if (this.wasdKeys) {
      if (this.wasdKeys.w.isDown) dy -= 1;
      if (this.wasdKeys.s.isDown) dy += 1;
      if (this.wasdKeys.a.isDown) dx -= 1;
      if (this.wasdKeys.d.isDown) dx += 1;
    }

    const joyDir = this.joystick.getDirection();
    if (this.joystick.isActive && (joyDir.x !== 0 || joyDir.y !== 0)) {
      dx = joyDir.x;
      dy = joyDir.y;
    }

    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    this.player.setMoveDirection(dx, dy);
    this.spawnSystem.setPlayerPos(this.player.x, this.player.y);
    this.player.update(time, delta);

    // Wave system
    this.waveSystem.update(time);

    // Spawn enemies
    const waveConfig = this.waveSystem.getConfig();
    if (time - this.lastEnemySpawn > waveConfig.spawnInterval) {
      if (this.waveSystem.shouldSpawn()) {
        this.spawnSystem.spawnEnemy(waveConfig);
        this.lastEnemySpawn = time;
      }
    }

    if (this.enemies.countActive() < 3 && this.waveSystem.canSpawnMore()) {
      this.spawnSystem.spawnEnemy(waveConfig);
    }

    // Spawn pickups
    if (time - this.lastPickupSpawn > PICKUP_SPAWN_INTERVAL) {
      this.spawnSystem.spawnItemPickup();
      if (Math.random() < 0.4) {
        this.spawnSystem.spawnPotion();
      }
      this.lastPickupSpawn = time;
    }

    // Check for fusions every 2 seconds
    this.fusionCheckTimer += delta;
    if (this.fusionCheckTimer > 2000) {
      this.fusionCheckTimer = 0;
      this.checkAndAutoFuse();
    }

    // Update enemies
    const enemyChildren = this.enemies.getChildren().filter(e => (e as any).active) as any[];
    for (const enemy of enemyChildren) {
      if (enemy.isAlive) {
        enemy.update(time, delta, this.player.x, this.player.y);
      }
    }

    // Update shooting
    this.shootSystem.update(time, enemyChildren);

    // Repulse aura
    this.shootSystem.applyRepulse(enemyChildren as Enemy[]);

    // Shield orb collision with enemies
    if (this.player.modifiers.shieldOrbs > 0) {
      this.updateShieldOrbs(time, enemyChildren as Enemy[]);
    }

    // Magnet pickups
    const pickupRange = this.itemSystem.getPickupRange();
    const activePickups = this.pickups.getChildren().filter(p => (p as any).active) as any[];
    for (const pickup of activePickups) {
      const dist = distance(this.player.x, this.player.y, pickup.x, pickup.y);
      if (dist < pickupRange) {
        const angle = Math.atan2(this.player.y - pickup.y, this.player.x - pickup.x);
        const speed = 200 * (1 - dist / pickupRange);
        const body = pickup.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
      } else {
        const body = pickup.body as Phaser.Physics.Arcade.Body;
        if (body) {
          body.setVelocity(0, 0);
        }
      }
      pickup.update(time, delta);
    }

    // HUD
    this.hud.update(this.player, this.scoreSystem, this.waveSystem, time);

    // Update stacking messages
    this.updateMessages(delta);

    // Update combat feedback (slow-mo timers etc.)
    this.combatFeedback.update(delta);

    if (!this.player.isAlive) {
      this.onPlayerDeath();
    }
  }

  /** Check for possible fusions and auto-execute the first one */
  checkAndAutoFuse() {
    const possible = this.fusionSystem.checkFusions();
    if (possible.length === 0) return;

    const first = possible[0];
    const result = this.fusionSystem.executeFusion(first.recipe.id, first.indexA, first.indexB);
    if (result.success && result.recipe) {
      this.showMessage(result.message, 3000);
      this.createFusionEffect();
    }
  }

  /** Visual effect for fusion: flash + screen shake */
  createFusionEffect() {
    this.combatFeedback.fusionFlash(this.player.x, this.player.y);
  }

  // Shield orbs: orbiting shields that damage and knock back enemies
  shieldOrbSprites: Phaser.GameObjects.Arc[] = [];

  updateShieldOrbs(time: number, enemies: Enemy[]) {
    const count = this.player.modifiers.shieldOrbs;
    const orbitRadius = 40;

    // Sync orb count
    while (this.shieldOrbSprites.length < count) {
      const orb = this.add.circle(0, 0, 8, 0x4488ff, 0.6).setDepth(9);
      this.shieldOrbSprites.push(orb);
    }
    while (this.shieldOrbSprites.length > count) {
      this.shieldOrbSprites.pop()!.destroy();
    }

    for (let i = 0; i < this.shieldOrbSprites.length; i++) {
      const angle = (time / 600) + (i * Math.PI * 2 / Math.max(1, count));
      const ox = this.player.x + Math.cos(angle) * orbitRadius;
      const oy = this.player.y + Math.sin(angle) * orbitRadius;
      this.shieldOrbSprites[i].setPosition(ox, oy);

      // Check collision with enemies
      for (const enemy of enemies) {
        if (!enemy.isAlive || !enemy.active) continue;
        const dist = distance(ox, oy, enemy.x, enemy.y);
        if (dist < 20) {
          enemy.takeDamage(5);
          // Push enemy away
          const dx = enemy.x - ox;
          const dy = enemy.y - oy;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          enemy.setVelocity((dx / len) * 120, (dy / len) * 120);
          if (!enemy.isAlive && !enemy.scored) {
            enemy.scored = true;
            this.scoreSystem.addKill(enemy.score);
            this.onEnemyKilled(enemy);
          }
        }
      }
    }
  }

  onBulletHitEnemy(bulletObj: any, enemyObj: any) {
    const bullet = bulletObj as Bullet;
    const enemy = enemyObj as Enemy;

    if (!enemy.isAlive || !enemy.active || !bullet.active) return;

    // Death scythe / soul reaper: execute low-hp enemies instantly
    if ((bullet.weaponType === 'death_scythe' || bullet.weaponType === 'soul_reaper')
      && bullet.executeThreshold > 0
      && enemy.isAlive
      && enemy.hp > 0
      && enemy.hp / enemy.maxHp <= bullet.executeThreshold) {
      // Instant kill
      enemy.takeDamage(enemy.hp + 100);
    } else {
      enemy.takeDamage(bullet.damage);
    }

    // Apply status effects (from freeze_shotgun, etc.)
    const effects = [];
    if (bullet.slowOnHit > 0) {
      effects.push({
        type: 'slow' as const,
        value: bullet.slowOnHit,
        duration: bullet.slowDuration * 1000,
        startTime: this.time.now,
      });
    }
    if (bullet.poisonDps > 0) {
      effects.push({
        type: 'poison' as const,
        value: bullet.poisonDps,
        duration: bullet.poisonDuration * 1000,
        startTime: this.time.now,
      });
    }
    if (effects.length > 0) {
      for (const effect of effects) {
        enemy.applyEffect(effect);
      }
    }

    // Poison snake / plague bomb: spawn poison cloud on hit
    if ((bullet.weaponType === 'poison_snake' || bullet.weaponType === 'plague_bomb')
      && (bullet as any)._cloudDps) {
      this.shootSystem.spawnPoisonCloud(enemy.x, enemy.y, (bullet as any)._cloudDps, 3);
    }

    bullet.onHitEnemy();

    // Hit feedback
    const isCrit = bullet.damage > 20;
    this.combatFeedback.onHit(isCrit);
    this.combatFeedback.showDamage(enemy.x, enemy.y, bullet.damage, isCrit);

    if (bullet.chainCount > 0 && enemy.isAlive) {
      this.chainLightning(enemy, bullet.damage * 0.5, bullet.chainCount, 100);
    }

    if (!enemy.isAlive && !enemy.scored) {
      enemy.scored = true;
      this.scoreSystem.addKill(enemy.score);
      this.onEnemyKilled(enemy);
      // Kill feedback
      this.combatFeedback.onKill(isCrit);
      this.combatFeedback.deathExplosion(enemy.x, enemy.y, 0xffaa44, isCrit ? 8 : 5);
    }
  }

  chainLightning(source: Enemy, damage: number, chainsLeft: number, range: number) {
    const activeEnemies = this.enemies.getChildren().filter(e => (e as any).active && (e as any).isAlive) as any[];
    for (const target of activeEnemies) {
      if (target === source) continue;
      const dist = distance(source.x, source.y, target.x, target.y);
      if (dist < range) {
        target.takeDamage(damage);
        // Lightning visual
        const line = this.add.line(0, 0, source.x, source.y, target.x, target.y, 0x44ddff, 0.6)
          .setDepth(9).setLineWidth(2);
        this.time.delayedCall(150, () => { if (line.active) line.destroy(); });

        if (chainsLeft > 1 && !target.isAlive && !target.scored) {
          target.scored = true;
          this.scoreSystem.addKill(target.score);
          this.onEnemyKilled(target);
        }
        if (chainsLeft > 1) {
          this.chainLightning(target, damage * 0.7, chainsLeft - 1, range * 0.8);
        }
        break;
      }
    }
  }

  onEnemyKilled(enemy: Enemy) {
    if (Math.random() < SKILL_DROP_CHANCE) {
      this.spawnSystem.spawnItemPickup(enemy.x, enemy.y);
    }
    if (Math.random() < POTION_DROP_CHANCE) {
      this.spawnSystem.spawnPotion(enemy.x, enemy.y);
    }

    // Fragment drop based on current wave
    const wave = this.waveSystem.currentWave;
    if (this.fragmentSystem.shouldDropFragment(wave)) {
      const rarity = this.fragmentSystem.getFragmentRarityForWave(wave);
      if (rarity) {
        this.spawnSystem.spawnFragmentPickup(enemy.x, enemy.y, rarity);
      }
    }

    this.createDeathEffect(enemy.x, enemy.y);
  }

  createDeathEffect(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      const particle = this.add.rectangle(x, y, 3, 3, 0xffaa44).setDepth(15);
      this.tweens.add({
        targets: particle,
        x: x + randFloat(-25, 25),
        y: y + randFloat(-25, 25),
        alpha: 0,
        duration: 250,
        onComplete: () => { if (particle.active) particle.destroy(); },
      });
    }
  }

  onPlayerPickup(_playerObj: any, pickupObj: any) {
    const pickup = pickupObj as Pickup;
    if (pickup.pickupType === 'item' && pickup.itemId) {
      const result = this.itemSystem.pickupItem(pickup.itemId);
      this.showMessage(result.message, result.success ? 1500 : 1000);
      if (result.success) {
        this.combatFeedback.levelUpFlash();
      }
    } else if (pickup.pickupType === 'potion') {
      this.player.heal(this.player.maxHp * 0.3);
      this.showMessage('回复 30% 生命!', 1000);
    } else if (pickup.pickupType === 'fragment' && pickup.fragmentRarity) {
      this.fragmentSystem.addFragment(pickup.fragmentRarity);
      this.showMessage(`获得碎片: ${pickup.fragmentRarity}`, 1000);
    }
    // Remove from group properly
    this.pickups.remove(pickup, true, true);
  }

  onEnemyHitPlayer(_playerObj: any, enemyObj: any) {
    const enemy = enemyObj as Enemy;
    if (!enemy.isAlive || !this.player.isAlive) return;

    this.player.takeDamage(enemy.enemyData.damage);

    // Knockback both player and enemy away from each other
    const dx = this.player.x - enemy.x;
    const dy = this.player.y - enemy.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    // Push enemy away so it doesn't stick
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;
    if (enemyBody) {
      enemyBody.setVelocity((-dx / len) * 180, (-dy / len) * 180);
    }
    // Brief push on player (player update will override velocity next frame)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    if (playerBody) {
      playerBody.setVelocity((dx / len) * 150, (dy / len) * 150);
    }

    this.cameras.main.shake(100, 0.005);
  }

  showMessage(text: string, duration: number) {
    const fontSize = Math.max(13, Math.min(16, Math.round(this.scale.width * 0.02)));
    const msgText = this.add.text(this.scale.width / 2, 60, text, {
      fontSize: `${fontSize}px`, color: '#ffdd44', fontFamily: 'monospace',
      backgroundColor: '#000000aa', padding: { x: 8, y: 3 },
    }).setOrigin(0.5, 0).setDepth(200).setScrollFactor(0).setAlpha(1);

    this.messageQueue.push({ text: msgText, age: 0, duration });
    this.relayoutMessages();

    // If over max, remove oldest
    while (this.messageQueue.length > this.maxMessages) {
      const old = this.messageQueue.shift()!;
      old.text.destroy();
    }
    this.relayoutMessages();
  }

  updateMessages(delta: number) {
    for (let i = this.messageQueue.length - 1; i >= 0; i--) {
      const msg = this.messageQueue[i];
      msg.age += delta;

      // Fade out during last 40% of duration
      const fadeStart = msg.duration * 0.6;
      if (msg.age > fadeStart) {
        const fadeProgress = (msg.age - fadeStart) / (msg.duration - fadeStart);
        msg.text.setAlpha(Math.max(0, 1 - fadeProgress));
      }

      if (msg.age >= msg.duration) {
        msg.text.destroy();
        this.messageQueue.splice(i, 1);
      }
    }
    this.relayoutMessages();
  }

  relayoutMessages() {
    const startY = 60;
    const lineHeight = 24;
    for (let i = 0; i < this.messageQueue.length; i++) {
      this.messageQueue[i].text.setY(startY + i * lineHeight);
    }
  }

  onPlayerDeath() {
    this.physics.pause();
    this.cameras.main.flash(500, 255, 0, 0);

    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene', {
        score: this.scoreSystem.getScore(),
        kills: this.scoreSystem.getKillCount(),
        wave: this.waveSystem.currentWave,
        skills: this.player.skills.map(s => ({ id: s.id, level: s.level })),
      });
    });
  }
}
