const GOLD_KEY = 'dungeon_roguelike_gold';

export class GoldSystem {
  private gold: number;

  constructor() {
    this.gold = this.loadGold();
  }

  getGold(): number {
    return this.gold;
  }

  addGold(amount: number): void {
    if (amount <= 0) return;
    this.gold += amount;
    this.save();
  }

  spendGold(amount: number): boolean {
    if (amount <= 0 || this.gold < amount) return false;
    this.gold -= amount;
    this.save();
    return true;
  }

  calculateRunGold(score: number, kills: number, wave: number): number {
    return 10 + kills * 2 + wave * 5;
  }

  private loadGold(): number {
    try {
      const data = localStorage.getItem(GOLD_KEY);
      if (data) {
        const parsed = parseInt(data, 10);
        return isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
    } catch {
      // ignore
    }
    return 0;
  }

  private save(): void {
    try {
      localStorage.setItem(GOLD_KEY, String(this.gold));
    } catch {
      // ignore
    }
  }
}
