# GDD: Combat Feedback

> **Status**: Approved
> **Priority**: MVP (Feature Layer)
> **Dependencies**: Player Entity, Enemy AI, Bullet System (event triggers)
> **Depended On By**: GameScene (event wiring)
> **Source Code**: src/systems/CombatFeedbackSystem.ts (155 lines)
> **Systems Index**: #11 — design/gdd/systems-index.md

---

## Overview

Combat Feedback provides visual juice: screen shake on player damage, floating damage numbers (with crit styling), kill slow-motion with camera flash, death particle explosions, level-up flash, and fusion flash with expanding rings. This system makes combat "feel" good (Pillar 3: 爽感节奏).

---

## Detailed Rules

### Feedback Types

| Event | Effect | Duration |
|-------|--------|----------|
| Player hit | Screen shake (300ms), red tint flash | 300ms |
| Damage dealt | Floating number at enemy position | ~1000ms fade |
| Critical hit | Larger font, gold color, "!" suffix | Same |
| Enemy kill | Slow-motion (50ms, 0.2× speed), white camera flash | 50ms |
| Enemy death | Particle burst (color × count) | 500ms tween |
| Level up | Gold flash overlay | 300ms |
| Fusion success | Triple expanding colored rings | ~600ms total |

### Damage Numbers

- Spawned as Phaser Text at damage position with random slight offset
- Float upward with alpha fade
- Color: white (normal), gold (crit), or element-colored
- Font: small bold text

### Death Particles

- 4–8 small circles burst outward from enemy position
- Color matches enemy type
- Scale down and fade via tween

---

## Tuning Knobs

| Knob | Current | Safe Range | Impact |
|------|---------|------------|--------|
| Screen shake duration | 300ms | 100–500ms | Hit impact feel |
| Kill slow-mo duration | 50ms | 20–200ms | Kill emphasis |
| Kill slow-mo rate | 0.2× | 0.1–0.5× | Slow intensity |
| Death particle count | 4 | 2–10 | Visual density |
| Damage number lifetime | ~1000ms | 500–2000ms | Readability |

---

## Acceptance Criteria

- [ ] Screen shake triggers on player damage
- [ ] Damage numbers appear at correct positions
- [ ] Kill slow-motion activates on enemy death
- [ ] Death particles burst from enemy position
- [ ] Level-up flash triggers on item level up
- [ ] Fusion flash triggers on successful fusion
- [ ] No performance impact from excessive visual effects
