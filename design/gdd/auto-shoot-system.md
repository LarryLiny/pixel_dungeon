# GDD: Auto-Shoot System

> **Status**: Approved
> **Priority**: MVP (Core Layer — BOTTLENECK)
> **Dependencies**: Player Entity (modifiers, position), Bullet System (projectiles), Enemy AI (targets)
> **Depended On By**: GameScene (combat orchestration), Combat Feedback (kill triggers)
> **Source Code**: src/systems/AutoShootSystem.ts (1080 lines)
> **Systems Index**: #5 — design/gdd/systems-index.md

---

## Overview

The Auto-Shoot System is the combat engine — it manages 11 weapon types and their fusion variants (20+ total), handling targeting, projectile creation, and direct-damage mechanics. Weapons fall into two categories: **bullet-firing** (standard projectiles) and **non-bullet** (orbital, melee, AoE, beam, lightning). The system auto-targets the nearest enemy and fires on a timer modified by attack speed.

---

## Player Fantasy

Each weapon type creates a distinct combat rhythm — the player should be able to identify their build from combat visuals alone. Shotguns feel like burst damage, orbs feel like a protective shield, laser feels like focused precision, lightning feels like chaotic chain destruction. Fusion weapons amplify these feelings dramatically.

---

## Detailed Rules

### Weapon Categories

#### Bullet-Firing Weapons (11 types)

| # | Weapon | Variant | Damage Mod | Fire Pattern | Special |
|---|--------|---------|------------|-------------|---------|
| 1 | basic_shot | — | ×1.0 | Single (+ spread from shotCount) | Default weapon |
| 2 | shotgun | freeze_shotgun | ×0.6 each | Fan of 3+shotCount bullets | Freeze variant: 60% slow for 2s |
| 2 | — | fragment_bomb | ×0.5 each | Same fan | Higher pierce (base+3) |
| 4 | boomerang | — | ×0.9 | Returns to player after maxDistance | Pierces through enemies both ways |
| 4 | — | death_wheel | ×1.2 | Same return pattern | Splash radius 25px |
| 8 | poison_snake | — | ×0.7 | Single bullet | Leaves poison cloud on hit |
| 8 | — | plague_bomb | ×0.5 + extra shots | Multi-shot poison | Extra shots from shotCount |
| 10 | death_scythe | — | ×1.5 | Large slow bullet | Execute at 15% HP, pierce+2 |
| 10 | — | soul_reaper | ×2.0 | Same pattern | Execute + splash radius 20px |
| — | mega_blaster | — | ×2.0 | Single mega bullet | 2.5× size, pierce+3, 60% speed |

#### Non-Bullet Weapons (6 systems)

| # | System | Weapons | Mechanic | Interval |
|---|--------|---------|----------|----------|
| 3 | Orbiting Orbs | fireball_orbit, hellfire, tracking_fireball, sun_storm | Persistent sprites orbiting player | Continuous contact damage |
| 5 | Lightning | lightning, thunderstorm | Direct damage + chain to nearby | 600ms / 400ms |
| 6 | Sword Slash | sword_slash, thunder_slash | Frontal arc damage near player | 600ms / 500ms |
| 7 | Ice Wave | ice_wave, frost_storm | Frontal cone + slow | 1500ms / 1000ms |
| 9 | Laser Beam | laser_beam, photon_cannon | Continuous beam to nearest | Continuous DPS |
| — | Repulse Aura | (from shield items) | Push + damage enemies in radius | 1 damage/second |

### Orb System Details

- Orbit radius: 50px (sun_storm: 70px)
- Orbit speed: 0.8× (hellfire: 1.0×)
- Orb damage: `BULLET_DAMAGE × damageMul × (sun_storm ? 0.8 : 0.5)`
- tracking_fireball: 70% orbit + 30% toward nearest enemy
- Contact damage when orb center < 18px from enemy center

### Lightning System Details

- Range: 300px from player
- Chain range: 120px between enemies
- Chain count: `chainCount + (thunderstorm ? 3 : 1)`
- Chain damage: ×0.7 per hop
- Visual: zigzag line with 5 segments, ±10px perpendicular jitter
- Display duration: 100ms

### Sword Slash Details

- Range: 120px detection, `swordRange` (default 80px) damage
- Arc: `swordArcAngle` (default 108°)
- Direction: toward nearest enemy within 120px, else movement direction, else up
- thunder_slash: chain mini-lightning to nearby enemy within 80px (30% damage)

### Ice Wave Details

- Cone: 144° (72° half-angle)
- Range: 100px (frost_storm: 130px)
- Slow: `iceSlowAmount` (default 0.5) for 2000ms
- frost_storm: additional 360° aura ring for 0.3 slow + minor damage

### Laser Beam Details

- Range: 300px
- DPS: `laserDps × damageMul × (photon_cannon ? 1.5 : 1.0)`
- Continuous damage: `dps × dt` per frame
- Visual: 3-layer line (outer glow → main beam → core white)
- photon_cannon: pulsing impact circle on target

### Poison Cloud System

- Spawned on poison bullet hit (plague_bomb / poison_snake)
- Radius: 30px
- DPS: `poisonDpsField` (default 5)
- Duration: configurable, fades via alpha tween
- Damages all enemies within `radius + 10` each frame

### Repulse Aura

- Radius: `repulseRadius` modifier
- Push force: `200 × (1 - dist/radius)` — stronger closer
- Damage: 3 HP per enemy, once per second
- Visual: not rendered (invisible force field)

### Targeting

All weapons auto-target the **nearest living enemy**. No manual aiming required.

---

## Formulas

| Formula | Expression | Notes |
|---------|------------|-------|
| Effective interval | `SHOOT_INTERVAL × attackSpeedMul` | Base 400ms |
| Bullet damage | `BULLET_DAMAGE × damageMul × weaponMod` | weaponMod varies per type |
| Spread angle | `0.1 × shotCount` (basic), `0.15 × (count-1)` (shotgun) | More shots = wider spread |
| Boomerang travel | `BULLET_RANGE × 0.6` | 240px |
| Boomerang return speed | `BULLET_SPEED × bulletSpeedMul × 1.1` | Slightly faster return |
| Orb orbit angle | `time / (800 / orbitSpeed) + i × 2π / count` | Evenly distributed |
| Lightning chain range | 120px between targets | Fixed |
| Lightning chain damage | `damage × 0.7` per hop | Decaying |
| Sword angle check | `|angleDiff| < slashArc / 2` | Within arc |
| Ice cone half-angle | 72° (π × 0.4) | 144° total cone |
| Laser DPS | `laserDps × damageMul × dt` | Per-frame |
| Repulse push | `200 × (1 - dist/radius)` | 0 at edge, max at center |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| No enemies alive | All weapons idle; laser clears; orbs orbit harmlessly |
| All bullets in pool used | Oldest active bullet recycled to fire new |
| Multiple kills same frame | `scored` flag prevents double-scoring |
| Lightning chain to dead enemy | `isAlive` check prevents targeting |
| Orb damage same enemy per frame | No cooldown — continuous contact damage |
| Poison cloud vs dead enemy | `isAlive` check skips |
| Laser target dies mid-beam | Re-targets to next nearest, or clears |
| Boomerang player dies mid-flight | `playerRef` may be null — crash risk |
| Weapon type switches mid-combat | Old system cleared (orbs destroyed, laser cleared) |
| attackSpeedMul very low | Weapon fires extremely fast — performance risk |

---

## Dependencies

### Depends On
- **Player Entity**: Reads all modifiers (damageMul, weaponType, shotCount, pierce, etc.)
- **Bullet System**: Creates and recycles bullets for bullet-firing weapons
- **Enemy AI**: Target selection for all weapons

### Depended On By
- **GameScene**: Orchestrates collision, calls `applyRepulse()`, handles kill callbacks
- **Combat Feedback**: Triggered via `onWeaponKill` and `onOrbKill` callbacks

---

## Tuning Knobs

| Knob | Current | Safe Range | Impact |
|------|---------|------------|--------|
| `SHOOT_INTERVAL` | 400ms | 200–800ms | Global fire rate |
| Basic shot spread | `0.1 × shotCount` rad | 0.05–0.2 | Multi-shot tightness |
| Shotgun pellet count | `3 + shotCount` | 2–10 | Burst density |
| Shotgun damage mod | ×0.6 | ×0.3–×1.0 | Per-pellet power |
| Boomerang distance | `BULLET_RANGE × 0.6` | ×0.3–×0.8 | Reach |
| Orb orbit radius | 50–70px | 30–100 | Protective zone size |
| Orb contact damage | ×0.5–×0.8 | ×0.2–×1.5 | Orb lethality |
| Lightning interval | 400–600ms | 200–1000ms | Strike frequency |
| Lightning chain range | 120px | 60–200 | Chain spread |
| Chain damage decay | ×0.7 | ×0.5–×0.9 | Chain lethality |
| Sword range | 80px (default) | 50–150 | Melee reach |
| Sword arc | 108° (default) | 60–180° | Hit area width |
| Ice cone half-angle | 72° | 36–90° | Freeze coverage |
| Ice slow amount | 0.5 | 0.2–0.8 | Slow intensity |
| Laser range | 300px | 150–500 | Beam reach |
| Laser DPS base | 15 | 5–40 | Beam damage output |
| Repulse damage | 3/second | 1–10 | Aura threat |
| Repulse push force | 200 | 100–400 | Knockback intensity |

---

## Acceptance Criteria

- [ ] All 11 bullet-firing weapons fire at correct intervals
- [ ] All 6 non-bullet weapon systems deal damage correctly
- [ ] Weapon type switch cleanly transitions between systems
- [ ] Auto-targeting always selects nearest living enemy
- [ ] Attack speed multiplier affects all weapon intervals
- [ ] Damage multiplier affects all weapon outputs
- [ ] Boomerang bullets travel out and return to player
- [ ] Lightning chains to correct number of nearby enemies
- [ ] Sword slash damages enemies within arc only
- [ ] Ice wave slows enemies in cone only
- [ ] Laser deals continuous DPS to single target
- [ ] Poison clouds damage all enemies within radius
- [ ] Repulse aura pushes and damages nearby enemies
- [ ] Kill callbacks fire correctly for all weapon types
- [ ] No memory leaks from orbs, graphics, or clouds
- [ ] Performance stays at 60fps with max bullets + orbs + clouds active
