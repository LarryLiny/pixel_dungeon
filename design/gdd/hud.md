# GDD: HUD

> **Status**: Approved
> **Priority**: MVP (Presentation Layer)
> **Dependencies**: Player Entity (HP), Item System (skill bar), Wave System (timer)
> **Depended On By**: None (read-only display)
> **Source Code**: src/ui/HUD.ts (258 lines)
> **Systems Index**: #12 — design/gdd/systems-index.md

---

## Overview

The HUD displays critical game state: HP bar (top-left), score and kill count (top-right), wave number and countdown timer (top-center), and a dynamic skill bar at the bottom. The skill bar auto-expands when fusion outputs add bonus slots.

---

## Detailed Rules

### Layout

| Element | Position | Content |
|---------|----------|---------|
| HP Bar | Top-left | Red/green bar with max HP reference |
| Score | Top-right | Current score number |
| Kill Count | Top-right (below score) | Kill counter |
| Wave Number | Top-center | "Wave N" label |
| Countdown | Top-center (below wave) | MM:SS timer |
| Skill Bar | Bottom-center | Dynamic slots with item icons |

### Skill Bar

- Base slots: 5 (expands with `fusionSlotBonus`)
- Each slot shows item icon with category-colored border
- Slot size: ~36px with 4px gap
- Centered horizontally at bottom of screen
- Fusion items show first parent's icon as fallback

### HP Bar

- Width proportional to current HP / max HP
- Color: green (>50%), yellow (25–50%), red (<25%)

### Timer

- Displays remaining time in current wave
- Format: MM:SS

---

## Tuning Knobs

| Knob | Current | Safe Range | Impact |
|------|---------|------------|--------|
| Slot size | ~36px | 24–48px | Mobile readability |
| Slot gap | 4px | 2–8px | Spacing |
| HP bar width | Proportional | — | Always fits screen |
| Font size | Default Phaser text | 12–20px | Readability |

---

## Acceptance Criteria

- [ ] HP bar reflects current/max HP accurately
- [ ] Score updates on kill
- [ ] Wave number and timer update correctly
- [ ] Skill bar displays all current items
- [ ] Skill bar expands when fusion items add slots
- [ ] Fusion items show appropriate icons
- [ ] HUD readable on mobile (touch-friendly sizing)
