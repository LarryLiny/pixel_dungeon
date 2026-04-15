import Phaser from 'phaser';
import { SKILLS } from '../data/skills';
import { addScore } from '../utils/leaderboard';

export class GameOverScene extends Phaser.Scene {
  private nameInput: HTMLInputElement | null = null;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number; kills: number; wave: number; skills: { id: string; level: number }[] }) {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0a0a1a');

    const isMobile = 'ontouchstart' in window;
    const titleSize = Math.max(24, Math.min(36, Math.round(width * 0.045)));
    const textSize = Math.max(14, Math.min(18, Math.round(width * 0.023)));
    const smallSize = Math.max(12, Math.min(14, Math.round(width * 0.018)));
    const btnSize = Math.max(16, Math.min(20, Math.round(width * 0.026)));

    // Title
    this.add.text(width / 2, height * 0.08, '游戏结束', {
      fontSize: `${titleSize}px`, color: '#ff3344', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stats
    const stats = [
      `最终分数: ${data.score}`,
      `击杀数: ${data.kills}`,
      `到达波次: ${data.wave}`,
    ];

    stats.forEach((text, i) => {
      this.add.text(width / 2, height * 0.22 + i * (textSize + 8), text, {
        fontSize: `${textSize}px`, color: '#ddddee', fontFamily: 'monospace',
      }).setOrigin(0.5);
    });

    // Skills obtained
    if (data.skills && data.skills.length > 0) {
      this.add.text(width / 2, height * 0.44, '获得的技能:', {
        fontSize: `${smallSize}px`, color: '#8888aa', fontFamily: 'monospace',
      }).setOrigin(0.5);

      data.skills.forEach((skill, i) => {
        const def = SKILLS[skill.id];
        if (def) {
          this.add.text(width / 2, height * 0.50 + i * (smallSize + 6), `${def.name} Lv.${skill.level}`, {
            fontSize: `${smallSize}px`, color: def.icon, fontFamily: 'monospace',
          }).setOrigin(0.5);
        }
      });
    }

    // Name input
    this.add.text(width / 2, height * 0.70, '输入你的名字:', {
      fontSize: `${smallSize}px`, color: '#aaaacc', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const inputW = Math.min(200, width * 0.5);
    const inputFontSize = isMobile ? '18px' : '16px';
    const rect = this.scale.canvas.getBoundingClientRect();
    const inputY = rect.top + rect.height * 0.74;

    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.maxLength = 10;
    this.nameInput.value = '勇者';
    this.nameInput.style.cssText = `
      position: fixed; left: 50%; top: ${inputY}px; transform: translateX(-50%);
      width: ${inputW}px; padding: 8px 12px; font-size: ${inputFontSize}; text-align: center;
      font-family: monospace; background: #222233; color: #fff; border: 2px solid #44ddff;
      border-radius: 6px; outline: none; z-index: 100;
      ${isMobile ? 'border-radius: 8px; padding: 10px 14px;' : ''}
    `;
    document.body.appendChild(this.nameInput);
    if (!isMobile) this.nameInput.focus();

    // Submit button
    const submitBtn = this.add.text(width / 2, height * 0.84, '[ 提交分数 ]', {
      fontSize: `${btnSize}px`, color: '#ffdd44', fontFamily: 'monospace',
      backgroundColor: '#22224488',
      padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    submitBtn.on('pointerdown', () => {
      const name = (this.nameInput?.value?.trim()) || '勇者';
      addScore({
        name,
        score: data.score,
        kills: data.kills,
        wave: data.wave,
        date: new Date().toLocaleDateString('zh-CN'),
      });
      this.cleanup();
      this.scene.start('LeaderboardScene');
    });

    // Retry button
    const retryBtn = this.add.text(width / 2, height * 0.93, '[ 再来一局 ]', {
      fontSize: `${btnSize - 2}px`, color: '#44ddff', fontFamily: 'monospace',
      padding: { x: 14, y: 6 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryBtn.on('pointerdown', () => {
      this.cleanup();
      this.scene.start('GameScene');
    });

    this.events.on('shutdown', () => this.cleanup());
  }

  private cleanup() {
    if (this.nameInput?.parentNode) {
      this.nameInput.remove();
    }
    this.nameInput = null;
  }
}
