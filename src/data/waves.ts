export interface WaveConfig {
  enemyCount: number;
  spawnInterval: number;   // ms between spawns
  availableTiers: string[];
  speedMultiplier: number;
  hpMultiplier: number;
  dropChanceBonus: number;
}

export function getWaveConfig(waveNumber: number): WaveConfig {
  const base = {
    enemyCount: 5 + waveNumber * 2,
    spawnInterval: Math.max(500, 2000 - waveNumber * 100),
    speedMultiplier: 1 + waveNumber * 0.05,
    hpMultiplier: 1 + waveNumber * 0.1,
    dropChanceBonus: waveNumber * 0.02,
  };

  let tiers: string[];
  if (waveNumber <= 2) {
    tiers = ['easy'];
  } else if (waveNumber <= 4) {
    tiers = ['easy', 'medium'];
  } else if (waveNumber % 5 === 0) {
    tiers = ['medium', 'hard', 'boss'];
  } else if (waveNumber <= 9) {
    tiers = ['medium', 'hard'];
  } else {
    tiers = ['hard'];
  }

  return { ...base, availableTiers: tiers };
}
