# GDD: Bullet System

> **Status**: Approved
> **Priority**: MVP (Foundation Layer)
> **Dependencies**: Player Entity (owner reference for boomerang)
> **Depended On By**: Auto-Shoot System (creates and configures bullets)
> **Source Code**: src/entities/Bullet.ts
> **Systems Index**: #4 — design/gdd/systems-index.md

---

## Overview

The Bullet System manages projectile entities using Phaser's object pool (max 80). Each bullet carries damage, pierce, status effect, chain, splash, and weapon-type data. Bullets are recycled via `fire()` (activate) and `recycle()` (deactivate). Special support for boomerang-type bullets that return to the player.

---

## Player Fantasy

Bullets are the primary feedback vehicle — each weapon type should feel visually and mechanically distinct. Pierce, chain lightning, splash, and boomerang behaviors create distinct combat rhythms.

---

## Detailed Rules

### Bullet Properties

| Property | Default | Purpose |
|----------|---------|---------|
| damage | 10 (BULLET_DAMAGE) | HP removed on hit |
| pierce | 0 | Extra enemies bullet can hit before recycling |
| pierceCount | 0 | Internal counter — tracks hits in current flight |
| slowOnHit | 0 | Slow value applied to enemy (0.0–1.0) |
| slowDuration | 0 | Duration of slow in ms |
| poisonDps | 0 | Poison damage per second |
| poisonDuration | 0 | Duration of poison in ms |
| chainCount | 0 | Lightning chain targets |
| splashRadius | 0 | AoE damage radius on hit |
| executeThreshold | 0 | Instant kill if enemy HP % below this |
| weaponType | '' | Determines special behavior |
| returning | false | Boomerang return state |
| maxDistance | 250 | Boomerang travel distance before return |
| returnSpeed | 400 | Boomerang return velocity |
| playerRef | null | Player reference for boomerang targeting |

### Fire Mechanics

1. Calculate direction vector from bullet position to target
2. Apply angle rotation (for spread shots)
3. Set velocity: `direction × speed`
4. Set rotation toward target
5. Activate and show

### Hit Mechanics

**Standard bullets**: Increment `pierceCount`. Recycle when `pierceCount > pierce`.

**Boomerang/death_wheel**: Increment `pierceCount` but don't recycle on hit. Recycle only when `pierceCount > pierce + 5` AND `returning === true`.

### Boomerang Return

1. Track distance from origin (`originX`, `originY`)
2. When `distFromOrigin >= maxDistance` → set `returning = true`, shrink scale
3. While returning: calculate direction toward `playerRef`, set velocity at `returnSpeed`
4. When within 15px of player → recycle
5. Scale gradually shrinks as bullet approaches player

### Recycling

Disables body, stops velocity, hides sprite, resets weaponType and executeThreshold. Bullet returns to Phaser group pool for reuse.

### Object Pool

- Max size: 80 bullets (`MAX_BULLETS`)
- Phaser group with `classType: Bullet` and `maxSize: MAX_BULLETS`
- `runChildUpdate: false` — update managed by AutoShootSystem

---

## Formulas

| Formula | Expression | Notes |
|---------|------------|-------|
| Direction vector | `(target - pos) / len` | Normalized |
| Angle rotation | `cos/sin(angle)` rotation matrix | For spread shots |
| Velocity | `direction × speed` | Default 350 px/s |
| Pierce limit | Recycle when `hits > pierce` | pierce=0 → single target |
| Boomerang trigger | `distFromOrigin >= maxDistance` | 250px default |
| Boomerang return speed | 400 px/s | Fixed |
| Boomerang recycle distance | `< 15px` from player | Bullet collected |
| Boomerang shrink | `max(0.4, distToPlayer / maxDistance) × 1.2` | Visual feedback |
| Boomerang hit limit | `hits > pierce + 5` AND returning | Generous hit window |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Target at same position as bullet | `len === 0` → immediate recycle |
| Bullet body not ready | Null check in `fire()`, skip velocity set |
| Boomerang player dies mid-flight | `playerRef` may be null → crash risk |
| Max bullets reached | Oldest bullet recycled by Phaser group |
| Bullet hits wall | Phaser Arcade collision → handled by GameScene |
| Splash + pierce | Splash applies on first hit, then pierce continues |
| Execute + high threshold | Can instant-kill at high HP if threshold > 0 |
| Multiple status effects | Slow + poison stack independently on enemy |

---

## Dependencies

### Depends On
- **Player Entity**: `playerRef` for boomerang targeting

### Depended On By
- **Auto-Shoot System**: Creates, configures, and manages bullet lifecycle

---

## Tuning Knobs

| Knob | Current | Safe Range | Impact |
|------|---------|------------|--------|
| `BULLET_SPEED` | 350 | 150–600 | Combat feel — fast = snappy, slow = deliberate |
| `BULLET_DAMAGE` | 10 | 5–30 | Base damage before modifiers |
| `BULLET_SIZE` | 4 | 2–10 | Hit detection size |
| `BULLET_RANGE` | 400 | 200–800 | Distance before auto-recycle |
| `MAX_BULLETS` | 80 | 40–200 | Performance vs. visual density |
| Boomerang `maxDistance` | 250 | 100–500 | Boomerang reach |
| Boomerang `returnSpeed` | 400 | 200–600 | Return feel |
| Boomerang recycle distance | 15px | 10–30 | Forgiveness of collection |

---

## Acceptance Criteria

- [ ] Bullets fire in correct direction toward target
- [ ] Pierce allows hitting multiple enemies
- [ ] Status effects (slow, poison) applied on hit
- [ ] Boomerang bullets travel out and return to player
- [ ] Boomerang bullets can hit enemies on both outgoing and return paths
- [ ] Object pool recycles bullets without memory leaks
- [ ] Max bullet limit enforced (no frame drops from excessive bullets)
- [ ] Bullets collide with walls and are recycled
