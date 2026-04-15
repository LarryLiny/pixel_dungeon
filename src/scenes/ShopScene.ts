import Phaser from 'phaser';
import { GoldSystem } from '../systems/GoldSystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { UPGRADE_IDS, getUpgradeDef } from '../data/upgrades';

export class ShopScene extends Phaser.Scene {
  private goldSystem!: GoldSystem;
  private upgradeSystem!: UpgradeSystem;
  private goldText!: Phaser.GameObjects.Text;
  private upgradeRows: {
    bg: Phaser.GameObjects.Rectangle;
    nameText: Phaser.GameObjects.Text;
    levelText: Phaser.GameObjects.Text;
    descText: Phaser.GameObjects.Text;
    costBtn: Phaser.GameObjects.Text;
    statLabel: Phaser.GameObjects.Text;
  }[] = [];

  constructor() {
    super({ key: 'ShopScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0a0a1a');

    this.goldSystem = new GoldSystem();
    this.upgradeSystem = new UpgradeSystem(this.goldSystem);

    // Font sizes
    const titleSize = Math.max(24, Math.min(36, Math.round(width * 0.045)));
    const textSize = Math.max(11, Math.min(14, Math.round(width * 0.017)));
    const btnSize = Math.max(14, Math.min(18, Math.round(width * 0.023)));
    const smallSize = Math.max(10, Math.min(12, Math.round(width * 0.015)));

    // Title
    this.add.text(width / 2, height * 0.04, '升级商店', {
      fontSize: `${titleSize}px`,
      color: '#ffdd44',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Gold display
    this.goldText = this.add.text(width / 2, height * 0.10, this.formatGold(), {
      fontSize: `${textSize + 2}px`,
      color: '#ffcc44',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Separator
    this.add.rectangle(width / 2, height * 0.13, width * 0.90, 2, 0x444466).setOrigin(0.5, 0);

    // Upgrade list
    const startY = height * 0.16;
    const rowHeight = Math.min(height * 0.095, 60);
    const maxWidth = width * 0.92;
    const leftX = width * 0.04;

    UPGRADE_IDS.forEach((id, i) => {
      const def = getUpgradeDef(id);
      if (!def) return;

      const y = startY + i * rowHeight;
      const level = this.upgradeSystem.getUpgradeLevel(id);
      const maxed = level >= def.maxLevel;
      const cost = maxed ? 0 : def.costPerLevel[level];
      const canBuy = !maxed && this.goldSystem.getGold() >= cost;

      // Row background
      const bg = this.add.rectangle(
        leftX + maxWidth / 2, y + rowHeight / 2 - 4,
        maxWidth, rowHeight - 6,
        maxed ? 0x111122 : 0x181830,
      ).setOrigin(0.5).setStrokeStyle(1, maxed ? 0x222244 : 0x333366);

      // Upgrade name
      const nameText = this.add.text(leftX + 8, y + 2, def.name, {
        fontSize: `${textSize}px`,
        color: maxed ? '#666688' : '#ddddee',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });

      // Level display
      const levelStr = `Lv.${level}/${def.maxLevel}`;
      const levelText = this.add.text(leftX + maxWidth - 10, y + 2, levelStr, {
        fontSize: `${smallSize}px`,
        color: maxed ? '#ffdd44' : '#88aacc',
        fontFamily: 'monospace',
      }).setOrigin(1, 0);

      // Description
      const descText = this.add.text(leftX + 8, y + textSize + 4, def.description, {
        fontSize: `${smallSize}px`,
        color: '#777799',
        fontFamily: 'monospace',
      });

      // Stat bar (visual level progress)
      const barWidth = Math.min(120, maxWidth * 0.25);
      const barHeight = 4;
      const barX = leftX + maxWidth - barWidth - 10;
      const barY = y + textSize + 7;

      // Bar background
      this.add.rectangle(barX + barWidth / 2, barY + barHeight / 2, barWidth, barHeight, 0x222244)
        .setOrigin(0.5);

      // Bar fill
      if (level > 0) {
        const fillWidth = (level / def.maxLevel) * barWidth;
        this.add.rectangle(barX + fillWidth / 2, barY + barHeight / 2, fillWidth, barHeight, 0x44ddff)
          .setOrigin(0.5);
      }

      // Cost / Buy button
      let costLabel: string;
      let costColor: string;
      if (maxed) {
        costLabel = '[ MAX ]';
        costColor = '#555577';
      } else {
        costLabel = `[ ${cost}G ]`;
        costColor = canBuy ? '#44ff88' : '#ff4466';
      }

      const costBtn = this.add.text(leftX + maxWidth / 2, y + rowHeight - 14, costLabel, {
        fontSize: `${smallSize + 1}px`,
        color: costColor,
        fontFamily: 'monospace',
        backgroundColor: canBuy ? '#22442266' : '#00000000',
        padding: { x: 6, y: 2 },
      }).setOrigin(0.5).setInteractive(canBuy ? { useHandCursor: true } : undefined);

      if (canBuy) {
        costBtn.on('pointerover', () => costBtn.setColor('#88ffbb'));
        costBtn.on('pointerout', () => costBtn.setColor('#44ff88'));
        costBtn.on('pointerdown', () => {
          this.handlePurchase(id);
        });
      }

      this.upgradeRows.push({ bg, nameText, levelText, descText, costBtn, statLabel: costBtn });
    });

    // Total bonus summary
    const bonuses = this.upgradeSystem.getPermanentBonuses();
    const bonusY = startY + UPGRADE_IDS.length * rowHeight + 8;
    const bonusStr = Object.entries(bonuses)
      .map(([stat, val]) => `${stat}: +${(val * 100).toFixed(0)}%`)
      .join('  ');
    if (bonusStr) {
      this.add.text(width / 2, bonusY, `当前总加成: ${bonusStr}`, {
        fontSize: `${smallSize}px`,
        color: '#666688',
        fontFamily: 'monospace',
      }).setOrigin(0.5);
    }

    // Back button
    const backBtn = this.add.text(width / 2, height * 0.94, '[ 返回主菜单 ]', {
      fontSize: `${btnSize}px`,
      color: '#44ddff',
      fontFamily: 'monospace',
      backgroundColor: '#22224488',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#88eeff'));
    backBtn.on('pointerout', () => backBtn.setColor('#44ddff'));
    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }

  private handlePurchase(id: string): void {
    if (this.upgradeSystem.purchaseUpgrade(id)) {
      // Refresh the entire UI by restarting the scene
      this.scene.restart();
    }
  }

  private formatGold(): string {
    return `金币: ${this.goldSystem.getGold()}G`;
  }
}
