# GDD: Player Entity

> **Status**: Approved
> **Priority**: MVP (Foundation Layer)
> **Dependencies**: None
> **Depended On By**: Auto-Shoot System, Item System, Upgrade System, HUD, Combat Feedback, Touch Input
> **Source Code**: src/entities/Player.ts
> **Systems Index**: #2 — design/gdd/systems-index.md

---

## Overview

The Player Entity is the central game object. It manages HP, movement, skill slots, and a 30+ field modifier system that every other gameplay system reads from. Movement uses WASD or virtual joystick input, processed via `setMoveDirection()` into velocity. Damage triggers invincibility frames. Passive healing is timer-based.

---

## Player Fantasy

The player feels like a glass cannon — powerful offensive builds are possible, but survival always requires active dodging. Every modifier change (from items, upgrades, or fusion) is immediately reflected in gameplay.

---

## Detailed Rules

### Core Stats

| Stat | Default | Modified By |
|------|---------|-------------|
| HP | 100 | `maxHp` (currently fixed) |
| Speed | 160 px/s | `speedMul` |
| Body size | 14×14 px | Fixed |
| Scale | 1.5× | Fixed (visual only) |
| Skill slots | 5 max | `fusionSlotBonus` adds extra |
| Max skill level | 9 | Fixed |

### Damage System

1. Damage arrives via `takeDamage(amount)`
2. Apply shield reduction: `actualDamage = amount × (1 - shieldReduction)`
3. Subtract from HP, clamp to 0
4. Activate invincibility (800ms)
5. If HP ≤ 0 → death (set inactive + invisible)

### Invincibility Frames

- Duration: 800ms after damage
- Visual: red tint + alpha blink (sin wave, 0.3 ↔ 1.0)
- Prevents all damage during window

### Healing

- Passive: `healPerTick` HP every `healInterval` ms (default 5000ms)
- Direct: `heal(amount)` clamps to maxHp
- Triggered by potions and specific items

### Skill System

- Maximum 5 base slots (+ `fusionSlotBonus` extras)
- Skills can be: added (new slot), upgraded (level +1, max 9), or replaced (swap index)
- When inventory full and skill not owned → rejected (return `{added: false}`)

### Modifier Categories (30+ fields)

| Category | Fields | Purpose |
|----------|--------|---------|
| **Offense** | damageMul, shotCount, pierce, weaponType, bulletSpeedMul, bulletSizeMul, splashRadius, orbCount, boomerangCount | Direct combat output |
| **Defense** | shieldReduction, shieldOrbs, repulseRadius, reflectChance, holyGuardThreshold, holyGuardHealRatio | Damage mitigation |
| **Movement** | speedMul, ghostStepDuration, ghostStepInterval | Mobility |
| **Status** | slowOnHit, slowDuration, poisonDps, poisonDuration, iceSlowAmount, poisonDpsField | Debuff application |
| **Utility** | pickupRange, magnetRange, chainCount, executeThreshold, luckyDropMul | Quality of life |
| **Special** | healPerTick, healInterval, attackSpeedMul, fusionSlotBonus, laserDps, swordArcAngle, swordRange | Weapon-specific |

---

## Formulas

| Formula | Expression | Notes |
|---------|------------|-------|
| Movement speed | `PLAYER_SPEED × speedMul` | Base 160, range ~80–400 |
| Damage taken | `amount × (1 - shieldReduction)` | shieldReduction 0.0–1.0 |
| Invincibility | 800ms fixed | After any damage |
| Heal tick | `healPerTick` every `healInterval` ms | Default: 0 HP / 5000ms |
| HP clamp | `Math.max(0, Math.min(maxHp, value))` | Never below 0 or above max |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Damage during invincibility | Ignored completely |
| Damage when dead | Ignored (isAlive check) |
| Heal above max HP | Clamped to maxHp |
| Skill add when full (5 slots) | Returns `{added: false}` — item dropped |
| Skill upgrade at level 9 | Returns `{upgraded: false}` — no effect |
| shieldReduction ≥ 1.0 | Damage reduced to 0 (immune) |
| speedMul very high | Player moves extremely fast — wall collision prevents escape |
| Multiple damage sources same frame | Only first applies (invincibility) |

---

## Dependencies

### Depends On
- None — standalone entity.

### Depended On By
- **Auto-Shoot System**: Reads `weaponType`, `damageMul`, `shotCount`, `pierce`, etc.
- **Item System**: Writes modifiers via `recalculateModifiers()`
- **Upgrade System**: Writes persistent stat bonuses to modifiers
- **HUD**: Reads `hp`, `maxHp`, `skills` for display
- **Combat Feedback**: Triggered on `takeDamage()`
- **Touch Input**: Writes `moveDir` via `setMoveDirection()`

---

## Tuning Knobs

| Knob | Current | Safe Range | Gameplay Impact |
|------|---------|------------|-----------------|
| `PLAYER_MAX_HP` | 100 | 50–200 | Higher = more forgiving, longer runs |
| `PLAYER_SPEED` | 160 | 80–300 | Higher = more dodging, less challenge |
| `INVINCIBLE_DURATION` | 800ms | 300–1500ms | Longer = easier, shorter = hardcore |
| `MAX_SKILL_SLOTS` | 5 | 3–8 | More slots = more complex builds |
| `MAX_SKILL_LEVEL` | 9 | 5–15 | Higher = more grind per skill |
| `PLAYER_SIZE` | 14 | 8–20 | Smaller = harder to hit, tighter gaps |

---

## Acceptance Criteria

- [ ] Player moves at correct speed with WASD and joystick
- [ ] Damage reduces HP correctly with shield reduction applied
- [ ] Invincibility frames prevent damage for 800ms
- [ ] Player dies at 0 HP and becomes inactive
- [ ] Skills can be added, upgraded (max 9), and replaced
- [ ] All 30+ modifiers are recalculated when items change
- [ ] Healing works passively and via direct heal calls
