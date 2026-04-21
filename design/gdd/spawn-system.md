# GDD: Spawn System

> **Status**: Approved
> **Priority**: MVP (Core Layer)
> **Dependencies**: Dungeon Generation (floor validation), Enemy AI (enemy creation)
> **Depended On By**: GameScene (spawn orchestration)
> **Source Code**: src/systems/SpawnSystem.ts (194 lines)
> **Systems Index**: #9 — design/gdd/systems-index.md

---

## Overview

The Spawn System handles enemy and pickup placement at valid floor tile positions. It validates positions against the dungeon grid, filters items by unlock state, and manages cleanup of dead entities.

---

## Detailed Rules

### Position Validation

- Converts pixel position to grid coordinates
- Checks `grid[row][col] === 0` (floor tile)
- Rejects border tiles (row/col 0 and max)
- Fallback: spiral search from random position if initial placement fails

### Enemy Spawning

1. Pick random position on map
2. Validate floor tile
3. If invalid, spiral search with `isFloor()` check
4. Create enemy at valid position with `enemyData` from wave config
5. Add to physics group and call `initBody()`

### Item/Pickup Spawning

- Three pickup types: item, potion, fragment
- Items filtered by unlock state (`unlockedItems` set)
- Rarity-weighted random selection
- Max 15 pickups active (`MAX_PICKUPS`)

### Cleanup

- Dead enemies removed from group every 2s
- Inactive pickups cleaned up

---

## Formulas

| Formula | Expression | Notes |
|---------|------------|-------|
| Grid lookup | `grid[Math.floor(py/TILE_SIZE)][Math.floor(px/TILE_SIZE)]` | Pixel → tile |
| Spiral search | Outward spiral from failed position | Until floor found |
| Max enemies | 25 (`MAX_ENEMIES`) | Hard cap |
| Max pickups | 15 (`MAX_PICKUPS`) | Hard cap |

---

## Tuning Knobs

| Knob | Current | Safe Range | Impact |
|------|---------|------------|--------|
| `MAX_ENEMIES` | 25 | 10–50 | Combat density |
| `MAX_PICKUPS` | 15 | 5–30 | Item availability |
| `ENEMY_SPAWN_INTERVAL` | 2000ms | 500–5000ms | Spawn pacing |
| `PICKUP_SPAWN_INTERVAL` | 8000ms | 3000–15000ms | Item frequency |

---

## Acceptance Criteria

- [ ] Enemies spawn only on floor tiles
- [ ] Items spawn only on floor tiles
- [ ] Locked items never appear in drops
- [ ] Max enemy/pickup limits enforced
- [ ] Spiral fallback finds valid positions
- [ ] Dead enemies cleaned up periodically
