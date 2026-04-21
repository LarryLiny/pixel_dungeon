/**
 * StorySystem — 千兵库叙事系统
 * 碎片化叙事事件，在战斗中以短文本提示推进世界观
 * 每条叙事 ≤20 字，不中断游戏，每条只触发一次（跨存档持久化）
 */

const STORAGE_KEY = 'pixel_dungeon_story_seen';

interface StoryEvent {
  id: string;
  text: string;
  /** Trigger condition type */
  trigger: 'wave' | 'fusion' | 'legendary_fusion' | 'boss_kill' | 'enemy_first';
  /** Wave number for wave triggers, enemy key for enemy_first */
  condition?: number | string;
}

const STORY_EVENTS: StoryEvent[] = [
  // ── Wave milestones ──
  { id: 'w1',  text: '千兵库的大门在你身后关闭。', trigger: 'wave', condition: 1 },
  { id: 'w3',  text: '那些哥布林曾是这里的守卫。', trigger: 'wave', condition: 3 },
  { id: 'w5',  text: '远古封印……正在松动。', trigger: 'wave', condition: 5 },
  { id: 'w7',  text: '铸师的亡灵仍在巡逻。', trigger: 'wave', condition: 7 },
  { id: 'w10', text: '禁忌兵器在低语，它们渴望宿主。', trigger: 'wave', condition: 10 },
  { id: 'w13', text: '每把武器都封印着一段过往。', trigger: 'wave', condition: 13 },
  { id: 'w15', text: '你不再是试刃者——你是兵器的一部分。', trigger: 'wave', condition: 15 },
  { id: 'w18', text: '千兵库的深处，连光都在颤抖。', trigger: 'wave', condition: 18 },
  { id: 'w20', text: '千兵库以战养战，你便是它的养料。', trigger: 'wave', condition: 20 },
  { id: 'w25', text: '你听见了千兵库的心跳——它活着。', trigger: 'wave', condition: 25 },

  // ── Enemy first encounters ──
  { id: 'e_skeleton', text: '又一位试刃者的遗骸站了起来。', trigger: 'enemy_first', condition: 'skeleton' },
  { id: 'e_orc',      text: '铸造大师已被兵器反噬。', trigger: 'enemy_first', condition: 'orc' },
  { id: 'e_ghost',    text: '那是被遗忘的封印回响。', trigger: 'enemy_first', condition: 'ghost' },
  { id: 'e_demon',    text: '禁忌的意志凝聚成了实体。', trigger: 'enemy_first', condition: 'demon' },

  // ── Fusion events ──
  { id: 'fusion1', text: '两股力量共鸣——远古的禁忌苏醒了。', trigger: 'fusion' },

  // ── Legendary fusion ──
  { id: 'legendary1', text: '传说兵器重现人间，天地为之色变。', trigger: 'legendary_fusion' },

  // ── Boss kill ──
  { id: 'boss1', text: '远古意志被斩断，但封印不会愈合。', trigger: 'boss_kill' },
];

/** Game over narrative based on deepest wave reached */
export function getEndingText(wave: number): string {
  if (wave < 3)  return '千兵库的门槛，不是谁都能跨过。';
  if (wave < 5)  return '你触碰到了千兵库的边缘。';
  if (wave < 8)  return '你听见了封印裂开的声音，但还不够。';
  if (wave < 12) return '兵器的低语越来越清晰……';
  if (wave < 16) return '你与千兵库融为一体，只是片刻。';
  if (wave < 20) return '千兵库选中了你——但尚未认可。';
  return '你已触碰千兵库的核心——它记住了你的名字。';
}

export class StorySystem {
  private seen: Set<string>;

  constructor() {
    this.seen = new Set<string>();
    this.loadSeen();
  }

  /** Check and return narrative text for a wave milestone. Returns null if already seen or no event. */
  onWave(wave: number): string | null {
    return this.tryFire(
      STORY_EVENTS.find(e => e.trigger === 'wave' && e.condition === wave)
    );
  }

  /** Check and return narrative text for first encounter with enemy type */
  onEnemyFirst(enemyKey: string): string | null {
    return this.tryFire(
      STORY_EVENTS.find(e => e.trigger === 'enemy_first' && e.condition === enemyKey)
    );
  }

  /** Check and return narrative text for first fusion */
  onFusion(isLegendary: boolean): string | null {
    if (isLegendary) {
      return this.tryFire(
        STORY_EVENTS.find(e => e.trigger === 'legendary_fusion')
      );
    }
    return this.tryFire(
      STORY_EVENTS.find(e => e.trigger === 'fusion')
    );
  }

  /** Check and return narrative text for first boss kill */
  onBossKill(): string | null {
    return this.tryFire(
      STORY_EVENTS.find(e => e.trigger === 'boss_kill')
    );
  }

  /** Reset per-run state (call on new game) */
  resetRun() {
    // Seen events persist across runs via localStorage — do NOT reset
  }

  // ── Internal ──

  private tryFire(event: StoryEvent | undefined): string | null {
    if (!event || this.seen.has(event.id)) return null;
    this.seen.add(event.id);
    this.saveSeen();
    return event.text;
  }

  private loadSeen() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        arr.forEach(id => this.seen.add(id));
      }
    } catch {
      // Ignore corrupt data
    }
  }

  private saveSeen() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.seen]));
    } catch {
      // Ignore storage errors
    }
  }
}
