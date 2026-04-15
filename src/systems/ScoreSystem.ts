export class ScoreSystem {
  score: number;
  killCount: number;

  constructor() {
    this.score = 0;
    this.killCount = 0;
  }

  addKill(enemyScore: number) {
    this.score += enemyScore;
    this.killCount++;
  }

  getScore(): number {
    return this.score;
  }

  getKillCount(): number {
    return this.killCount;
  }

  reset() {
    this.score = 0;
    this.killCount = 0;
  }
}
