import {
  type ChallengeDifficulty,
  type ChallengeObjective,
  type ChallengeTemplate,
  type ObjectiveType,
  CHALLENGE_TEMPLATES,
} from '../data/dailyChallenges';

// ── Constants ────────────────────────────────────────────────

const STORAGE_KEY = 'dungeon_daily_challenge';
const WEAPON_IDS = [
  'basic_shot',
  'shotgun',
  'fireball_orbit',
  'boomerang',
  'lightning',
  'sword_slash',
  'ice_wave',
  'poison_snake',
  'laser_beam',
  'death_scythe',
] as const;

/** Rewards per difficulty tier */
const REWARDS: Record<ChallengeDifficulty, { fragments: number; gold: number }> = {
  easy:   { fragments: 1, gold: 200 },
  medium: { fragments: 3, gold: 500 },
  hard:   { fragments: 5, gold: 1000 },
};

// ── Types ────────────────────────────────────────────────────

interface ObjectiveProgress {
  type: ObjectiveType;
  params: Record<string, number>;
  current: number;
  target: number;
  failed: boolean;
}

interface ActiveChallenge {
  template: ChallengeTemplate;
  difficulty: ChallengeDifficulty;
  progress: ObjectiveProgress[];
  completed: boolean;
  rewardClaimed: boolean;
}

interface DailySaveData {
  date: string;                // YYYY-MM-DD
  challenges: ActiveChallenge[];
  tracking: TrackingState;
}

interface TrackingState {
  totalKills: number;
  /** kills per weapon id */
  killsByWeapon: Record<string, number>;
  currentWave: number;
  maxWaveReached: number;
  itemsCollected: number;
  /** whether the player has taken any damage this run */
  damageTaken: boolean;
  /** wave at which damage was first taken */
  damageTakenAtWave: number;
  /** whether the player used a potion this run */
  potionUsed: boolean;
  /** wave at which potion was first used */
  potionUsedAtWave: number;
  /** whether the player only has defense items equipped */
  defenseOnly: boolean;
}

// ── System ───────────────────────────────────────────────────

export class DailyChallengeSystem {
  private date: string;
  private challenges: ActiveChallenge[];
  private tracking: TrackingState;
  private dirty = false;

  constructor() {
    const today = DailyChallengeSystem.getTodayString();

    const saved = this.load();
    if (saved && saved.date === today) {
      // Same day — restore persisted state
      this.date = saved.date;
      this.challenges = saved.challenges;
      this.tracking = saved.tracking;
    } else {
      // New day or first launch — generate fresh challenges
      this.date = today;
      this.challenges = this.generateDailyChallenges(today);
      this.tracking = this.freshTracking();
      this.dirty = true;
      this.persist();
    }
  }

  // ── Public query API ─────────────────────────────────────

  /** Get today's three challenges (easy / medium / hard) */
  getDailyChallenges(): ActiveChallenge[] {
    return this.challenges;
  }

  /** Get the tracking state (for UI display) */
  getTrackingState(): Readonly<TrackingState> {
    return this.tracking;
  }

  /** Whether a specific challenge is completed */
  isChallengeCompleted(difficulty: ChallengeDifficulty): boolean {
    return this.findChallenge(difficulty)?.completed ?? false;
  }

  /** Whether the reward for a specific challenge has been claimed */
  isRewardClaimed(difficulty: ChallengeDifficulty): boolean {
    return this.findChallenge(difficulty)?.rewardClaimed ?? false;
  }

  // ── Event tracking (called from game systems) ────────────

  /**
   * Track an in-game event relevant to challenge objectives.
   *
   * Supported event types and their params:
   * - kill_enemy:       { weaponId?: number }  (index into WEAPON_IDS, omit for any weapon)
   * - reach_wave:       { wave: number }
   * - collect_item:     { count?: number }      (defaults to 1)
   * - take_damage:      { wave: number }
   * - use_potion:       { wave: number }
   * - set_defense_only: { value: 0 | 1 }
   */
  trackEvent(type: string, params: Record<string, number> = {}): void {
    const t = this.tracking;

    switch (type) {
      case 'kill_enemy': {
        t.totalKills++;
        if (params.weaponId !== undefined) {
          const weaponKey = WEAPON_IDS[params.weaponId] ?? `weapon_${params.weaponId}`;
          t.killsByWeapon[weaponKey] = (t.killsByWeapon[weaponKey] ?? 0) + 1;
        }
        break;
      }
      case 'reach_wave': {
        const wave = params.wave ?? 0;
        t.currentWave = wave;
        if (wave > t.maxWaveReached) {
          t.maxWaveReached = wave;
        }
        break;
      }
      case 'collect_item': {
        t.itemsCollected += params.count ?? 1;
        break;
      }
      case 'take_damage': {
        if (!t.damageTaken) {
          t.damageTaken = true;
          t.damageTakenAtWave = params.wave ?? t.currentWave;
        }
        break;
      }
      case 'use_potion': {
        if (!t.potionUsed) {
          t.potionUsed = true;
          t.potionUsedAtWave = params.wave ?? t.currentWave;
        }
        break;
      }
      case 'set_defense_only': {
        t.defenseOnly = params.value === 1;
        break;
      }
    }

    this.dirty = true;
  }

  // ── Completion check ─────────────────────────────────────

  /**
   * Evaluate all active challenges and mark completed ones.
   * Returns the list of newly completed difficulties.
   */
  checkCompletion(): ChallengeDifficulty[] {
    const newlyCompleted: ChallengeDifficulty[] = [];

    for (const challenge of this.challenges) {
      if (challenge.completed) continue;

      let allMet = true;
      for (const prog of challenge.progress) {
        this.syncProgress(prog);
        if (prog.failed || prog.current < prog.target) {
          allMet = false;
          break;
        }
      }

      if (allMet) {
        challenge.completed = true;
        newlyCompleted.push(challenge.difficulty);
        this.dirty = true;
      }
    }

    if (this.dirty) this.persist();
    return newlyCompleted;
  }

  // ── Reward claim ─────────────────────────────────────────

  /**
   * Claim the reward for a completed challenge.
   * Returns the reward amounts, or null if not eligible.
   */
  completeChallenge(difficulty: ChallengeDifficulty): { fragments: number; gold: number } | null {
    const challenge = this.findChallenge(difficulty);
    if (!challenge || !challenge.completed || challenge.rewardClaimed) return null;

    challenge.rewardClaimed = true;
    this.dirty = true;
    this.persist();

    return { ...REWARDS[difficulty] };
  }

  // ── Reset (new run within same day) ──────────────────────

  /**
   * Reset tracking state for a new game run.
   * Challenges themselves (template selection) stay the same for the day.
   */
  resetTracking(): void {
    this.tracking = this.freshTracking();
    // Reset per-challenge progress objects (but keep completed/rewardClaimed)
    for (const challenge of this.challenges) {
      if (!challenge.completed) {
        challenge.progress = this.buildProgress(challenge.template.objectives);
      }
    }
    this.dirty = true;
    this.persist();
  }

  // ── Force daily reset (for testing / midnight rollover) ──

  /**
   * Check if the day has rolled over and, if so, regenerate challenges.
   * Call this periodically (e.g. on scene wake) to handle midnight reset.
   */
  checkDayRollover(): boolean {
    const today = DailyChallengeSystem.getTodayString();
    if (today !== this.date) {
      this.date = today;
      this.challenges = this.generateDailyChallenges(today);
      this.tracking = this.freshTracking();
      this.dirty = true;
      this.persist();
      return true;
    }
    return false;
  }

  // ── Private helpers ──────────────────────────────────────

  private findChallenge(difficulty: ChallengeDifficulty): ActiveChallenge | undefined {
    return this.challenges.find(c => c.difficulty === difficulty);
  }

  /**
   * Sync an ObjectiveProgress against the current tracking state.
   * Sets `current` and `failed` appropriately.
   */
  private syncProgress(prog: ObjectiveProgress): void {
    const t = this.tracking;

    switch (prog.type) {
      case 'kill_enemies': {
        prog.current = t.totalKills;
        break;
      }
      case 'kill_with_weapon': {
        const weaponKey = WEAPON_IDS[prog.params.weaponId] ?? `weapon_${prog.params.weaponId}`;
        prog.current = t.killsByWeapon[weaponKey] ?? 0;
        break;
      }
      case 'survive_wave': {
        prog.current = t.maxWaveReached;
        break;
      }
      case 'no_damage_taken': {
        const targetWave = prog.params.wave;
        if (t.damageTaken && t.damageTakenAtWave <= targetWave) {
          prog.failed = true;
        }
        // "Current" for display: how many waves cleared without damage
        prog.current = t.damageTaken
          ? Math.min(t.damageTakenAtWave - 1, t.maxWaveReached)
          : t.maxWaveReached;
        break;
      }
      case 'collect_items': {
        prog.current = t.itemsCollected;
        break;
      }
      case 'no_potion': {
        const targetWave = prog.params.wave;
        if (t.potionUsed && t.potionUsedAtWave <= targetWave) {
          prog.failed = true;
        }
        // Current for display: waves survived without potion
        prog.current = t.potionUsed
          ? Math.min(t.potionUsedAtWave - 1, t.maxWaveReached)
          : t.maxWaveReached;
        break;
      }
      case 'defense_only': {
        prog.current = t.defenseOnly ? t.maxWaveReached : 0;
        if (!t.defenseOnly) {
          prog.failed = true;
        }
        break;
      }
    }
  }

  // ── Challenge generation with seeded randomness ──────────

  /**
   * Generate today's challenges: 1 easy + 1 medium + 1 hard.
   * Uses the date string as a seed so all players see the same set.
   */
  private generateDailyChallenges(dateSeed: string): ActiveChallenge[] {
    const seed = DailyChallengeSystem.dateToSeed(dateSeed);
    const result: ActiveChallenge[] = [];

    const difficulties: ChallengeDifficulty[] = ['easy', 'medium', 'hard'];
    for (let i = 0; i < difficulties.length; i++) {
      const diff = difficulties[i];
      const pool = CHALLENGE_TEMPLATES[diff];
      const idx = DailyChallengeSystem.seededRandom(seed + i) % pool.length;
      const template = pool[idx];

      result.push({
        template,
        difficulty: diff,
        progress: this.buildProgress(template.objectives),
        completed: false,
        rewardClaimed: false,
      });
    }

    return result;
  }

  private buildProgress(objectives: ChallengeObjective[]): ObjectiveProgress[] {
    return objectives.map(obj => ({
      type: obj.type,
      params: { ...obj.params },
      current: 0,
      target: obj.params.count ?? obj.params.wave ?? 0,
      failed: false,
    }));
  }

  private freshTracking(): TrackingState {
    return {
      totalKills: 0,
      killsByWeapon: {},
      currentWave: 0,
      maxWaveReached: 0,
      itemsCollected: 0,
      damageTaken: false,
      damageTakenAtWave: 0,
      potionUsed: false,
      potionUsedAtWave: 0,
      defenseOnly: false,
    };
  }

  // ── Seeded PRNG ──────────────────────────────────────────

  /** Convert a YYYY-MM-DD date string to a numeric seed */
  private static dateToSeed(date: string): number {
    let hash = 0;
    for (let i = 0; i < date.length; i++) {
      const ch = date.charCodeAt(i);
      hash = ((hash << 5) - hash + ch) | 0;
    }
    return Math.abs(hash);
  }

  /**
   * Simple seeded pseudo-random number generator (LCG).
   * Returns a non-negative integer.
   */
  private static seededRandom(seed: number): number {
    // LCG constants (glibc)
    const a = 1103515245;
    const c = 12345;
    const m = 0x80000000; // 2^31
    return (a * seed + c) % m;
  }

  // ── Persistence ──────────────────────────────────────────

  static getTodayString(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private load(): DailySaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as DailySaveData;
    } catch {
      return null;
    }
  }

  private persist(): void {
    if (!this.dirty) return;
    try {
      const data: DailySaveData = {
        date: this.date,
        challenges: this.challenges,
        tracking: this.tracking,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.dirty = false;
    } catch {
      // Storage full or unavailable — silently degrade
    }
  }
}
