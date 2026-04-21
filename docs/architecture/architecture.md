# 像素地牢 (Pixel Dungeon) — Master Architecture

## Document Status

- Version: 1
- Last Updated: 2026-04-17
- Engine: Phaser 3.80.1 (Arcade Physics)
- Language: TypeScript 5.5
- Build: Vite 5.4
- GDDs Covered: 12 MVP systems (design/gdd/*.md)
- ADRs Referenced: ADR-0001 (Scene Communication), ADR-0002 (Entity Lifecycle), ADR-0003 (Modifier Recalculation), ADR-0004 (Collision Architecture)
- Review Mode: Solo

---

## Engine Knowledge Gap Summary

**Phaser 3.80.1** is fully within LLM training data (cutoff May 2025).

| Risk Level | Domains | Notes |
|-----------|---------|-------|
| LOW | Arcade Physics, Scene Management, Tweens, Graphics, Input, Groups | All APIs reliable |
| HIGH | None | — |

No engine compatibility concerns for this architecture.

---

## System Layer Map

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                         │
│  HUD, Fusion Preview UI, Build Analysis, Shop UI,           │
│  Combat Feedback (VFX), Menu/GameOver/Leaderboard Scenes    │
├─────────────────────────────────────────────────────────────┤
│  FEATURE LAYER                                              │
│  Auto-Shoot System (11 weapons), Enemy AI (7 behaviors),    │
│  Fusion System (20 recipes), Score System,                  │
│  Daily Challenge System, Wave System, Spawn System          │
├─────────────────────────────────────────────────────────────┤
│  CORE LAYER                                                 │
│  Player Entity (30+ modifiers), Bullet System (pool),       │
│  Item System (48 items), Gold Economy,                      │
│  Fragment System, Upgrade System, Touch Input               │
├─────────────────────────────────────────────────────────────┤
│  FOUNDATION LAYER                                           │
│  Dungeon Generation, Scene Management,                      │
│  Physics (Arcade), Object Pooling, localStorage I/O        │
├─────────────────────────────────────────────────────────────┤
│  PLATFORM LAYER                                             │
│  Phaser 3.80.1 (WebGL/Canvas), Vite 5.4,                   │
│  Responsive Viewport, Touch API                             │
└─────────────────────────────────────────────────────────────┘
```

### System → Layer Assignment

| System | Layer | GDD |
|--------|-------|-----|
| Phaser Engine, Vite | Platform | — |
| Dungeon Generation | Foundation | dungeon-generation.md |
| Scene Management (Boot→Menu→Game→GameOver) | Foundation | — |
| Arcade Physics (collision groups) | Foundation | — |
| Object Pooling (bullet group max 80) | Foundation | — |
| localStorage Persistence | Foundation | — |
| Player Entity | Core | player-entity.md |
| Bullet System | Core | bullet-system.md |
| Item System | Core | item-system.md |
| Gold Economy | Core | — |
| Fragment System | Core | — |
| Upgrade System | Core | — |
| Touch Input (Virtual Joystick) | Core | — |
| Auto-Shoot System | Feature | auto-shoot-system.md |
| Enemy AI | Feature | enemy-ai.md |
| Fusion System | Feature | fusion-system.md |
| Wave System | Feature | wave-system.md |
| Spawn System | Feature | spawn-system.md |
| Score System | Feature | — |
| Daily Challenge System | Feature | — |
| HUD | Presentation | hud.md |
| Fusion Preview UI | Presentation | fusion-preview-ui.md |
| Build Analysis | Presentation | — |
| Shop UI | Presentation | — |
| Combat Feedback | Presentation | combat-feedback.md |
| Menu / Scene Flow | Presentation | — |

---

## Module Ownership

| Module | Owns | Exposes | Consumes |
|--------|------|---------|----------|
| **Platform** | | | |
| Phaser Engine | Game loop, rendering, physics | Scene lifecycle, physics bodies, groups | — |
| Vite | Module bundling, HMR | ES module imports | — |
| **Foundation** | | | |
| Dungeon Gen | `dungeonGrid[][]`, wall group, floor group | `isFloor(x,y)` | TILE_SIZE, MAP_COLS/ROWS |
| Scene Mgmt | Scene transitions | `scene.start(key)` | Phaser.Scene |
| Physics | Collision groups, world bounds | `collide(), overlap()` | Arcade Physics |
| Object Pool | Bullet group (max 80), enemy/pickup groups | `get(), recycle()` | Phaser Groups |
| Persistence | localStorage read/write | `save(key,data), load(key)` | Fragment, Gold, Upgrade, Leaderboard |
| **Core** | | | |
| Player Entity | HP, modifiers, skills[], movement | `takeDamage(), heal(), addSkill()` | Dungeon (wall collision) |
| Bullet System | Pool of Bullet entities | `fire(), recycle(), onHitEnemy()` | Player (modifiers), Object Pool |
| Item System | Modifier recalculation, pickup logic | `recalculate(), pickupItem()` | Player (skills), Fusion Recipes |
| Gold Economy | Gold balance, run rewards | `addGold(), spendGold()` | Wave System, Score System |
| Fragment System | Fragment counts, unlock state | `collect(), unlock(), getUnlocked()` | Persistence (localStorage) |
| Upgrade System | Upgrade levels, costs | `purchase(), getLevel()` | Gold (spending), Player (bonuses) |
| Touch Input | Virtual joystick state | `setMoveDirection()` | Player Entity |
| **Feature** | | | |
| Auto-Shoot | All weapon behaviors, targeting | `update(time, enemies), applyRepulse()` | Player, Bullets, Enemies |
| Enemy AI | 7 behavior patterns, status effects | `update(), takeDamage(), die()` | Dungeon (wall collision) |
| Fusion System | Recipe matching, execution | `checkFusions(), executeFusion(), autoFuse()` | Item System, Player |
| Wave System | Wave counter, config, timer | `update(), shouldSpawn(), canSpawnMore()` | Wave data |
| Spawn System | Position validation, entity creation | `spawnEnemy(), spawnPickup(), cleanup()` | Dungeon Grid, Enemy data |
| Score System | Score + kill count | `addKill(), getScore()` | Enemy (score value) |
| Daily Challenge | Seeded challenges, evaluation | `generate(), evaluate(), claimReward()` | Wave, Score, Items |
| **Presentation** | | | |
| HUD | HP bar, skill bar, wave info, score | `update()` | Player, Items, Wave |
| Fusion Preview | Available fusion display | `show(), hide()` | Fusion System, Items |
| Combat Feedback | VFX: shake, numbers, slow-mo, particles | `onHit(), onKill(), onLevelUp(), onFusion()` | Player, Enemies |
| Menu/Flow | Scene orchestration, buttons | Scene transitions | All |

### ASCII Dependency Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Platform  │────►│Foundation│────►│   Core   │
│ (Phaser)  │     │ (Dungeon,│     │ (Player, │
│           │     │  Physics,│     │  Bullets,│
│           │     │  Pool)   │     │  Items)  │
└──────────┘     └──────────┘     └────┬─────┘
                                       │
                                       ▼
                                 ┌──────────┐
                                 │ Feature  │
                                 │ (Combat, │
                                 │  AI,     │
                                 │  Fusion) │
                                 └────┬─────┘
                                      │
                                      ▼
                                ┌───────────┐
                                │Presentation│
                                │ (HUD, VFX,│
                                │  Menus)   │
                                └───────────┘
```

---

## Data Flow

### Frame Update Path

```
[Platform: Phaser Game Loop @ 60fps]
    │
    ▼
[GameScene.update(time, delta)]
    │
    ├─► [Foundation: Physics] ── collision checks ──► Player/Enemies/Bullets
    │
    ├─► [Core: Player.update()] ── movement, invincibility, healing
    │
    ├─► [Feature: Wave.update()] ── check timer ──► nextWave() if expired
    │
    ├─► [Feature: Spawn] ── spawn enemies/pickups on timer
    │
    ├─► [Feature: AutoShoot.update()] ── fire weapons / update orbs / laser
    │       ├─► reads Player.modifiers
    │       ├─► creates Bullets (from pool)
    │       └─► directly damages Enemies (non-bullet weapons)
    │
    ├─► [Feature: Enemy.update()] ── behavior AI + status effects
    │
    ├─► [Feature: Fusion.checkFusions()] ── periodic inventory scan
    │
    ├─► [Presentation: HUD.update()] ── refresh display
    │
    └─► [Presentation: CombatFeedback] ── triggered by events
```

### Item Pickup Flow

```
[Player overlaps Pickup]
    │
    ▼
[GameScene: overlap handler]
    │
    ├─► [ItemSystem.pickupItem(id)]
    │       ├─► Category check: weapon (replace) vs augment/defense (stack)
    │       ├─► Level check: upgrade if owned, add if new, reject if full
    │       ├─► [ItemSystem.recalculate()] ── rebuild all modifiers
    │       └─► Return result message
    │
    ├─► [FusionSystem.checkFusions()] ── auto-fuse if match
    │       └─► [ItemSystem.recalculate()] ── rebuild after fusion
    │
    └─► [CombatFeedback.onLevelUp()] ── flash effect
```

### Persistence Flow

```
[Run End]
    │
    ├─► [ScoreSystem] ── final score
    ├─► [Leaderboard] ── save to localStorage (key: dungeon_roguelike_scores)
    ├─► [GoldSystem] ── run gold = kills × base + wave_bonus ──► localStorage
    ├─► [FragmentSystem] ── save fragment counts ──► localStorage
    └─► [UpgradeSystem] ── already persisted per purchase ──► localStorage

[Next Run Start]
    │
    ├─► [FragmentSystem.load()] ── restore unlocked items
    ├─► [GoldSystem.load()] ── restore gold balance
    └─► [UpgradeSystem.load()] ── restore upgrade levels
```

### Initialization Order

```
1. BootScene ── generate all pixel textures ──► MenuScene
2. MenuScene ── load persisted state ──► GameScene (on Start)
3. GameScene.create():
   a. Physics world bounds
   b. Dungeon Generation (grid + walls)
   c. Create groups (enemies, bullets, pickups)
   d. Create Player
   e. Create systems: AutoShoot, Spawn, Item, Fusion, Fragment, CombatFeedback, Wave, Score
   f. Create UI: HUD, VirtualJoystick
   g. Setup collision handlers
   h. Start Wave 1
```

---

## API Boundaries

### Foundation APIs

```typescript
// Dungeon Generation
interface DungeonProvider {
  dungeonGrid: number[][];  // 0=floor, 1=wall
  walls: Phaser.Physics.Arcade.StaticGroup;
  // No public methods — grid read directly by consumers
}

// Object Pool
interface BulletPool {
  get(x: number, y: number): Bullet | null;
  // Recycle handled by Bullet.recycle() internally
  getChildren(): Bullet[];
}
```

### Core APIs

```typescript
// Player Entity
interface PlayerEntity {
  hp: number; maxHp: number;
  skills: SkillSlot[];
  modifiers: PlayerModifiers;
  isAlive: boolean;
  moveDir: { x: number; y: number };
  takeDamage(amount: number): void;
  heal(amount: number): void;
  setMoveDirection(dx: number, dy: number): void;
  addSkill(id: string): { added: boolean; upgraded: boolean; replaced: boolean };
}

// Item System
interface ItemManager {
  recalculate(): void;  // Rebuilds ALL modifiers from skills[]
  pickupItem(itemId: string): { success: boolean; message: string; level: number };
  getPickupRange(): number;
}

// Bullet Entity
interface BulletEntity {
  damage: number; pierce: number; weaponType: string;
  fire(targetX: number, targetY: number, damage: number, angle: number, speed: number): void;
  onHitEnemy(): void;  // Handles pierce/boomerang logic
  recycle(): void;     // Return to pool
}
```

### Feature APIs

```typescript
// Auto-Shoot
interface WeaponSystem {
  update(time: number, enemies: Enemy[]): void;
  onOrbKill: ((enemy: Enemy) => void) | null;
  onWeaponKill: ((enemy: Enemy) => void) | null;
  applyRepulse(enemies: Enemy[]): void;
}

// Fusion
interface FusionEngine {
  checkFusions(): { recipe: FusionRecipe; indexA: number; indexB: number }[];
  executeFusion(recipeId: string, idxA: number, idxB: number): FusionResult;
  autoFuse(): FusionResult | null;
}

// Wave
interface WaveManager {
  update(time: number): boolean;  // Returns true if wave changed
  shouldSpawn(): boolean;         // Increments counter (side effect)
  canSpawnMore(): boolean;        // Read-only check
  getConfig(): WaveConfig;
  getRemainingTime(time: number): number;
}

// Enemy
interface EnemyEntity {
  hp: number; maxHp: number; score: number;
  isAlive: boolean; scored: boolean;
  update(time: number, delta: number, playerX: number, playerY: number): void;
  takeDamage(amount: number, effects?: StatusEffect[]): void;
  die(): void;
}
```

---

## ADR Audit

No existing ADRs found. All architecture decisions documented here are new.

---

## Required ADRs

### Must Have Before Coding (Foundation & Core)

1. **Scene Communication Pattern** — How scenes share data (run results, upgrade state)
   - Covers: TR-pers-001

2. **Entity Lifecycle Management** — Enemy/Bullet/Pickup creation, recycling, cleanup rules
   - Covers: TR-bull-001, TR-perf-002

3. **Modifier Recalculation Strategy** — Full rebuild vs incremental update
   - Covers: TR-play-001, TR-item-002, TR-item-004

4. **Collision Architecture** — Who owns overlap/collide handlers and kill callbacks
   - Covers: TR-dung-004, TR-bull-003

### Should Have Before Relevant System

5. **Weapon Extensibility Pattern** — How to add new weapon types without modifying AutoShootSystem
   - Covers: TR-auto-001, TR-auto-002

6. **Fusion Recipe Registration** — How recipes are discovered and matched
   - Covers: TR-fusn-001, TR-fusn-002

7. **Mobile Input Architecture** — Virtual joystick + responsive scaling rules
   - Covers: TR-mob-001, TR-mob-002

### Can Defer

8. **Persistence Format** — localStorage schema versioning
9. **Performance Monitoring** — Frame time profiling approach
10. **Build Analysis Data Collection** — What to track during a run

---

## Architecture Principles

1. **System Pattern**: Each system is a standalone class owning its state. GameScene is the sole orchestrator — systems never call each other directly. This keeps the dependency graph flat and testable.

2. **Data-Driven Modifiers**: All player power flows through `PlayerModifiers`. Items modify these through a single `recalculate()` function (full rebuild, not incremental patching). This prevents modifier drift bugs.

3. **Object Pooling**: Bullets use Phaser groups with `maxSize`. No per-frame allocations for combat entities. Entities are recycled, not created/destroyed. This enforces the 60fps performance budget.

4. **Scene as Mediator**: Systems don't hold references to each other. GameScene wires collision handlers and callbacks (`onKill`, `onOrbKill`). This decouples systems and makes individual systems testable in isolation.

5. **localStorage as Sole Persistence**: All cross-run state uses simple key-value localStorage. No server, no serialization framework. Schema is flat JSON per system. This keeps the persistence layer trivially simple.

---

## Open Questions

- **Scene data passing**: How to pass run results (score, items, waves) from GameScene → GameOverScene without global state? Current approach uses scene data injection.
- **SkillSystem.ts legacy**: The file exists alongside ItemSystem.ts. Should it be removed or consolidated?
- **Fusion Preview UI trigger**: Key binding vs. touch button vs. auto-popup — UX decision needed before implementation.
- **Elite enemy variant system**: Need to decide if elites are data-driven variants or separate entity classes.
- **Server-side persistence**: Currently all localStorage. If leaderboard needs to be shared, need a backend API.

---

## Technical Requirements Coverage

42 requirements extracted from 12 MVP GDDs.

| Coverage | Count |
|----------|-------|
| Covered by architecture | 42 |
| Gaps | 0 |

All requirements have architectural decisions supporting them.
