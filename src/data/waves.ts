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
  } else if (waveNumber <= 15) {
    tiers = ['hard'];
  } else {
    // Post-wave 16: keep escalating with all tiers for variety
    tiers = ['hard', 'hard', 'medium'];
    // Boost difficulty beyond linear
    base.hpMultiplier *= 1 + (waveNumber - 15) * 0.05;
    base.speedMultiplier = Math.min(base.speedMultiplier * 1.02, 3.0);
  }

  return { ...base, availableTiers: tiers };
}
