import { ItemRarity, ALL_ITEMS } from '../data/items';
import { FRAGMENT_DEFS, FRAGMENT_STORAGE_KEY, UNLOCK_STORAGE_KEY, getFragmentRarityForWave } from '../data/fragments';

export class FragmentSystem {
  private fragments: Record<string, number>;
  private unlockedItems: Set<string>;

  constructor() {
    this.fragments = this.loadFragments();
    this.unlockedItems = this.loadUnlocked();
  }

  /** Get all fragment counts */
  getFragments(): Record<string, number> {
    return { ...this.fragments };
  }

  /** Add one fragment of a given rarity */
  addFragment(rarity: ItemRarity): void {
    if (!this.fragments[rarity]) {
      this.fragments[rarity] = 0;
    }
    this.fragments[rarity]++;
    this.saveFragments();
  }

  /** Check if enough fragments to unlock a specific item */
  canUnlock(itemId: string): boolean {
    const def = ALL_ITEMS[itemId];
    if (!def) return false;
    if (!def.locked) return false;
    if (this.unlockedItems.has(itemId)) return false;

    const fragmentDef = FRAGMENT_DEFS[def.rarity];
    if (!fragmentDef) return false;

    const owned = this.fragments[def.rarity] || 0;
    return owned >= fragmentDef.requiredToUnlock;
  }

  /** Spend fragments to unlock an item */
  unlock(itemId: string): boolean {
    if (!this.canUnlock(itemId)) return false;

    const def = ALL_ITEMS[itemId];
    if (!def) return false;

    const fragmentDef = FRAGMENT_DEFS[def.rarity];
    this.fragments[def.rarity] -= fragmentDef.requiredToUnlock;
    if (this.fragments[def.rarity] < 0) this.fragments[def.rarity] = 0;

    this.unlockedItems.add(itemId);
    this.saveFragments();
    this.saveUnlocked();
    return true;
  }

  /** Get the set of unlocked item IDs */
  getUnlockedItems(): Set<string> {
    return new Set(this.unlockedItems);
  }

  /** Decide if a fragment should drop at a given wave */
  shouldDropFragment(wave: number): boolean {
    const rarity = getFragmentRarityForWave(wave);
    if (!rarity) return false;
    const def = FRAGMENT_DEFS[rarity];
    return Math.random() < def.dropRate;
  }

  /** Get fragment rarity for a given wave (or null) */
  getFragmentRarityForWave(wave: number): ItemRarity | null {
    return getFragmentRarityForWave(wave);
  }

  // ── Persistence ──────────────────────────────────

  private loadFragments(): Record<string, number> {
    try {
      const raw = localStorage.getItem(FRAGMENT_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return {};
  }

  private saveFragments(): void {
    try {
      localStorage.setItem(FRAGMENT_STORAGE_KEY, JSON.stringify(this.fragments));
    } catch { /* ignore */ }
  }

  private loadUnlocked(): Set<string> {
    try {
      const raw = localStorage.getItem(UNLOCK_STORAGE_KEY);
      if (raw) return new Set(JSON.parse(raw) as string[]);
    } catch { /* ignore */ }
    return new Set();
  }

  private saveUnlocked(): void {
    try {
      localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify([...this.unlockedItems]));
    } catch { /* ignore */ }
  }
}
