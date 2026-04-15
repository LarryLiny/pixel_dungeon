import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { ScoreSystem } from '../systems/ScoreSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { ALL_ITEMS, ItemCategory } from '../data/items';

const CATEGORY_BG: Record<ItemCategory, number> = {
  weapon: 0x663311,
  augment: 0x113355,
  defense: 0x115533,
};
const CATEGORY_BORDER: Record<ItemCategory, number> = {
  weapon: 0xff8844,
  augment: 0x44eeff,
  defense: 0x44ff88,
};

/** Map item id → icon texture key */
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
};

export class HUD {
  scene: Phaser.Scene;
  sw: number;
  sh: number;
  fontSize: number;
  smallFont: number;

  hpBarBg: Phaser.GameObjects.Rectangle;
  hpBar: Phaser.GameObjects.Rectangle;
  hpText: Phaser.GameObjects.Text;
  scoreText: Phaser.GameObjects.Text;
  waveText: Phaser.GameObjects.Text;
  timerText: Phaser.GameObjects.Text;
  killText: Phaser.GameObjects.Text;
  skillBarBg: Phaser.GameObjects.Rectangle;
  skillIcons: {
    bg: Phaser.GameObjects.Rectangle;
    catBg: Phaser.GameObjects.Rectangle;
    image: Phaser.GameObjects.Image;
    level: Phaser.GameObjects.Text;
  }[];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.skillIcons = [];

    this.sw = scene.scale.width;
    this.sh = scene.scale.height;
    const scale = Math.min(this.sw / 800, this.sh / 600);
    this.fontSize = Math.max(12, Math.round(14 * scale));
    this.smallFont = Math.max(9, Math.round(11 * scale));

    const pad = Math.round(12 * scale);

    // HP Bar
    const hpBarW = Math.round(150 * scale);
    const hpBarH = Math.round(14 * scale);
    this.hpBarBg = scene.add.rectangle(pad, pad, hpBarW + 4, hpBarH + 4, 0x333333)
      .setOrigin(0, 0).setDepth(50).setScrollFactor(0);
    this.hpBar = scene.add.rectangle(pad + 2, pad + 2, hpBarW, hpBarH, 0xff3344)
      .setOrigin(0, 0).setDepth(51).setScrollFactor(0);
    this.hpText = scene.add.text(pad + hpBarW / 2, pad + hpBarH / 2 + 1, '100/100', {
      fontSize: `${this.smallFont}px`, color: '#fff', fontFamily: 'monospace',
    }).setOrigin(0.5, 0.5).setDepth(52).setScrollFactor(0);

    const infoX = pad;
    let infoY = pad + hpBarH + 10;

    this.scoreText = scene.add.text(infoX, infoY, '分数: 0', {
      fontSize: `${this.fontSize}px`, color: '#ffdd44', fontFamily: 'monospace',
    }).setDepth(50).setScrollFactor(0);
    infoY += this.fontSize + 4;

    this.killText = scene.add.text(infoX, infoY, '击杀: 0', {
      fontSize: `${this.smallFont + 1}px`, color: '#aaaacc', fontFamily: 'monospace',
    }).setDepth(50).setScrollFactor(0);
    infoY += this.smallFont + 5;

    this.waveText = scene.add.text(infoX, infoY, '第 1 波', {
      fontSize: `${this.smallFont + 1}px`, color: '#44ddff', fontFamily: 'monospace',
    }).setDepth(50).setScrollFactor(0);
    infoY += this.smallFont + 5;

    this.timerText = scene.add.text(infoX, infoY, '', {
      fontSize: `${this.smallFont}px`, color: '#88aa88', fontFamily: 'monospace',
    }).setDepth(50).setScrollFactor(0);

    // Skill bar (bottom center)
    const slotSize = Math.round(40 * scale);
    const slotGap = Math.round(5 * scale);
    const skillBarW = 5 * (slotSize + slotGap) + slotGap;
    const skillBarH = slotSize + slotGap * 2;
    const skillBarX = this.sw / 2 - skillBarW / 2;
    const skillBarY = this.sh - skillBarH - pad;

    this.skillBarBg = scene.add.rectangle(
      skillBarX, skillBarY, skillBarW, skillBarH, 0x111122, 0.9
    ).setOrigin(0, 0).setDepth(50).setScrollFactor(0)
      .setStrokeStyle(1, 0x444466, 0.6);

    for (let i = 0; i < 5; i++) {
      const x = skillBarX + slotGap + i * (slotSize + slotGap);
      const y = skillBarY + slotGap;

      const bg = scene.add.rectangle(x, y, slotSize, slotSize, 0x222244)
        .setStrokeStyle(2, 0x444466).setDepth(51).setScrollFactor(0);

      const catBg = scene.add.rectangle(x + 2, y + 2, slotSize - 4, slotSize - 4, 0x333355)
        .setDepth(51.5).setScrollFactor(0).setVisible(false);

      // Image icon (replaces text)
      const iconScale = slotSize / 20; // icons are 16px, scale to fill slot
      const image = scene.add.image(x + slotSize / 2, y + slotSize / 2, 'item_pickup')
        .setScale(iconScale).setDepth(52).setScrollFactor(0).setVisible(false);

      const level = scene.add.text(x + slotSize - 3, y + slotSize - 3, '', {
        fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
        color: '#ffdd44', fontFamily: 'monospace', fontStyle: 'bold',
        backgroundColor: '#000000cc', padding: { x: 3, y: 1 },
      }).setOrigin(1, 1).setDepth(53).setScrollFactor(0);

      this.skillIcons.push({ bg, catBg, image, level });
    }
  }

  update(player: Player, scoreSystem: ScoreSystem, waveSystem: WaveSystem, time: number) {
    const hpRatio = player.hp / player.maxHp;
    const scale = Math.min(this.sw / 800, this.sh / 600);
    const hpBarW = Math.round(150 * scale);

    this.hpBar.width = hpBarW * hpRatio;
    this.hpText.setText(`${Math.ceil(player.hp)}/${player.maxHp}`);
    this.scoreText.setText(`分数: ${scoreSystem.getScore()}`);
    this.killText.setText(`击杀: ${scoreSystem.getKillCount()}`);
    this.waveText.setText(`第 ${waveSystem.currentWave} 波`);
    const remaining = Math.ceil(waveSystem.getRemainingTime(time) / 1000);
    this.timerText.setText(`下一波: ${remaining}s`);

    for (let i = 0; i < 5; i++) {
      const slot = this.skillIcons[i];
      if (i < player.skills.length) {
        const skill = player.skills[i];
        const def = ALL_ITEMS[skill.id];
        if (def) {
          const cat = def.category;
          slot.catBg.setVisible(true);
          slot.catBg.setFillStyle(CATEGORY_BG[cat]);
          slot.bg.setStrokeStyle(2, CATEGORY_BORDER[cat]);

          // Show graphical icon
          const iconKey = ITEM_ICON_MAP[skill.id];
          if (iconKey && this.scene.textures.exists(iconKey)) {
            slot.image.setTexture(iconKey);
            slot.image.setVisible(true);
          } else {
            slot.image.setVisible(false);
          }

          slot.level.setText(`Lv${skill.level}`);
        }
      } else {
        slot.catBg.setVisible(false);
        slot.image.setVisible(false);
        slot.level.setText('');
        slot.bg.setStrokeStyle(2, 0x444466);
      }
    }
  }

  destroy() {
    this.hpBarBg.destroy();
    this.hpBar.destroy();
    this.hpText.destroy();
    this.scoreText.destroy();
    this.waveText.destroy();
    this.timerText.destroy();
    this.killText.destroy();
    this.skillBarBg.destroy();
    this.skillIcons.forEach(s => {
      s.bg.destroy();
      s.catBg.destroy();
      s.image.destroy();
      s.level.destroy();
    });
  }
}
