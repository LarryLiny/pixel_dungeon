# GDD: Wave System

> **Status**: Approved
> **Priority**: MVP (Core Layer)
> **Dependencies**: None (standalone timer)
> **Depended On By**: Spawn System, Gold Economy, Daily Challenge, HUD
> **Source Code**: src/systems/WaveSystem.ts, src/data/waves.ts
> **Systems Index**: #8 — design/gdd/systems-index.md

---

## Overview

The Wave System drives game progression via time-based waves. Each wave lasts 30 seconds, after which the next wave begins with harder enemies. Boss waves occur every 5th wave. The system tracks enemies spawned per wave to enforce spawn budgets.

---

## Detailed Rules

1. Wave starts at wave 1, progresses every `WAVE_DURATION` (30s)
2. Each wave has a config: `enemyCount`, `spawnInterval`, `speedMul`, `hpMul`, `tier`
3. Boss wave every 5th wave (5, 10, 15, 20...)
4. `shouldSpawn()` increments counter and returns true if under budget
5. `canSpawnMore()` is a read-only check (no side effect)

### Wave Scaling

| Wave Range | Tier | Speed × | HP × | Enemy Count |
|-----------|------|---------|------|-------------|
| 1–4 | easy | 1.0 | 1.0 | 5 + wave × 2 |
| 5 (boss) | boss | 1.2 | 1.5 | 1 boss + normal |
| 6–9 | medium | 1.3 | 1.5 | 8 + wave × 2 |
| 10 (boss) | boss | 1.5 | 2.0 | 1 boss + normal |
| 10+ | hard | 1.5+ | 2.0+ | Scales continuously |

---

## Formulas

| Formula | Expression | Notes |
|---------|------------|-------|
| Wave duration | 30000ms (fixed) | 30 seconds per wave |
| Wave progress | `(time - waveStartTime) / WAVE_DURATION` | 0.0 to 1.0 |
| Remaining time | `WAVE_DURATION - elapsed` | Countdown for HUD |
| Spawn budget | `waveConfig.enemyCount` | Per-wave limit |

---

## Tuning Knobs

| Knob | Current | Safe Range | Impact |
|------|---------|------------|--------|
| `WAVE_DURATION` | 30000ms | 15000–60000ms | Wave pacing |
| `BOSS_EVERY_N_WAVES` | 5 | 3–10 | Boss frequency |
| Enemy count formula | Per wave config | +1–5 per wave | Difficulty curve |
| Speed/HP multipliers | Per wave config | 1.0–3.0 | Late-game difficulty |

---

## Acceptance Criteria

- [ ] Waves progress every 30 seconds
- [ ] Boss waves occur at correct intervals
- [ ] Enemy spawn budget enforced per wave
- [ ] Wave config scales correctly with wave number
- [ ] `canSpawnMore()` does not modify state
