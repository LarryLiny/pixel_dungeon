# UI & Visual Audit Report
## 像素地牢 (Pixel Dungeon) — 2026-04-17

---

## 概要

对像素地牢的全部 UI 场景（Menu、Game/HUD、Shop、GameOver、Leaderboard）和视觉系统（pixelAssets 素材、AutoShootSystem 武器特效、VirtualJoystick）进行了全面审查。

**核心发现：**
- 精灵大小比例体系存在严重的层级冲突，orbit 火球视觉面积过大，破坏了玩家对实体重要性的直觉判断
- HUD 技能栏图标缩放基准不一致（iconScale = slotSize / 20，但图标实际是 16x16 素材）
- 所有场景 UI 缺乏设计系统——颜色、字体大小、间距均通过局部 Math.max/min 计算，没有全局 token
- 缺少关键的交互反馈：技能拾取无动画、按钮无 press 状态、商品无已购买视觉区分（除 MAX）
- 视觉一致性中等偏下——像素风基调存在，但非整数缩放（1.8、2.5）导致像素模糊

**严重度分布：** Critical 3 / High 6 / Medium 7 / Low 5

---

## 按优先级排列的问题列表

---

### CRITICAL-1: Orbit 火球视觉过大，严重破坏游戏可读性

**问题描述：**
火球轨道（fireball_orbit）及其融合变体的 setScale 值为 1.8-2.5，原始素材仅 12x12，缩放后实际渲染尺寸达 21.6x21.6 至 30x30 像素。玩家角色（16x16 base, scale 1.5 = 24px）在视觉上被自己的环绕火球淹没。sun_storm 变体 scale 2.5 = 30px，比玩家本体还大 25%。

更严重的是，火球使用非整数缩放（1.8、2.0、2.5），12x12 像素素材经非整数缩放后产生像素模糊，破坏像素风格的核心美感。

**当前代码位置：**
- `src/systems/AutoShootSystem.ts` 第 457 行: `orb.setScale(1.8)`
- 第 475 行: `orb.setScale(2.0)` (hellfire)
- 第 477 行: `orb.setScale(2.5)` (sun_storm)
- 第 481 行: `orb.setScale(1.6)` (tracking_fireball)
- `src/utils/pixelAssets.ts` 第 282 行: `generateTexture(scene, 'fireball_orb', 12, 12, ...)`

**建议修改方案：**

方案 A（推荐 — 调整素材+缩放）：
1. 将 fireball_orb 素材从 12x12 升级到 16x16，增加火焰细节
2. 降低缩放值为整数或半整数倍：fireball_orbit: 1.5, hellfire: 1.5, sun_storm: 2.0, tracking_fireball: 1.5
3. 确保所有缩放值为 0.5 的整数倍，避免亚像素模糊

```typescript
// AutoShootSystem.ts — updateOrbs() 内，第 470-485 行替换为：
if (weaponType === 'hellfire') {
  orb.setTint(0xff4400);
  orb.setScale(1.5);
} else if (weaponType === 'sun_storm') {
  orb.setTint(0xff8800);
  orb.setScale(2.0);
} else if (weaponType === 'tracking_fireball') {
  orb.setTint(0xff2200);
  orb.setScale(1.5);
} else {
  orb.setTint(0xff4400);
  orb.setScale(1.5);
}
```

```typescript
// pixelAssets.ts — createFireballOrbTexture() 改为 16x16：
export function createFireballOrbTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'fireball_orb', 16, 16, (ctx) => {
    // Outer fire
    ctx.fillStyle = '#ff4422';
    ctx.fillRect(3, 0, 10, 2);
    ctx.fillRect(1, 2, 14, 10);
    ctx.fillRect(3, 12, 10, 2);
    // Mid flame
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(4, 3, 8, 8);
    // Hot core
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(5, 4, 6, 6);
    // White center
    ctx.fillStyle = '#fff';
    ctx.fillRect(6, 5, 4, 4);
    // Flame tips (top and bottom)
    ctx.fillStyle = '#ff6622';
    ctx.fillRect(5, 0, 2, 2);
    ctx.fillRect(9, 0, 2, 2);
    ctx.fillRect(5, 14, 2, 2);
    ctx.fillRect(9, 14, 2, 2);
  });
}
```

**比例参考：** 玩家 16x16 @ 1.5 = 24px。火球 16x16 @ 1.5 = 24px（同尺寸，合理）。sun_storm 16x16 @ 2.0 = 32px（稍大，体现终极武器感）。Boss demon 16x16 @ 2.2 = 35px，仍然大于火球。

---

### CRITICAL-2: 非整数缩放破坏像素风一致性

**问题描述：**
像素风游戏的核心规则是所有精灵的 setScale 必须为整数（1, 2, 3）或严格半整数（1.5, 2.5），且原始素材尺寸应与缩放值配合使得最终像素不出现亚像素渲染。

当前代码中存在大量破坏此规则的缩放值：
- 敌人 scale: 1.2 (bat), 1.4 (slime/goblin/skeleton), 1.8 (orc), 2.2 (demon)
- 子弹 setScale(1.2) (Bullet.ts 默认), setScale(1.3) (poison)
- orbit: 1.8, 2.0, 2.5, 1.6
- 玩家: 1.5 (合规)
- pickup: 1.5 (合规)

**当前代码位置：**
- `src/data/enemies.ts` 全部 scale 字段
- `src/entities/Bullet.ts` 第 46 行
- `src/systems/AutoShootSystem.ts` 多处 setScale

**建议修改方案：**

建立统一的缩放层级表（像素风缩放规范）：

| 实体类型 | 当前 scale | 建议 scale | 最终尺寸 (base 16x16) |
|---------|-----------|-----------|----------------------|
| Player | 1.5 | 1.5 (保持) | 24px |
| Slime | 1.4 | 1.5 | 24px |
| Bat | 1.2 | 1.0 | 16px |
| Goblin | 1.4 | 1.5 | 24px |
| Skeleton | 1.4 | 1.5 | 24px |
| Orc | 1.8 | 2.0 | 32px |
| Ghost | 1.5 | 1.5 | 24px |
| Demon (boss) | 2.2 | 2.5 | 40px |
| Bullet (default) | 1.2 | 1.5 | 9px (base 6x6) |
| Bullet (poison) | 1.3 | 1.5 | 9px |
| Bullet (mega) | 2.5 | 2.5 (保持) | 15px |
| Boomerang | 1.5 | 1.5 (保持) | 9px |
| Scythe | 2.5 | 2.5 (保持) | 15px |
| Soul reaper | 3.0 | 3.0 (保持) | 18px |
| Fireball orb | 1.8 | 1.5 | 24px (改 16x16 base) |
| Hellfire orb | 2.0 | 1.5 | 24px (改 16x16 base) |
| Sun storm orb | 2.5 | 2.0 | 32px (改 16x16 base) |
| Pickup | 1.5 | 1.5 (保持) | 24px |

```typescript
// enemies.ts — 修正所有 scale 为半整数倍
export const ENEMIES: Record<string, EnemyData> = {
  slime:    { ..., scale: 1.5, ... },
  bat:      { ..., scale: 1.0, ... },
  goblin:   { ..., scale: 1.5, ... },
  skeleton: { ..., scale: 1.5, ... },
  orc:      { ..., scale: 2.0, ... },
  ghost:    { ..., scale: 1.5, ... },
  demon:    { ..., scale: 2.5, ... },
};
```

```typescript
// Bullet.ts — 构造函数中
this.setScale(1.5); // 原为 1.2
```

**理由：** 像素风游戏在缩放为整数或 .5 时，像素边缘锐利；非整数缩放导致双线性插值模糊。这对 16x16 的低分辨率素材尤其明显。

---

### CRITICAL-3: 技能栏图标缩放基准错误导致显示不完整

**问题描述：**
HUD 技能栏中，图标缩放计算为 `iconScale = slotSize / 20`（HUD.ts 第 190 行）。但实际图标素材全部是 16x16。这意味着当 slotSize=40（标准值）时，iconScale = 2.0，图标被渲染为 32x32——看似合理，但图标设计时边距基于 16px 画布，放大 2 倍后有效图案区域（通常约 12px 宽）在 40px 槽位中显得偏小且不居中。

更关键的问题：默认图标 fallback 使用 `'item_pickup'` 素材（一个菱形宝石），这是 16x16 的拾取物精灵，不是技能图标。如果 `getItemIconKey()` 返回 null 或纹理不存在，显示的是拾取物宝石而非空槽位。

**当前代码位置：**
- `src/ui/HUD.ts` 第 190-192 行

**建议修改方案：**

```typescript
// HUD.ts — createSkillSlot() 中
private createSkillSlot(x: number, y: number, slotSize: number, scale: number) {
  const bg = this.scene.add.rectangle(x, y, slotSize, slotSize, 0x222244)
    .setStrokeStyle(2, 0x444466).setDepth(51).setScrollFactor(0);

  const catBg = this.scene.add.rectangle(x + 2, y + 2, slotSize - 4, slotSize - 4, 0x333355)
    .setDepth(51.5).setScrollFactor(0).setVisible(false);

  // 修正: 图标是 16x16，需要填满 slotSize 的 80%（留 10% 内边距）
  const iconScale = (slotSize * 0.8) / 16; // 改为基于 16px 基准
  const image = this.scene.add.image(x + slotSize / 2, y + slotSize / 2, 'icon_basic_shot')
    .setScale(iconScale).setDepth(52).setScrollFactor(0).setVisible(false);

  // ... level text 不变
}
```

同时，将默认纹理从 `'item_pickup'` 改为一个实际存在的图标 key（如 `'icon_basic_shot'`），因为 image 创建时需要有效纹理。

---

### HIGH-1: 缺少全局 UI 设计 Token 系统

**问题描述：**
每个场景独立计算字体大小、间距、颜色，使用不同的公式：
- MenuScene: `Math.max(28, Math.min(48, Math.round(width * 0.06)))`
- ShopScene: `Math.max(24, Math.min(36, Math.round(width * 0.045)))`
- GameOverScene: `Math.max(24, Math.min(36, Math.round(width * 0.045)))`
- HUD: `Math.max(12, Math.round(14 * scale))`

颜色也是硬编码在各处：`'#ffdd44'` 出现 10+ 次，`'#44ddff'` 出现 8+ 次，`'#0a0a1a'` 作为背景出现 4 次。

**建议修改方案：**

创建 `src/ui/UITheme.ts`：

```typescript
// src/ui/UITheme.ts
/** Global UI design tokens — single source of truth */
export const UITheme = {
  // Colors
  color: {
    bg: '#0a0a1a',
    bgMenu: '#1a1a2e',
    textPrimary: '#ddddee',
    textSecondary: '#8888aa',
    textMuted: '#666688',
    accent: {
      gold: '#ffdd44',
      cyan: '#44ddff',
      green: '#44ff88',
      orange: '#ffaa44',
      red: '#ff3344',
    },
    category: {
      weapon: { bg: 0x663311, border: 0xff8844, text: '#ff8844' },
      augment: { bg: 0x113355, border: 0x44eeff, text: '#44eeff' },
      defense: { bg: 0x115533, border: 0x44ff88, text: '#44ff88' },
    },
    slot: {
      bg: 0x222244,
      border: 0x444466,
      barBg: 0x111122,
    },
  },

  // Typography (based on screen width)
  font(w: number, h: number) {
    const scale = Math.min(w / 800, h / 600);
    return {
      title: Math.max(24, Math.min(36, Math.round(w * 0.045))),
      heading: Math.max(18, Math.min(24, Math.round(w * 0.03))),
      body: Math.max(12, Math.round(14 * scale)),
      small: Math.max(9, Math.round(11 * scale)),
      button: Math.max(14, Math.min(20, Math.round(w * 0.025))),
      family: 'monospace',
    };
  },

  // Spacing (based on screen size)
  spacing(w: number, h: number) {
    const scale = Math.min(w / 800, h / 600);
    return {
      pad: Math.round(12 * scale),
      gap: Math.round(5 * scale),
      slotSize: Math.round(40 * scale),
    };
  },
} as const;
```

然后在所有场景中引用此 token。这是重构级改动，建议分步实施，优先统一颜色。

---

### HIGH-2: 技能拾取缺乏视觉反馈

**问题描述：**
当玩家拾取技能时，代码仅调用 `combatFeedback.levelUpFlash()` 和 `levelUpRing()`，视觉表现为一个白色闪光和一个黄色扩散圆环。这对于 roguelike 中最重要的时刻——获得新能力——远远不够。

当前缺少：
- 新技能图标出现在技能栏的动画（无 pop-in 效果）
- 技能名称/描述的浮动提示（仅有 showMessage 文字）
- 技能栏新增槽位时的扩展动画
- 技能图标的初始高亮闪烁

**当前代码位置：**
- `src/scenes/GameScene.ts` 第 586-593 行（onPlayerPickup 中 item 分支）
- `src/systems/CombatFeedbackSystem.ts` 第 117-131 行
- `src/ui/HUD.ts` 更新逻辑中无新增检测

**建议修改方案：**

```typescript
// CombatFeedbackSystem.ts — 新增方法
/** Skill acquired — dramatic reveal effect */
skillAcquired(x: number, y: number, skillName: string, color: string) {
  // 1. Starburst particles
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const particle = this.scene.add.rectangle(x, y, 4, 4, parseInt(color.replace('#', ''), 16))
      .setDepth(100);
    this.scene.tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * 40,
      y: y + Math.sin(angle) * 40,
      alpha: 0,
      duration: 400,
      onComplete: () => { if (particle.active) particle.destroy(); },
    });
  }

  // 2. Floating skill name
  const nameText = this.scene.add.text(x, y - 20, skillName, {
    fontSize: '14px', color, fontFamily: 'monospace', fontStyle: 'bold',
    stroke: '#000', strokeThickness: 3,
  }).setOrigin(0.5).setDepth(200).setScrollFactor(1);
  this.scene.tweens.add({
    targets: nameText,
    y: y - 60, alpha: 0,
    duration: 1200,
    onComplete: () => { if (nameText.active) nameText.destroy(); },
  });
}
```

在 HUD 中检测新技能并添加 pop-in 动画：

```typescript
// HUD.ts — update() 中，检测新技能
private lastSkillCount = 0;

update(player: Player, scoreSystem: ScoreSystem, waveSystem: WaveSystem, time: number) {
  // ... 现有代码 ...

  // 检测新技能 — 弹跳动画
  for (let i = this.lastSkillCount; i < player.skills.length; i++) {
    const slot = this.skillIcons[i];
    if (slot) {
      slot.image.setScale(0);
      this.scene.tweens.add({
        targets: slot.image,
        scaleX: this.iconScale, scaleY: this.iconScale,
        duration: 300, ease: 'Back.easeOut',
      });
    }
  }
  this.lastSkillCount = player.skills.length;
}
```

---

### HIGH-3: 按钮缺少 press（按下）状态反馈

**问题描述：**
所有可交互文本按钮（MenuScene、ShopScene、GameOverScene、LeaderboardScene）只实现了 `pointerover` 和 `pointerout` 事件处理。没有 `pointerdown` 视觉反馈——按钮在按下时不会缩小或变色。这在触摸设备上尤其影响体验，因为触摸没有 hover 状态，用户只有按下时的反馈，但当前按下瞬间按钮外观不变。

**当前代码位置：**
所有场景的按钮交互模式相同，示例：
- `src/scenes/MenuScene.ts` 第 41-45 行
- `src/scenes/ShopScene.ts` 第 137-141 行

**建议修改方案：**

创建按钮工厂函数，统一处理所有按钮交互状态：

```typescript
// src/ui/ButtonFactory.ts
import Phaser from 'phaser';

export function createTextButton(
  scene: Phaser.Scene,
  x: number, y: number,
  text: string,
  config: {
    fontSize: string; color: string; hoverColor: string;
    pressColor: string; bgColor?: string;
    padding?: { x: number; y: number };
  },
  onClick: () => void,
): Phaser.GameObjects.Text {
  const btn = scene.add.text(x, y, text, {
    fontSize: config.fontSize,
    color: config.color,
    fontFamily: 'monospace',
    backgroundColor: config.bgColor || '#22224488',
    padding: config.padding || { x: 14, y: 8 },
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });

  btn.on('pointerover', () => {
    btn.setColor(config.hoverColor);
    btn.setScale(1.05);
  });
  btn.on('pointerout', () => {
    btn.setColor(config.color);
    btn.setScale(1.0);
  });
  btn.on('pointerdown', () => {
    btn.setColor(config.pressColor);
    btn.setScale(0.95); // 按下缩小
  });
  btn.on('pointerup', () => {
    btn.setColor(config.hoverColor);
    btn.setScale(1.05);
    onClick();
  });

  return btn;
}
```

使用示例：
```typescript
// MenuScene.ts
createTextButton(this, width / 2, height * 0.5, '[ 开始游戏 ]', {
  fontSize: `${btnSize}px`,
  color: '#44ddff',
  hoverColor: '#88eeff',
  pressColor: '#22aacc',
}, () => this.scene.start('GameScene'));
```

---

### HIGH-4: 商店 UI 信息层次不清晰

**问题描述：**
ShopScene 中升级列表的信息密度高但层次模糊：
1. 名称、等级、描述、购买按钮全部用同一字号范围（11-14px），缺乏视觉权重层次
2. 购买按钮 `[ 100G ]` 用文本模拟，没有真正的按钮形状，在小屏幕上触摸目标偏小
3. 已购买和可购买的区分仅靠文字颜色（`#666688` vs `#ddddee`），不够明显
4. 没有升级效果的预览（+10% -> +20% 的增量提示）

**当前代码位置：**
- `src/scenes/ShopScene.ts` 第 60-145 行

**建议修改方案：**

1. 增加已购买行的视觉遮罩效果：
```typescript
// ShopScene.ts — row bg 后添加半透明遮罩
if (maxed) {
  // 已满级：添加条纹遮罩
  const overlay = this.add.rectangle(
    leftX + maxWidth / 2, y + rowHeight / 2 - 4,
    maxWidth, rowHeight - 6, 0x000000, 0.4,
  ).setOrigin(0.5);
}
```

2. 为购买按钮添加更好的视觉区分：
```typescript
// 可购买 — 添加边框高亮
if (canBuy) {
  costBtn.setStyle({
    backgroundColor: '#22442288',
  });
  // 添加脉冲动画吸引注意
  this.tweens.add({
    targets: costBtn,
    alpha: 0.7,
    duration: 800,
    yoyo: true,
    repeat: -1,
  });
}
```

3. 添加升级增量预览：
```typescript
// 在 descText 下方添加增量提示
if (!maxed && level < def.maxLevel) {
  const nextLevelDef = def.levels?.[level]; // 需要数据支持
  this.add.text(leftX + 8, y + textSize + smallSize + 8,
    `下一级: +${def.increment}%`, {
    fontSize: `${Math.max(9, Math.round(width * 0.012))}px`,
    color: '#44ddff', fontFamily: 'monospace',
  });
}
```

---

### HIGH-5: HP 条缺乏视觉层次和低血量警告

**问题描述：**
HP 条是一个简单的红色矩形（`0xff3344`），没有：
- 高/中/低血量的颜色渐变（绿->黄->红）
- 低血量时的脉冲警告效果
- HP 变化时的平滑过渡动画（宽度是直接赋值）
- 受伤时的屏幕边缘红色光晕

**当前代码位置：**
- `src/ui/HUD.ts` 第 126-134 行（构造），第 228-234 行（更新）

**建议修改方案：**

```typescript
// HUD.ts — update() 中替换 HP bar 颜色逻辑
const hpRatio = player.hp / player.maxHp;
const scale = Math.min(this.sw / 800, this.sh / 600);
const hpBarW = Math.round(150 * scale);

// 颜色插值：绿 -> 黄 -> 红
let hpColor: number;
if (hpRatio > 0.6) {
  hpColor = 0x44ff66; // 绿
} else if (hpRatio > 0.3) {
  hpColor = 0xffdd44; // 黄
} else {
  hpColor = 0xff3344; // 红
}
this.hpBar.setFillStyle(hpColor);

// 低血量脉冲
if (hpRatio < 0.3) {
  const pulse = Math.sin(time / 200) * 0.3 + 0.7;
  this.hpBar.setAlpha(pulse);
} else {
  this.hpBar.setAlpha(1);
}

// 平滑过渡（使用 tween 而非直接赋值）
const targetWidth = hpBarW * hpRatio;
if (Math.abs(this.hpBar.width - targetWidth) > 1) {
  // 直接设值更简单可靠，tween 在高频 update 中不合适
  this.hpBar.width = targetWidth;
}
```

---

### HIGH-6: GameOver 场景的 HTML input 元素与游戏像素风不一致

**问题描述：**
GameOverScene 使用原生 HTML `<input>` 元素输入名字（第 66-77 行）。该 input 有圆角 (`border-radius: 6px`)、现代字体渲染、和固定的 2px 实线边框，与游戏其他部分的像素风 monospace 文本视觉冲突。

**当前代码位置：**
- `src/scenes/GameOverScene.ts` 第 56-78 行

**建议修改方案：**

短期方案（保持 HTML input，但调整样式使其融入）：

```typescript
// GameOverScene.ts — input 样式修改
this.nameInput.style.cssText = `
  position: fixed; left: 50%; top: ${inputY}px; transform: translateX(-50%);
  width: ${inputW}px; padding: 8px 12px; font-size: ${inputFontSize}; text-align: center;
  font-family: monospace; background: #222233; color: #fff;
  border: 2px solid #ffdd44; border-radius: 0px; outline: none; z-index: 100;
  box-shadow: 0 0 0 2px #000000, 0 0 10px #ffdd4444;
  ${isMobile ? 'padding: 10px 14px; font-size: 20px;' : ''}
`;
```

中期方案：使用 Phaser 内置 Text + 键盘事件实现自定义输入，完全避免 HTML 元素。这更复杂但视觉一致性更好。

---

### MEDIUM-1: 消息系统位置和样式与 HUD 信息重叠

**问题描述：**
GameScene 的消息系统（showMessage）在屏幕顶部居中（y=60），使用 `setScrollFactor(0)` 固定在屏幕上。但 HUD 的 HP 条和分数等也在左上角（y=12 开始）。当消息出现时，它们占据屏幕中心上方区域，可能遮挡游戏视野。

消息样式（黄底黑字 backgroundColor: '#000000aa'）与 HUD 文本风格（无背景）不一致。

**当前代码位置：**
- `src/scenes/GameScene.ts` 第 630-646 行（showMessage）
- 第 142-145 行（messageText 初始化）

**建议修改方案：**

将消息位置上移至 HUD 元素上方，或改为 HUD 下方：

```typescript
// GameScene.ts — showMessage
showMessage(text: string, duration: number) {
  const fontSize = Math.max(13, Math.min(16, Math.round(this.scale.width * 0.02)));
  const msgText = this.add.text(this.scale.width / 2, 30, text, {  // 改为 y=30
    fontSize: `${fontSize}px`, color: '#ffdd44', fontFamily: 'monospace',
    backgroundColor: '#000000cc', padding: { x: 8, y: 3 },
    stroke: '#000', strokeThickness: 1,
  }).setOrigin(0.5, 0).setDepth(200).setScrollFactor(0).setAlpha(1);
  // ...
}
```

---

### MEDIUM-2: 技能栏在技能数量多时可能超出屏幕宽度

**问题描述：**
当玩家通过融合获得超过 5 个技能时，HUD 会动态扩展技能栏（HUD.ts 第 213-226 行）。但如果屏幕较小（手机竖屏）且技能数量多（7-8 个），技能栏宽度可能超出屏幕。

当前代码 `skillBarX = this.sw / 2 - skillBarW / 2` 会在宽度超出时导致负坐标，技能栏会部分不可见。

**当前代码位置：**
- `src/ui/HUD.ts` 第 159-181 行，第 212-226 行

**建议修改方案：**

```typescript
// HUD.ts — 扩展技能栏时添加缩放适配
if (neededSlots > this.maxSlots) {
  // ... 创建新槽位 ...

  this.maxSlots = neededSlots;
  const newBarW = this.maxSlots * (this.slotSize + this.slotGap) + this.slotGap;

  // 如果超出屏幕宽度 90%，缩小 slotSize
  const maxWidth = this.sw * 0.9;
  if (newBarW > maxWidth) {
    const shrinkRatio = maxWidth / newBarW;
    this.slotSize = Math.round(this.slotSize * shrinkRatio);
    // 重新计算所有槽位位置和图标缩放
    this.relayoutSkillBar();
  } else {
    this.skillBarBg.width = newBarW;
    this.skillBarBg.x = this.sw / 2 - newBarW / 2;
  }
}
```

---

### MEDIUM-3: 排行榜布局使用百分比定位，列间距不均匀

**问题描述：**
LeaderboardScene 使用固定百分比 colX = [0.10, 0.28, 0.52, 0.68, 0.82] 来定位列。这导致：
- "排名"列过窄（1-2 字符在 10% 宽度内）
- "名字"列过宽（但 maxLength=10 的中文名字实际占用小）
- 分数/击杀/波次列间距不一致

**当前代码位置：**
- `src/scenes/LeaderboardScene.ts` 第 24 行

**建议修改方案：**

```typescript
// LeaderboardScene.ts — 使用更均匀的列布局
const colX = [0.08, 0.20, 0.40, 0.60, 0.78];
// 或使用等宽字体 + 固定像素偏移
const leftMargin = width * 0.08;
const colOffsets = [0, width * 0.14, width * 0.34, width * 0.54, width * 0.72];
headers.forEach((h, i) => {
  this.add.text(leftMargin + colOffsets[i], headerY, h, { ... });
});
```

---

### MEDIUM-4: 虚拟摇杆在桌面端完全隐藏但触摸仍可用

**问题描述：**
VirtualJoystick 在桌面端 (`!isMobile`) 通过 `setAlpha(0)` 隐藏摇杆（第 60-63 行），但触摸输入逻辑仍然绑定。这意味着桌面端用户如果触摸屏幕，摇杆会激活但不可见——虽然这是边缘情况，但可能导致困惑。

更好的做法是桌面端同时显示摇杆（低透明度），或完全禁用触摸输入。

**当前代码位置：**
- `src/ui/VirtualJoystick.ts` 第 59-63 行

**建议修改方案：**

```typescript
// VirtualJoystick.ts — 桌面端显示半透明摇杆而非完全隐藏
if (!this.isMobile) {
  this.ring.setAlpha(0.08);
  this.base.setAlpha(0.15);
  this.thumb.setAlpha(0.25);
}
```

---

### MEDIUM-5: 商店没有返回游戏/开始游戏按钮路径

**问题描述：**
ShopScene 的返回按钮直接跳转到 MenuScene（第 173 行），这意味着从主菜单进入商店后，玩家无法从商店直接开始游戏——必须先回到主菜单再点开始。这是 UX 多余步骤。

虽然当前流程合理（商店是主菜单的子页面），但建议增加直接开始按钮。

**当前代码位置：**
- `src/scenes/ShopScene.ts` 第 162-174 行

**建议修改方案：**

```typescript
// ShopScene.ts — 添加开始游戏按钮
const startBtn = this.add.text(width / 2, height * 0.88, '[ 开始游戏 ]', {
  fontSize: `${btnSize}px`,
  color: '#44ff88',
  fontFamily: 'monospace',
  backgroundColor: '#22442266',
  padding: { x: 14, y: 8 },
}).setOrigin(0.5).setInteractive({ useHandCursor: true });

startBtn.on('pointerover', () => startBtn.setColor('#88ffbb'));
startBtn.on('pointerout', () => startBtn.setColor('#44ff88'));
startBtn.on('pointerdown', () => {
  this.scene.start('GameScene');
});

// 返回按钮下移到 0.94
const backBtn = this.add.text(width / 2, height * 0.94, '[ 返回主菜单 ]', {
  // ... 不变
});
```

---

### MEDIUM-6: 技能图标缺少类型/稀有度视觉区分

**问题描述：**
技能栏中分类颜色（weapon=橙, augment=青, defense=绿）仅通过 `catBg` 矩形的填充色和槽位边框色区分。对于色觉障碍用户，这些颜色差异可能不够。同时，融合技能（稀有度更高）与基础技能之间没有视觉区分。

**当前代码位置：**
- `src/ui/HUD.ts` 第 247-272 行

**建议修改方案：**

为融合技能添加发光边框效果：
```typescript
// HUD.ts — update() 中，技能显示逻辑
const isFusion = FUSION_RECIPES.some(r => r.output === skill.id);
if (isFusion) {
  slot.bg.setStrokeStyle(2, 0xffdd44); // 金色边框表示融合
  // 添加脉冲发光
  const glowAlpha = 0.3 + Math.sin(time / 300) * 0.2;
  slot.bg.setAlpha(glowAlpha + 0.5);
} else {
  slot.bg.setStrokeStyle(2, CATEGORY_BORDER[cat]);
  slot.bg.setAlpha(1);
}
```

---

### MEDIUM-7: GameScene 的 messageText（初始）永远不会显示

**问题描述：**
GameScene 中第 142-145 行创建了一个 `this.messageText` 对象，但 `setVisible(false)` 且后续从未使用。实际的 showMessage 方法（第 630 行）创建了新的 Text 对象。这是一个无用的残留对象，占用内存。

**当前代码位置：**
- `src/scenes/GameScene.ts` 第 142-145 行

**建议修改方案：**

删除第 142-145 行。如果 messageText 在其他地方被引用，也需要清理。

```typescript
// 删除以下代码：
// this.messageText = this.add.text(this.scale.width / 2, 60, '', {
//   fontSize: '16px', color: '#ffdd44', fontFamily: 'monospace',
// }).setOrigin(0.5, 0).setDepth(200).setScrollFactor(0).setVisible(false);
```

---

### LOW-1: 主菜单缺少动态元素/视觉吸引力

**问题描述：**
MenuScene 是纯静态的——只有文字按钮，没有任何动画、粒子效果或装饰性元素。作为玩家进入游戏的第一个画面，这给人"简陋"的第一印象。

**当前代码位置：**
- `src/scenes/MenuScene.ts` 全文

**建议修改方案：**

添加简单的装饰元素：
```typescript
// MenuScene.ts — create() 末尾添加
// 1. 背景粒子（随机漂浮像素点）
for (let i = 0; i < 20; i++) {
  const px = Phaser.Math.Between(0, width);
  const py = Phaser.Math.Between(0, height);
  const dot = this.add.rectangle(px, py, 2, 2, 0xffdd44, 0.2).setDepth(0);
  this.tweens.add({
    targets: dot,
    y: py - 50 - Math.random() * 100,
    alpha: 0,
    duration: 3000 + Math.random() * 4000,
    repeat: -1,
    onRepeat: () => {
      dot.setPosition(Phaser.Math.Between(0, width), height + 10);
      dot.setAlpha(0.2);
    },
  });
}

// 2. 标题浮动动画
const title = this.add.text(width / 2, height * 0.2, '像素地牢', { ... });
this.tweens.add({
  targets: title, y: height * 0.2 - 5,
  duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
});
```

---

### LOW-2: 游戏画面中没有小地图/雷达

**问题描述：**
地牢是 60x45 格的大地图，玩家通过摄像机跟随只能看到周围区域。没有全局地图或迷你雷达帮助玩家了解自己在地牢中的位置、未探索区域、或敌人分布方向。

对于 roguelike 来说这是可选功能，但会显著改善导航体验。

**建议修改方案（如果实施）：**

在 HUD 右上角添加一个简单的小地图，用色块表示已探索区域和敌人位置。这是一个较大的功能添加，建议在核心 UI 问题修复后再考虑。

---

### LOW-3: 没有暂停菜单

**问题描述：**
游戏中没有暂停功能（ESC/P 键）。在移动端也没有暂停按钮。玩家无法在游戏中暂停查看状态或调整设置。

**建议修改方案：**

在 GameScene 中添加 ESC 键监听和暂停 overlay：
```typescript
// GameScene.ts — setupKeyboard() 中
if (this.input.keyboard) {
  // ... 现有 WASD 代码 ...
  const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  escKey.on('down', () => this.togglePause());
}
```

---

### LOW-4: 波次提示信息缺乏紧迫感

**问题描述：**
波次开始提示 `第 X 波开始!` 是纯文本 showMessage，没有视觉冲击力。对于 rougelike 的节奏感，波次切换是关键节奏点，应该有更明显的视觉和动画表现。

**当前代码位置：**
- `src/scenes/GameScene.ts` 第 148 行

**建议修改方案：**

```typescript
// GameScene.ts — 波次开始效果增强
this.waveSystem.onWaveStart = (wave: number) => {
  // 大字波次提示
  const waveText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 30,
    `第 ${wave} 波`, {
    fontSize: '28px', color: '#ffdd44', fontFamily: 'monospace', fontStyle: 'bold',
    stroke: '#000', strokeThickness: 4,
  }).setOrigin(0.5).setDepth(300).setScrollFactor(0).setAlpha(0);

  this.tweens.add({
    targets: waveText,
    alpha: 1, y: this.scale.height / 2 - 50,
    duration: 300, ease: 'Back.easeOut',
    onComplete: () => {
      this.tweens.add({
        targets: waveText,
        alpha: 0, y: this.scale.height / 2 - 80,
        duration: 700, delay: 800,
        onComplete: () => waveText.destroy(),
      });
    },
  });

  this.dailyChallengeSystem.trackEvent('reach_wave', { wave });
};
```

---

### LOW-5: Damage number 字体大小不随缩放适配

**问题描述：**
CombatFeedbackSystem 中伤害数字使用固定字体大小（crit: 16px, normal: 12px），不随屏幕尺寸缩放。在小屏幕设备上这些数字可能显得过大，在大屏幕上偏小。

**当前代码位置：**
- `src/systems/CombatFeedbackSystem.ts` 第 43 行

**建议修改方案：**

```typescript
// CombatFeedbackSystem.ts — 构造函数中计算缩放字体
private scaledFontSize: { normal: number; crit: number };

constructor(scene: Phaser.Scene) {
  this.scene = scene;
  this.camera = scene.cameras.main;
  const scale = Math.min(scene.scale.width / 800, scene.scale.height / 600);
  this.scaledFontSize = {
    normal: Math.max(10, Math.round(12 * scale)),
    crit: Math.max(14, Math.round(16 * scale)),
  };
}

// showDamage() 中使用
const fontSize = crit ? this.scaledFontSize.crit : this.scaledFontSize.normal;
```

---

## 总体设计方向建议

### 1. 建立像素风视觉规范

**核心原则：所有 setScale 值必须是 0.5 的整数倍（1.0, 1.5, 2.0, 2.5, 3.0）。**

这确保了：
- 16x16 素材缩放后像素边缘锐利
- 视觉大小层级清晰可读
- 与 Phaser 的像素艺术模式 (`pixelArt: true`) 配合良好

**建议的大小层级：**
```
Tiny:   6x6 base  @ 1.0 = 6px   (bullet default)
Small:  16x16 base @ 1.0 = 16px (bat, small pickups)
Medium: 16x16 base @ 1.5 = 24px (player, standard enemies, pickups)
Large:  16x16 base @ 2.0 = 32px (orc, large effects, ultimate orbs)
XL:     16x16 base @ 2.5 = 40px (boss demon)
```

### 2. 建立颜色语义系统

当前颜色使用虽有大致规律但缺乏文档化。建议统一为：
- **Gold (#ffdd44)** — 分数、标题、成就反馈、融合标识
- **Cyan (#44ddff)** — 导航/交互元素（按钮、波次计时器、水系）
- **Green (#44ff88)** — 生命、治疗、防御系、积极状态
- **Orange (#ff8844)** — 武器系、伤害、火系
- **Red (#ff3344)** — 危险、低血量、暗系
- **Purple (#cc44ff)** — 特殊/终极、暗系、灵魂系
- **Muted Gray (#8888aa)** — 次要信息、标签

### 3. 实施优先级

| 阶段 | 内容 | 预估工时 |
|------|------|---------|
| Phase 1 — 立即修复 | CRITICAL 1-3（orbit 缩放、像素风规范、技能栏图标） | 2-3h |
| Phase 2 — 核心体验 | HIGH 1-6（UI token、拾取反馈、按钮状态、HP条、商店、input样式） | 4-6h |
| Phase 3 — 润色 | MEDIUM 1-7（消息、技能栏溢出、排行榜、摇杆、融合标识、清理） | 3-4h |
| Phase 4 — 加分项 | LOW 1-5（菜单动效、小地图、暂停、波次特效、缩放适配） | 3-5h |

### 4. 全局像素风 checklist

每次添加新视觉元素时检查：
- [ ] 原始素材是否为偶数尺寸（16x16, 12x12, 8x8, 6x6）？
- [ ] setScale 是否为 0.5 的整数倍？
- [ ] 最终渲染尺寸是否在大小层级表中有明确位置？
- [ ] 颜色是否使用了语义色板而非随机 hex？
- [ ] 字体大小是否通过 UITheme token 计算？

---

## 附录：当前精灵缩放全景图

| 实体 | 素材尺寸 | Scale | 最终渲染尺寸 | 是否合规 |
|------|---------|-------|------------|---------|
| Player | 16x16 | 1.5 | 24x24 | Yes |
| Slime | 16x16 | 1.4 | 22.4x22.4 | NO |
| Bat | 16x16 | 1.2 | 19.2x19.2 | NO |
| Goblin | 16x16 | 1.4 | 22.4x22.4 | NO |
| Skeleton | 16x16 | 1.4 | 22.4x22.4 | NO |
| Orc | 16x16 | 1.8 | 28.8x28.8 | NO |
| Ghost | 16x16 | 1.5 | 24x24 | Yes |
| Demon | 16x16 | 2.2 | 35.2x35.2 | NO |
| Bullet (default) | 6x6 | 1.2 | 7.2x7.2 | NO |
| Bullet (mega) | 6x6 | 2.5 | 15x15 | Yes |
| Bullet (poison) | 6x6 | 1.3 | 7.8x7.8 | NO |
| Boomerang | 6x6 | 1.5 | 9x9 | Yes |
| Death Wheel | 6x6 | 2.0 | 12x12 | Yes |
| Scythe | 6x6 | 2.5 | 15x15 | Yes |
| Soul Reaper | 6x6 | 3.0 | 18x18 | Yes |
| Fireball Orb | 12x12 | 1.8 | 21.6x21.6 | NO |
| Hellfire Orb | 12x12 | 2.0 | 24x24 | Yes |
| Sun Storm Orb | 12x12 | 2.5 | 30x30 | Yes |
| Tracking FB Orb | 12x12 | 1.6 | 19.2x19.2 | NO |
| Item Pickup | 16x16 | 1.5 | 24x24 | Yes |
| Potion | 16x16 | 1.5 | 24x24 | Yes |
| Fragment | 12x12 | 1.5 | 18x18 | Yes |
| Shield Orb | (circle r=8) | - | 16px diameter | N/A |

**合规率：10/22 (45%)**
