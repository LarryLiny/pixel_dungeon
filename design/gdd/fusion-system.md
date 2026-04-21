# GDD: Fusion System

> **Status**: Approved
> **Priority**: MVP (Core Layer)
> **Dependencies**: Item System (inventory check, modifier recalc)
> **Depended On By**: Fusion Preview UI, HUD, GameScene
> **Source Code**: src/systems/FusionSystem.ts, src/data/fusionRecipes.ts (276 lines)
> **Systems Index**: #7 — design/gdd/systems-index.md

---

## Overview

The Fusion System manages 20 recipes that combine two base items into a stronger fusion output. When both ingredients are in the player's inventory at sufficient level, fusion becomes available. Execution removes both ingredients and adds the output at level 1. Fusion outputs also grant an extra skill slot.

---

## Player Fantasy

Fusion is the "aha moment" — discovering that shotgun + bullet_speed = freeze shotgun creates a completely new playstyle. The decision to fuse (losing two items for one stronger one) vs. keeping two independent items is the core strategic tension (Pillar 2: Decision Weight).

---

## Detailed Rules

### Recipe Structure

Each recipe defines:
- `inputs`: Two item IDs that must both be in inventory
- `minLevel`: Both items must be ≥ this level (default 3)
- `output`: Resulting fused item ID
- `outputRarity`: Rarity of the output
- `category`: weapon / augment / defense

### Recipe Tiers

| Tier | Input Rarity | Output Rarity | Count |
|------|-------------|---------------|-------|
| Common × Common | common/common | uncommon | 5 |
| Common × Uncommon | common/uncommon | rare | ~5 |
| Uncommon × Uncommon | uncommon/uncommon | epic | ~5 |
| Higher tiers | mixed | epic/legendary | ~5 |

### Fusion Flow

1. `checkFusions()`: Scan inventory for all valid recipe matches
2. If match found → available for player choice or auto-fuse
3. `executeFusion(recipeId, indexA, indexB)`:
   - Remove items at indexA and indexB (higher index first to avoid shift)
   - Add output item at level 1
   - Recalculate all modifiers
4. Output inherits the category of its recipe (weapon/augment/defense)

### Auto-Fuse

When enabled, the system automatically executes the first available fusion. Used in GameScene's fusion check timer.

---

## Formulas

| Formula | Expression | Notes |
|---------|------------|-------|
| Fusion eligibility | Both inputs in inventory AND both ≥ minLevel | Checked every fusion timer tick |
| Output level | Always 1 | Regardless of input levels |
| Slot net change | -2 inputs +1 output +1 bonus slot = 0 net | Fusion outputs grant bonus slot |
| Max possible fusions | 20 recipes | Limited by item acquisition |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Same item used in two recipes | Both recipes checked; first match wins for auto-fuse |
| Item removed before fusion | Re-check before execution; returns failure |
| Fusion with weapon + augment | Output category defined by recipe, not input mix |
| Inventory nearly full | Fusion frees a slot (net 0), so always possible |
| Auto-fuse with multiple options | First match in array order wins |

---

## Dependencies

### Depends On
- **Item System**: Recalculates modifiers after fusion
- **Player Entity**: Modifies `player.skills` array

### Depended On By
- **Fusion Preview UI**: Shows available fusions
- **HUD**: Displays fusion items
- **GameScene**: Triggers fusion check timer

---

## Tuning Knobs

| Knob | Current | Safe Range | Impact |
|------|---------|------------|--------|
| minLevel (all recipes) | 3 | 2–5 | How early fusion becomes available |
| Output starting level | 1 (fixed) | 1–3 | Power of fresh fusion |
| Number of recipes | 20 | 10–30 | Build variety |
| Fusion check interval | ~2s | 1–5s | How responsive fusion detection is |

---

## Acceptance Criteria

- [ ] All 20 recipes correctly detect matching ingredients
- [ ] Fusion removes both inputs and adds output
- [ ] Modifier recalculation reflects fusion output
- [ ] Fusion outputs grant extra skill slots
- [ ] Auto-fuse selects first available recipe
- [ ] Invalid fusion attempts return failure
- [ ] Same ingredient can't be used in two simultaneous fusions
