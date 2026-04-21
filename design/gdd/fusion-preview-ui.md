# GDD: Fusion Preview UI

> **Status**: Not Started (missing feature)
> **Priority**: MVP (Presentation Layer)
> **Dependencies**: Fusion System (recipe data), Item System (inventory state)
> **Depended On By**: None (new feature)
> **Systems Index**: #10 — design/gdd/systems-index.md

---

## Overview

The Fusion Preview UI shows players what fusions are currently available, what ingredients they need, and what the output will be. This is a critical UX gap — currently players must memorize recipes. Without fusion preview, Pillar 2 (Decision Weight) is undermined because players can't make informed fusion decisions.

---

## Player Fantasy

The player sees a clean overlay showing: "Your shotgun (Lv.5) + bullet_speed (Lv.3) → Freeze Shotgun (uncommon)". This enables the "aha moment" of discovering build paths without needing external wikis.

---

## Detailed Rules

### When to Show

- On-demand: player taps a fusion button or presses a key
- Contextual: brief toast notification when a new fusion becomes possible
- During pickup: if picking up an item would enable a fusion, show a hint

### Display Content

For each available fusion:
- Input A: icon + name + current level
- Input B: icon + name + current level
- Output: icon + name + rarity color + description
- Confirm/Cancel buttons

### Layout

- Overlay panel centered on screen
- Semi-transparent background (doesn't obscure combat)
- One card per available fusion
- Touch-friendly buttons (min 44px tap target)

---

## Formulas

| Formula | Expression | Notes |
|---------|------------|-------|
| Fusion available | Both inputs in inventory AND both ≥ minLevel | From FusionSystem.checkFusions() |
| Display order | By output rarity (uncommon → legendary) | Show most exciting first |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| No fusions available | Show "No fusions available" message or hide panel |
| Multiple fusions available | Show all as scrollable cards |
| Player dies with panel open | Close panel immediately |
| Fusion during combat | Panel must not block dodging |

---

## Dependencies

### Depends On
- **Fusion System**: Recipe matching logic
- **Item System**: Current inventory state

---

## Tuning Knobs

| Knob | Suggested | Safe Range | Impact |
|------|-----------|------------|--------|
| Panel opacity | 80% | 60–95% | Combat visibility |
| Toast duration | 3s | 2–5s | Hint persistence |
| Button tap target | 44px | 36–60px | Mobile usability |

---

## Acceptance Criteria

- [ ] Player can open fusion preview on demand
- [ ] All available fusions displayed with correct ingredients
- [ ] Output item shows name, rarity, and description
- [ ] Player can confirm fusion from preview panel
- [ ] Toast notification appears when new fusion becomes possible
- [ ] Panel doesn't interfere with combat movement
- [ ] Works with touch and keyboard input
