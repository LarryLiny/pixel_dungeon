import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Title
    const titleSize = Math.max(28, Math.min(48, Math.round(width * 0.06)));
    this.add.text(width / 2, height * 0.2, '地牢肉鸽', {
      fontSize: `${titleSize}px`,
      color: '#ffdd44',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const subSize = Math.max(12, Math.round(width * 0.02));
    this.add.text(width / 2, height * 0.2 + titleSize + 10, 'Dungeon Roguelike', {
      fontSize: `${subSize}px`,
      color: '#8888aa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Buttons
    const btnSize = Math.max(18, Math.min(26, Math.round(width * 0.035)));

    // Start button with touch-friendly hit area
    const startBtn = this.add.text(width / 2, height * 0.5, '[ 开始游戏 ]', {
      fontSize: `${btnSize}px`,
      color: '#44ddff',
      fontFamily: 'monospace',
      backgroundColor: '#22224488',
      padding: { x: 20, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    startBtn.on('pointerover', () => startBtn.setColor('#88eeff'));
    startBtn.on('pointerout', () => startBtn.setColor('#44ddff'));
    startBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Upgrade Shop button
    const shopBtn = this.add.text(width / 2, height * 0.58, '[ 升级商店 ]', {
      fontSize: `${btnSize - 2}px`,
      color: '#44ff88',
      fontFamily: 'monospace',
      backgroundColor: '#22224488',
      padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    shopBtn.on('pointerover', () => shopBtn.setColor('#88ffbb'));
    shopBtn.on('pointerout', () => shopBtn.setColor('#44ff88'));
    shopBtn.on('pointerdown', () => {
      this.scene.start('ShopScene');
    });

    // Leaderboard button
    const lbBtn = this.add.text(width / 2, height * 0.68, '[ 排行榜 ]', {
      fontSize: `${btnSize - 2}px`,
      color: '#ffaa44',
      fontFamily: 'monospace',
      backgroundColor: '#22224488',
      padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    lbBtn.on('pointerover', () => lbBtn.setColor('#ffcc88'));
    lbBtn.on('pointerout', () => lbBtn.setColor('#ffaa44'));
    lbBtn.on('pointerdown', () => {
      this.scene.start('LeaderboardScene');
    });

    // Instructions
    const instrSize = Math.max(10, Math.round(width * 0.016));
    this.add.text(width / 2, height * 0.82, '触屏左侧摇杆移动 / WASD键移动', {
      fontSize: `${instrSize}px`, color: '#666688', fontFamily: 'monospace',
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.86, '自动射击 | 拾取技能升级 | 药水回血', {
      fontSize: `${instrSize}px`, color: '#555577', fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Add fullscreen hint on mobile
    if ('ontouchstart' in window) {
      const fsBtn = this.add.text(width / 2, height * 0.93, '[ 全屏模式 ]', {
        fontSize: `${instrSize + 1}px`, color: '#444466', fontFamily: 'monospace',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      fsBtn.on('pointerdown', () => {
        const el = document.documentElement as any;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      });
    }
  }
}
