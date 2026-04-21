import { UPGRADES, UPGRADE_IDS, getUpgradeDef } from '../data/upgrades';

const UPGRADE_LEVELS_KEY = 'dungeon_roguelike_upgrade_levels';

export class UpgradeSystem {
  private levels: Record<string, number>;
  private goldSystem: { getGold(): number; spendGold(amount: number): boolean };

  constructor(goldSystem?: { getGold(): number; spendGold(amount: number): boolean }) {
    this.goldSystem = goldSystem ?? { getGold: () => 0, spendGold: () => false };
    this.levels = this.loadLevels();
  }

  getUpgradeLevel(id: string): number {
    return this.levels[id] ?? 0;
  }

  canUpgrade(id: string): boolean {
    const def = getUpgradeDef(id);
    if (!def) return false;

    const currentLevel = this.getUpgradeLevel(id);
    if (currentLevel >= def.maxLevel) return false;

    const cost = def.costPerLevel[currentLevel];
    if (cost === undefined) return false;

    return this.goldSystem.getGold() >= cost;
  }

  purchaseUpgrade(id: string): boolean {
    if (!this.canUpgrade(id)) return false;

    const def = getUpgradeDef(id)!;
    const currentLevel = this.getUpgradeLevel(id);
    const cost = def.costPerLevel[currentLevel];

    if (!this.goldSystem.spendGold(cost)) return false;

    this.levels[id] = currentLevel + 1;
    this.save();
    return true;
  }

  getAllUpgradeLevels(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const id of UPGRADE_IDS) {
      result[id] = this.getUpgradeLevel(id);
    }
    return result;
  }

  getPermanentBonuses(): Record<string, number> {
    const bonuses: Record<string, number> = {};

    for (const id of UPGRADE_IDS) {
      const level = this.getUpgradeLevel(id);
      if (level <= 0) continue;

      const def = getUpgradeDef(id);
      if (!def) continue;

      let total = 0;
      for (let i = 0; i < level; i++) {
        total += def.effectPerLevel[i] ?? 0;
      }

      // Accumulate by stat key (some upgrades may share a stat)
      if (bonuses[def.stat] !== undefined) {
        bonuses[def.stat] += total;
      } else {
        bonuses[def.stat] = total;
      }
    }

    return bonuses;
  }

  private loadLevels(): Record<string, number> {
    try {
      const data = localStorage.getItem(UPGRADE_LEVELS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed as Record<string, number>;
        }
      }
    } catch {
      // ignore
    }
    return {};
  }

  private save(): void {
    try {
      localStorage.setItem(UPGRADE_LEVELS_KEY, JSON.stringify(this.levels));
    } catch {
      // ignore
    }
  }
}
