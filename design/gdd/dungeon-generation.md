# GDD: Dungeon Generation

> **Status**: Approved
> **Priority**: MVP (Foundation Layer)
> **Dependencies**: None
> **Depended On By**: Spawn System, Enemy AI, Player Entity
> **Source Code**: src/scenes/GameScene.ts (createRandomDungeon)
> **Systems Index**: #1 — design/gdd/systems-index.md

---

## Overview

Dungeon Generation creates a randomized, tile-based dungeon at the start of each game run. It uses a **random room placement + L-shaped corridor** algorithm to produce 12–18 rooms of varying size connected by 2-tile-wide corridors on a 60×45 tile grid. The player spawns at the map center. The dungeon is static per run (does not change between waves).

---

## Player Fantasy

The player feels like they're exploring an unpredictable, atmospheric dungeon whose layout forces tactical movement decisions during combat — using corridors for choke points and rooms for open-field maneuvering.

---

## Detailed Rules

### Algorithm: Random Room Placement with Corridors

1. **Grid Initialization**: Create a 60×45 grid (`dungeonGrid`), all tiles initialized to wall (1)
2. **Room Generation**: Generate 12–18 rooms, each 4–10 tiles wide × 4–10 tiles high, placed randomly with overlap checking (1-tile padding between rooms)
3. **Corridor Connection**: Each room connected to the previous room via an L-shaped corridor (horizontal then vertical), 2 tiles wide
4. **Center Clearing**: Force a 7×7 open area at the map center to ensure a safe player spawn zone
5. **Boundary Walls**: All edge tiles are always walls, regardless of grid state
6. **Tile Rendering**: Each tile is 32×32 pixels; walls are static physics bodies, floors are decorative images

### Room Placement Logic

```
for each attempt (up to roomCount × 5):
  pick random room size (4–10 × 4–10)
  pick random position with 2-tile margin from edges
  check overlap with all existing rooms (1-tile padding)
  if no overlap → carve room (set grid cells to 0)
```

### Corridor Carving

- For each consecutive room pair (rooms[i-1] → rooms[i]):
  - Start at center of room A
  - Carve horizontally to center of room B (2 tiles wide)
  - Carve vertically to center of room B (2 tiles wide)

### Visual Assets

| Asset | Size | Base Color | Pattern |
|-------|------|------------|---------|
| Floor tile | 32×32 | #2d2d44 | Stone pattern with cracks (#252540) |
| Wall tile | 32×32 | #4a3a2a | Brick pattern with mortar lines (#3a2a1a) |

---

## Formulas

| Formula | Expression | Range |
|---------|------------|-------|
| Room count | `12 + randInt(0, 6)` | [12, 18] |
| Room width | `randInt(4, 10)` | [4, 10] tiles |
| Room height | `randInt(4, 10)` | [4, 10] tiles |
| Room X position | `randInt(2, MAP_COLS - w - 2)` | [2, MAP_COLS-w-2] |
| Room Y position | `randInt(2, MAP_ROWS - h - 2)` | [2, MAP_ROWS-h-2] |
| Room overlap check | 1-tile padding ( AABB with +1 ) | — |
| Corridor width | 2 tiles (tile ± 1) | Fixed |
| Center clear zone | 7×7 tiles | Fixed |
| Max placement attempts | `roomCount × 5` | [60, 90] |
| Total map size | `60 × 32 = 1920px × 45 × 32 = 1440px` | Fixed |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Room placement fails (overlap) | Retry up to `roomCount × 5` times, then stop. May generate fewer rooms than `roomCount`. |
| Edge tiles | Always wall, regardless of grid state. |
| Corridor extends beyond room | Corridor carving in already-wall areas is safe; boundary tiles remain walls. |
| Player spawns before rooms | Center clearing (7×7) guarantees a valid spawn point. |
| All rooms fail to place | Minimum center clearing still provides a playable area. |
| Very large room at map edge | 2-tile margin from edges prevents partial rooms. |

---

## Dependencies

### Depends On
- None — standalone system.

### Depended On By
- **Spawn System**: Uses `dungeonGrid` to validate floor tiles for enemy/pickup placement.
- **Enemy AI**: Uses wall collision for movement blocking.
- **Player Entity**: Uses wall collision for movement blocking.
- **Bullet System**: Uses wall collision for bullet stopping.

---

## Tuning Knobs

| Knob | Current | Safe Range | Gameplay Impact |
|------|---------|------------|-----------------|
| `MAP_COLS` | 60 | 40–100 | Map width — more rooms, longer exploration |
| `MAP_ROWS` | 45 | 30–80 | Map height — same |
| `roomCount` base | 12 + randInt(0,6) | 8–25 | More rooms = more open, fewer = more claustrophobic |
| `roomMinSize` | 4 | 3–6 | Minimum room size — affects arena feel |
| `roomMaxSize` | 10 | 6–15 | Maximum room size — large rooms become boss arenas |
| `corridorWidth` | 2 | 1–3 | Wider corridors reduce choke-point combat |
| `centerClearSize` | 7 | 5–11 | Player safe zone — must accommodate initial wave |
| `roomPadding` | 1 | 0–2 | Minimum gap between rooms — 0 = rooms can touch |
| `roomPlacementAttempts` multiplier | 5 | 3–10 | Higher = more rooms placed, slower generation |

---

## Acceptance Criteria

- [ ] Each run generates a different dungeon layout
- [ ] All rooms are connected to the map via at least one corridor
- [ ] Player can spawn at map center without being stuck in a wall
- [ ] Enemy spawns only occur on floor tiles (validated by SpawnSystem)
- [ ] Boundary tiles are always walls
- [ ] Map renders at 60fps with no visible stutter during generation
- [ ] Corridors are consistently 2 tiles wide
- [ ] No isolated rooms (rooms with no corridor connection)

---

## Optimization Opportunities

Since this system is already implemented, these are areas for future improvement:

1. **Room variety**: Add special room types (treasure rooms, boss rooms, narrow corridors) to create more tactical diversity
2. **Biome support**: Different tile sets per wave range (stone → lava → ice) as mentioned in the art bible
3. **Room connection optimization**: Use MST (minimum spanning tree) for more organic layouts instead of sequential connection
4. **Performance**: Pre-generate dungeon data in BootScene to avoid frame spike at game start
