# GDD: Enemy AI

> **Status**: Approved
> **Priority**: MVP (Foundation Layer)
> **Dependencies**: Dungeon Generation (tile awareness via wall collision)
> **Depended On By**: Auto-Shoot System, Spawn System, Score System, Combat Feedback, Fragment System
> **Source Code**: src/entities/Enemy.ts, src/data/enemies.ts
> **Systems Index**: #3 — design/gdd/systems-index.md

---

## Overview

The Enemy AI system defines 7 enemy types, each with a unique movement behavior pattern. Enemies pursue the player using behavior-specific logic (direct chase, zigzag, dash, ranged kiting, tank, phase-shifting, boss). All enemies support status effects (slow, poison) and wall-stuck detection with avoidance. Enemy availability scales with wave tier.

---

## Player Fantasy

Each enemy type creates a distinct tactical challenge — the player must adapt movement patterns per enemy. Slimes are fodder, bats are evasive, goblins are burst threats, skeletons force positioning, orcs are damage sponges, ghosts are unpredictable, and the demon demands full attention.

---

## Detailed Rules

### Enemy Types

| Type | HP | Speed | Damage | Score | Behavior | Wave Tier |
|------|-----|-------|--------|-------|----------|-----------|
| Slime | 30 | 40 | 3 | 10 | Direct chase | Easy |
| Bat | 20 | 80 | 2 | 15 | Zigzag | Easy |
| Goblin | 50 | 60 | 5 | 25 | Dash (3× burst) | Medium |
| Skeleton | 80 | 45 | 4 | 40 | Ranged kiting | Medium |
| Orc | 150 | 35 | 8 | 60 | Direct chase (slow, tanky) | Hard |
| Ghost | 60 | 55 | 6 | 50 | Phase (invisible periodically) | Hard |
| Demon (Boss) | 500 | 30 | 12 | 200 | Circular orbit + chase | Boss (wave 5, 10, 15…) |

### Behavior Details

**Chase** (Slime, Orc): Direct movement toward player at constant speed.

**Zigzag** (Bat): Base chase + sinusoidal offset perpendicular to movement direction. `sin(time/300 + randomPhaseOffset) × speed × 0.5`

**Dash** (Goblin): Every 3 seconds, dash at 3× speed toward player. Between dashes, move at 0.5× speed. Creates burst danger window.

**Ranged** (Skeleton): Kiting behavior — retreats if player < 150px, advances if > 250px, strafes at medium range (perpendicular movement at 0.6× speed).

**Phase** (Ghost): Alternates visible/invisible every 2 seconds. When invisible, alpha = 0.3 (still visible but faded). Continues chasing during invisibility.

**Boss** (Demon): Chase + circular orbit pattern using `cos(time/1000)` and `sin(time/1000)` offsets at 0.7× speed amplitude.

### Status Effects

| Effect | Application | Duration | Behavior |
|--------|------------|----------|----------|
| Slow | Bullet hit with slowOnHit | slowDuration (ms) | Speed × (1 - slowValue). Stronger value wins on reapply. |
| Poison | Bullet hit with poisonDps | poisonDuration (ms) | HP drains at poisonDps per second. Stronger value wins on reapply. |

### Wall Stuck Detection

1. Every 500ms, check position delta
2. If moved < 2px² in 500ms → stuck
3. Pick random angle, move in that direction
4. If still stuck, rotate angle by 90°
5. Resume normal behavior once movement detected

### Hit Feedback

- White tint flash for 80ms on damage
- Tint cleared automatically after flash

### Wave Scaling

| Tier | Enemies | Available From |
|------|---------|---------------|
| Easy | Slime, Bat | Wave 1+ |
| Medium | Slime, Bat, Goblin, Skeleton | Wave 5+ |
| Hard | Goblin, Skeleton, Orc, Ghost | Wave 10+ |
| Boss | Demon | Wave 5, 10, 15… (every 5th wave) |

---

## Formulas

| Formula | Expression | Notes |
|---------|------------|-------|
| Movement speed | `baseSpeed × (1 - slowValue)` | slowValue 0.0–1.0 |
| Zigzag offset | `sin(time/300 + phaseOffset) × speed × 0.5` | Perpendicular to chase |
| Dash multiplier | 3× during dash, 0.5× between | 3-second cooldown |
| Ranged kite range | Retreat < 150px, Advance > 250px | Strafe in between |
| Phase period | 2000ms visible / invisible cycle | Alpha toggles 1.0 ↔ 0.3 |
| Boss orbit | `chase + cos/sin(time/1000) × speed × 0.7` | Circular offset |
| Poison DPS | `dps × deltaTime` per frame | Applied in updateEffects |
| Stuck threshold | `< 2px² movement in 500ms` | Triggers wall avoidance |
| Stuck avoidance angle | `random(0, 2π)`, then `+ π/2` | Rotates if still stuck |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Enemy at same position as player | `len === 0` check prevents division by zero |
| Slow + poison both active | Both effects run independently |
| Multiple slow effects | Stronger value wins; weaker ignored |
| Enemy dies from poison | `die()` called in updateEffects |
| Enemy stuck on wall forever | Wall avoidance rotates angle by 90° each 500ms until free |
| Boss at wave edge | `setCollideWorldBounds(true)` keeps in bounds |
| Damage on dead enemy | `isAlive` check prevents processing |
| Status effect expired | Removed from effects array via filter |

---

## Dependencies

### Depends On
- **Dungeon Generation**: Wall collision (via Phaser Arcade Physics)

### Depended On By
- **Auto-Shoot System**: Target selection, weapon behavior interactions
- **Spawn System**: Creates enemies with EnemyData
- **Score System**: Reads `score` value on kill
- **Combat Feedback**: Triggered on damage and death
- **Fragment System**: Fragment drops triggered on kill
- **Wave System**: Controls which enemy types are available per wave

---

## Tuning Knobs

| Knob | Current | Safe Range | Impact |
|------|---------|------------|--------|
| Slime HP | 30 | 15–60 | Early wave difficulty |
| Bat speed | 80 | 50–120 | Evasion difficulty |
| Goblin dash cooldown | 3000ms | 1500–5000ms | Burst danger frequency |
| Goblin dash multiplier | 3× | 2–5× | Burst threat intensity |
| Skeleton kite range | 150–250px | 100–350px | Positioning pressure |
| Ghost phase period | 2000ms | 1000–4000ms | Unpredictability |
| Boss HP | 500 | 200–1000 | Boss fight duration |
| Stuck check interval | 500ms | 300–1000ms | Responsiveness to walls |
| Stuck movement threshold | 2px² | 1–10px² | Sensitivity to walls |
| Body bounce | 0.2 | 0–0.5 | Wall deflection behavior |

---

## Acceptance Criteria

- [ ] Each enemy type exhibits its designated behavior
- [ ] Slow effect reduces movement speed correctly
- [ ] Poison effect deals DPS and can kill
- [ ] Wall stuck detection activates within 500ms
- [ ] Wall avoidance successfully un-stucks enemies
- [ ] Enemy wave tier progression works (easy → medium → hard → boss)
- [ ] Boss appears every 5th wave
- [ ] Status effects expire after their duration
- [ ] Multiple simultaneous status effects work independently
- [ ] Dead enemies stop all movement and processing
