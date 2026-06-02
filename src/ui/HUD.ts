import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { ScoreSystem } from '../systems/ScoreSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { ALL_ITEMS } from '../data/items';
import { FUSION_RECIPES } from '../data/fusionRecipes';
import { getItemVisualType } from '../utils/itemVisuals';

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
  // Fusion weapons
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
  // Fusion augments & defenses
  wind_runner: 'icon_wind_runner',
  shield_bash: 'icon_shield_bash',
  void_walker: 'icon_void_walker',
  black_hole: 'icon_black_hole',
  absolute_defense: 'icon_absolute_defense',
  angel_embrace: 'icon_angel_embrace',
  nuclear_core: 'icon_nuclear_core',
};

/** Get icon key for an item, falling back to base category icon for fusion items */
function getItemIconKey(itemId: string): string | null {
  if (ITEM_ICON_MAP[itemId]) return ITEM_ICON_MAP[itemId];
  // Fusion items: use first input's icon as fallback
  const recipe = FUSION_RECIPES.find(r => r.output === itemId);
  if (recipe) {
    const firstInputIcon = ITEM_ICON_MAP[recipe.inputs[0]];
    if (firstInputIcon) return firstInputIcon;
  }
  return null;
}

export class HUD {
  scene: Phaser.Scene;
  sw: number;
  sh: number;
  fontSize: number;
  smallFont: number;
  maxSlots: number;
  skillBarX: number;
  skillBarY: number;
  slotSize: number;
  slotGap: number;
  pad: number;

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
    typeTag: Phaser.GameObjects.Text;
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

    // Skill bar (bottom center) — initially 5 slots, grows with fusion bonuses
    this.maxSlots = 5;
    this.pad = pad;
    const slotSize = Math.round(40 * scale);
    const slotGap = Math.round(5 * scale);
    this.slotSize = slotSize;
    this.slotGap = slotGap;

    const skillBarW = this.maxSlots * (slotSize + slotGap) + slotGap;
    const skillBarH = slotSize + slotGap * 2;
    const skillBarX = this.sw / 2 - skillBarW / 2;
    const skillBarY = this.sh - skillBarH - pad;
    this.skillBarX = skillBarX;
    this.skillBarY = skillBarY;

    this.skillBarBg = scene.add.rectangle(
      skillBarX, skillBarY, skillBarW, skillBarH, 0x111122, 0.9
    ).setOrigin(0, 0).setDepth(50).setScrollFactor(0)
      .setStrokeStyle(1, 0x444466, 0.6);

    for (let i = 0; i < this.maxSlots; i++) {
      this.createSkillSlot(skillBarX + slotGap + i * (slotSize + slotGap), skillBarY + slotGap, slotSize, scale);
    }
  }

  private createSkillSlot(x: number, y: number, slotSize: number, scale: number) {
    const bg = this.scene.add.rectangle(x, y, slotSize, slotSize, 0x222244)
      .setStrokeStyle(2, 0x444466).setDepth(51).setScrollFactor(0);

    const catBg = this.scene.add.rectangle(x + 2, y + 2, slotSize - 4, slotSize - 4, 0x333355)
      .setDepth(51.5).setScrollFactor(0).setVisible(false);

    const iconScale = (slotSize * 0.8) / 16;
    const image = this.scene.add.image(x + slotSize / 2, y + slotSize / 2, 'icon_basic_shot')
      .setScale(iconScale).setDepth(52).setScrollFactor(0).setVisible(false);

    const typeTag = this.scene.add.text(x + 3, y + 3, '', {
      fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      backgroundColor: '#000000cc',
      padding: { x: 3, y: 1 },
    }).setOrigin(0, 0).setDepth(54).setScrollFactor(0).setVisible(false);

    const level = this.scene.add.text(x + slotSize - 3, y + slotSize - 3, '', {
      fontSize: `${Math.max(9, Math.round(10 * scale))}px`,
      color: '#ffdd44', fontFamily: 'monospace', fontStyle: 'bold',
      backgroundColor: '#000000cc', padding: { x: 3, y: 1 },
    }).setOrigin(1, 1).setDepth(53).setScrollFactor(0);

    this.skillIcons.push({ bg, catBg, image, typeTag, level });
  }

  // Cached values to skip redundant text updates
  private lastHpText = '';
  private lastScoreText = '';
  private lastKillText = '';
  private lastWaveText = '';
  private lastTimerText = '';

  update(player: Player, scoreSystem: ScoreSystem, waveSystem: WaveSystem, time: number) {
    // Expand skill bar if player has more skills than current slots
    const neededSlots = Math.max(5, player.skills.length);
    if (neededSlots > this.maxSlots) {
      const scale = Math.min(this.sw / 800, this.sh / 600);
      for (let i = this.maxSlots; i < neededSlots; i++) {
        const x = this.skillBarX + this.slotGap + i * (this.slotSize + this.slotGap);
        const y = this.skillBarY + this.slotGap;
        this.createSkillSlot(x, y, this.slotSize, scale);
      }
      this.maxSlots = neededSlots;

      // Resize background bar
      const newBarW = this.maxSlots * (this.slotSize + this.slotGap) + this.slotGap;
      this.skillBarBg.width = newBarW;
      this.skillBarBg.x = this.sw / 2 - newBarW / 2;
    }

    const hpRatio = player.hp / player.maxHp;
    const scale = Math.min(this.sw / 800, this.sh / 600);
    const hpBarW = Math.round(150 * scale);

    this.hpBar.width = hpBarW * hpRatio;

    // HP bar color gradient: green -> yellow -> red + low-HP pulse
    let hpColor: number;
    if (hpRatio > 0.6) {
      hpColor = 0x44ff66;
    } else if (hpRatio > 0.3) {
      hpColor = 0xffdd44;
    } else {
      hpColor = 0xff3344;
    }
    this.hpBar.setFillStyle(hpColor);
    if (hpRatio < 0.3) {
      this.hpBar.setAlpha(0.7 + Math.sin(time / 200) * 0.3);
    } else {
      this.hpBar.setAlpha(1);
    }
    const hpStr = `${Math.ceil(player.hp)}/${player.maxHp}`;
    if (hpStr !== this.lastHpText) { this.hpText.setText(hpStr); this.lastHpText = hpStr; }
    const scoreStr = `分数: ${scoreSystem.getScore()}`;
    if (scoreStr !== this.lastScoreText) { this.scoreText.setText(scoreStr); this.lastScoreText = scoreStr; }
    const killStr = `击杀: ${scoreSystem.getKillCount()}`;
    if (killStr !== this.lastKillText) { this.killText.setText(killStr); this.lastKillText = killStr; }
    const waveStr = `第 ${waveSystem.currentWave} 波`;
    if (waveStr !== this.lastWaveText) { this.waveText.setText(waveStr); this.lastWaveText = waveStr; }
    const remaining = Math.ceil(waveSystem.getRemainingTime(time) / 1000);
    const timerStr = `下一波: ${remaining}s`;
    if (timerStr !== this.lastTimerText) { this.timerText.setText(timerStr); this.lastTimerText = timerStr; }

    for (let i = 0; i < this.maxSlots; i++) {
      const slot = this.skillIcons[i];
      if (i < player.skills.length) {
        const skill = player.skills[i];
        const def = ALL_ITEMS[skill.id];
        if (def) {
          const visual = getItemVisualType(skill.id, def.category);
          slot.catBg.setVisible(true);
          slot.catBg.setFillStyle(visual.bgColor, 0.9);
          slot.bg.setStrokeStyle(3, visual.borderColor);
          slot.typeTag
            .setText(visual.shortLabel)
            .setColor(`#${visual.color.toString(16).padStart(6, '0')}`)
            .setVisible(true);

          // Show graphical icon
          const iconKey = getItemIconKey(skill.id);
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
        slot.typeTag.setVisible(false);
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
      s.typeTag.destroy();
      s.level.destroy();
    });
  }
}
