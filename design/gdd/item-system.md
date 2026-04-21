# GDD: Item System

> **Status**: Approved
> **Priority**: MVP (Core Layer — BOTTLENECK)
> **Dependencies**: Player Entity (modifiers, skill slots)
> **Depended On By**: Fusion System, Fragment System, HUD, Daily Challenge System, Build Analysis
> **Source Code**: src/systems/ItemSystem.ts, src/data/items.ts (444 lines)
> **Systems Index**: #6 — design/gdd/systems-index.md

---

## Overview

The Item System manages 48 items across 4 categories (10 weapons, 9 augments, 9 defenses, 20 fusion outputs). Each item has 9 levels with scaling values. The system handles pickup logic (add/upgrade/replace), slot management, and modifier recalculation. Fusion outputs grant extra skill slots. Only one weapon can be equipped at a time.

---

## Player Fantasy

Every item pickup is a meaningful decision — weapons completely change combat style, augments enhance it, defenses enable survival strategies. The 48-item pool ensures no two runs feel identical.

---

## Detailed Rules

### Item Categories

| Category | Count | Slot Rule | Examples |
|----------|-------|-----------|---------|
| **Weapon** | 10 | Only 1 active; new weapon replaces old | basic_shot, shotgun, fireball_orbit, boomerang, lightning, sword_slash, ice_wave, poison_snake, laser_beam, death_scythe |
| **Augment** | 9 | Stack with others; upgrade on duplicate | power, bullet_speed, bullet_size, splash, chain_enhance, pierce_core, barrage, attack_speed, lucky_star |
| **Defense** | 9 | Stack with others; upgrade on duplicate | shield_orbit, repulse, heal_cloak, swiftness, armor, ghost_step, magnet, reflect_mirror, holy_guard |
| **Fusion Output** | 20 | Replace both parent items; grant extra slot | freeze_shotgun, hellfire, death_wheel, mega_blaster, thunder_slash, etc. |

### Rarity System

| Rarity | Color | Drop Rate | Examples |
|--------|-------|-----------|---------|
| Common | Gray (#cccccc) | High | basic_shot, shotgun, power |
| Uncommon | Green (#44cc44) | Medium | Most base items |
| Rare | Blue (#4488ff) | Low | fireball_orbit, ice_wave |
| Epic | Purple (#aa44ff) | Very Low | Fusion outputs |
| Legendary | Gold (#ffaa00) | Extremely Low | sun_storm, soul_reaper, absolute_defense |

### Pickup Logic

1. **Weapon pickup**: If player has a weapon → replace (level 1). If same weapon → upgrade (max 9).
2. **Non-weapon pickup**: If already owned → upgrade (max 9). If new → add to slot (if space available).
3. **Slot limit**: `MAX_SKILL_SLOTS (5) + fusionSlotBonus` — fusion outputs each grant +1 slot.
4. **Full inventory**: Item rejected with "道具栏已满" message.

### Modifier Recalculation

When any item changes, ALL modifiers are recalculated from scratch:
1. Start with `defaultModifiers()`
2. Iterate all skills in order
3. Apply each item's effect based on its ID and level value
4. Track fusion output count for slot bonus
5. Write final modifiers to `player.modifiers`

### Level Scaling

Each item has a 9-element `levels[]` array defining the value at each level. Values are looked up by `getItemValue(itemId, level)` and used as multipliers or flat additions depending on the modifier.

---

## Formulas

| Formula | Expression | Notes |
|---------|------------|-------|
| Max slots | `5 + fusionSlotBonus` | Fusion outputs grant bonus slots |
| Pickup range | `40 × pickupRange modifier` | Base 40px |
| Item value | `levels[level - 1]` | 1-indexed levels |
| Damage multiplier | Cumulative `× value` for weapons/augments | Multiplicative stacking |
| Stat additions | Cumulative `+ value` for counts (orbs, chains, etc.) | Additive stacking |
| Max values | `Math.max(existing, value)` for thresholds | Stronger value wins |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Item not in ALL_ITEMS | Returns `{success: false, message: '未知道具'}` |
| Weapon at max level (9) | Returns `{success: false, message: '已满级'}` |
| Non-weapon at max level | Same as weapon — rejected |
| Inventory full, new item | Rejected with "道具栏已满" |
| Fusion output in inventory | Grants +1 slot via `fusionSlotBonus` |
| Multiple fusion outputs | Each grants +1 slot |
| Level ≤ 0 | `getItemValue` returns 0 |
| Locked item | Not in drop pool (filtered by FragmentSystem) |

---

## Dependencies

### Depends On
- **Player Entity**: Reads/writes `player.skills` and `player.modifiers`
- **Fusion Recipes**: Checks if item is a fusion output for slot bonus

### Depended On By
- **Fusion System**: Checks inventory for fusion recipe matches
- **Fragment System**: Provides unlock state for item filtering
- **HUD**: Displays current items in skill bar
- **Build Analysis**: Reads item loadout for post-run summary

---

## Tuning Knobs

| Knob | Current | Safe Range | Impact |
|------|---------|------------|--------|
| `MAX_SKILL_SLOTS` | 5 | 3–8 | Build complexity |
| `maxLevel` | 9 (all items) | 5–15 | Grind depth per item |
| Weapon level values | Per-item arrays | ×0.5–×3.0 range | Power curve steepness |
| Fusion slot bonus | +1 per fusion output | +0–2 | Fusion incentive |
| Pickup range base | 40px | 20–80 | Item collection ease |

---

## Acceptance Criteria

- [ ] All 48 items can be picked up and applied correctly
- [ ] Weapon replacement works (new weapon replaces old at level 1)
- [ ] Item upgrade works (same item levels up to max 9)
- [ ] Modifier recalculation produces correct values for all items
- [ ] Fusion outputs grant extra skill slots
- [ ] Full inventory correctly rejects new items
- [ ] Locked items are not in the drop pool
- [ ] Level 0 or invalid items return value 0
