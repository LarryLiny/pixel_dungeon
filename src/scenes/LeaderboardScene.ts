import Phaser from 'phaser';
import { getLeaderboard } from '../utils/leaderboard';

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0a0a1a');

    const titleSize = Math.max(24, Math.min(32, Math.round(width * 0.04)));
    const textSize = Math.max(11, Math.min(14, Math.round(width * 0.017)));
    const btnSize = Math.max(14, Math.min(18, Math.round(width * 0.023)));

    // Title
    this.add.text(width / 2, height * 0.05, '排行榜', {
      fontSize: `${titleSize}px`, color: '#ffdd44', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Headers
    const headerY = height * 0.12;
    const colX = [0.10, 0.28, 0.52, 0.68, 0.82];
    const headers = ['排名', '名字', '分数', '击杀', '波次'];

    headers.forEach((h, i) => {
      this.add.text(width * colX[i], headerY, h, {
        fontSize: `${textSize - 1}px`, color: '#8888aa', fontFamily: 'monospace',
      });
    });

    this.add.rectangle(width / 2, headerY + textSize + 2, width * 0.88, 1, 0x444466).setOrigin(0.5, 0);

    // Entries
    const board = getLeaderboard();
    const maxShow = Math.min(board.length, Math.floor((height * 0.72) / (textSize + 10)));

    for (let i = 0; i < maxShow; i++) {
      const entry = board[i];
      const y = headerY + textSize + 16 + i * (textSize + 10);

      const rankColor = i === 0 ? '#ffdd44' : i === 1 ? '#ddddee' : i === 2 ? '#cc8844' : '#8888aa';
      this.add.text(width * colX[0], y, `${i + 1}`, { fontSize: `${textSize}px`, color: rankColor, fontFamily: 'monospace' });
      this.add.text(width * colX[1], y, entry.name, { fontSize: `${textSize}px`, color: '#ddddee', fontFamily: 'monospace' });
      this.add.text(width * colX[2], y, `${entry.score}`, { fontSize: `${textSize}px`, color: '#ffdd44', fontFamily: 'monospace' });
      this.add.text(width * colX[3], y, `${entry.kills}`, { fontSize: `${textSize}px`, color: '#aaaacc', fontFamily: 'monospace' });
      this.add.text(width * colX[4], y, `${entry.wave}`, { fontSize: `${textSize}px`, color: '#44ddff', fontFamily: 'monospace' });
    }

    if (board.length === 0) {
      this.add.text(width / 2, height * 0.5, '暂无记录，去挑战吧!', {
        fontSize: `${textSize + 2}px`, color: '#666688', fontFamily: 'monospace',
      }).setOrigin(0.5);
    }

    // Back button
    const backBtn = this.add.text(width / 2, height * 0.92, '[ 返回主菜单 ]', {
      fontSize: `${btnSize}px`, color: '#44ddff', fontFamily: 'monospace',
      backgroundColor: '#22224488',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#88eeff'));
    backBtn.on('pointerout', () => backBtn.setColor('#44ddff'));
    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
