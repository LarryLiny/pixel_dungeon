import Phaser from 'phaser';
import { ALL_ITEMS } from '../data/items';
import { addScore } from '../utils/leaderboard';

export const GAME_OVER_ACTIONS = [
  { label: '提交分数', target: 'LeaderboardScene', color: '#ffdd44' },
  { label: '再来一局', target: 'GameScene', color: '#44ddff' },
  { label: '返回主菜单', target: 'MenuScene', color: '#aaaacc' },
] as const;

export class GameOverScene extends Phaser.Scene {
  private nameInput: HTMLInputElement | null = null;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number; kills: number; wave: number; skills: { id: string; level: number }[]; endingText?: string }) {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#0a0a1a');

    const isMobile = 'ontouchstart' in window;
    const titleSize = Math.max(24, Math.min(36, Math.round(width * 0.045)));
    const textSize = Math.max(14, Math.min(18, Math.round(width * 0.023)));
    const smallSize = Math.max(12, Math.min(14, Math.round(width * 0.018)));
    const btnSize = Math.max(16, Math.min(20, Math.round(width * 0.026)));
    const centerX = width / 2;

    // Title
    this.add.text(centerX, height * 0.07, '游戏结束', {
      fontSize: `${titleSize}px`, color: '#ff3344', fontFamily: 'monospace', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Narrative ending text
    if (data.endingText) {
      this.add.text(centerX, height * 0.13, data.endingText, {
        fontSize: `${smallSize}px`, color: '#cc99ff', fontFamily: 'monospace', fontStyle: 'italic',
      }).setOrigin(0.5);
    }

    // Stats
    const stats = [
      `最终分数: ${data.score}`,
      `击杀数: ${data.kills}`,
      `到达波次: ${data.wave}`,
    ];

    stats.forEach((text, i) => {
      this.add.text(centerX, height * 0.20 + i * (textSize + 8), text, {
        fontSize: `${textSize}px`, color: '#ddddee', fontFamily: 'monospace',
      }).setOrigin(0.5);
    });

    this.add.text(centerX, height * 0.35, '下一步', {
      fontSize: `${smallSize}px`,
      color: '#88aacc',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(centerX, height * 0.39, '提交分数进入排行榜，或直接重新挑战', {
      fontSize: `${smallSize - 1}px`,
      color: '#666688',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    // Skills obtained
    if (data.skills && data.skills.length > 0) {
      this.add.text(width * 0.08, height * 0.48, '本局技能', {
        fontSize: `${smallSize}px`, color: '#8888aa', fontFamily: 'monospace',
      }).setOrigin(0, 0.5);

      data.skills.slice(0, 8).forEach((skill, i) => {
        const def = ALL_ITEMS[skill.id];
        if (def) {
          const col = i % 2;
          const row = Math.floor(i / 2);
          this.add.text(width * (0.08 + col * 0.25), height * 0.53 + row * (smallSize + 8), `${def.name} Lv.${skill.level}`, {
            fontSize: `${smallSize}px`, color: def.color, fontFamily: 'monospace',
          }).setOrigin(0, 0.5);
        }
      });
    }

    // Name input
    this.add.text(centerX, height * 0.50, '输入名字保存成绩', {
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
      font-family: monospace; background: #222233; color: #fff; border: 2px solid #ffdd44;
      border-radius: 0px; outline: none; z-index: 100;
      box-shadow: 0 0 0 2px #000000, 0 0 10px #ffdd4444;
      ${isMobile ? 'padding: 10px 14px; font-size: 20px;' : ''}
    `;
    document.body.appendChild(this.nameInput);
    if (!isMobile) this.nameInput.focus();

    const buttonY = height * 0.82;
    const gap = Math.min(180, width * 0.25);
    GAME_OVER_ACTIONS.forEach((action, i) => {
      const x = centerX + (i - 1) * gap;
      const button = this.add.text(x, buttonY, `[ ${action.label} ]`, {
        fontSize: `${i === 0 ? btnSize : btnSize - 2}px`,
        color: action.color,
        fontFamily: 'monospace',
        backgroundColor: i === 0 ? '#332a1188' : '#22224488',
        padding: { x: 14, y: 8 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      button.on('pointerover', () => button.setColor('#ffffff'));
      button.on('pointerout', () => button.setColor(action.color));
      button.on('pointerdown', () => {
        if (action.target === 'LeaderboardScene') {
          this.submitScore(data);
          return;
        }
        this.cleanup();
        this.scene.start(action.target);
      });
    });

    this.events.on('shutdown', () => this.cleanup());
  }

  private submitScore(data: { score: number; kills: number; wave: number }) {
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
  }

  private cleanup() {
    if (this.nameInput?.parentNode) {
      this.nameInput.remove();
    }
    this.nameInput = null;
  }
}
