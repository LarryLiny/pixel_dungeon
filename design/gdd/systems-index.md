# Systems Index: 千刃地牢 (Blade Storm Dungeon)

> **Status**: Approved
> **Created**: 2026-04-16
> **Last Updated**: 2026-04-16
> **Source Concept**: design/gdd/game-concept.md

---

## Overview

千刃地牢是一个俯视角自动射击 Roguelike，核心循环是「躲避敌人 → 自动射击杀敌 → 拾取掉落 → 评估当前 Build」。20 种武器、20 种融合配方提供了上百种 Build 组合。系统拆解覆盖 24 个子系统，从地牢生成到元进度追踪，按依赖关系分为 5 层。当前所有 20 个基础系统已实现并上线，4 个缺失系统（融合预览 UI、Build 分析、精英敌人、平衡/Meta 追踪）待开发。

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Dungeon Generation | Core | MVP | Implemented | design/gdd/dungeon-generation.md | — |
| 2 | Player Entity | Core | MVP | Implemented | design/gdd/player-entity.md | — |
| 3 | Enemy AI | Gameplay | MVP | Implemented | design/gdd/enemy-ai.md | Dungeon Generation |
| 4 | Bullet System | Core | MVP | Implemented | design/gdd/bullet-system.md | Player Entity |
| 5 | Auto-Shoot System | Gameplay | MVP | Implemented | design/gdd/auto-shoot-system.md | Player Entity, Bullet System, Enemy AI |
| 6 | Item System | Economy | MVP | Implemented | design/gdd/item-system.md | Player Entity |
| 7 | Fusion System | Economy | MVP | Implemented | design/gdd/fusion-system.md | Item System |
| 8 | Wave System | Gameplay | MVP | Implemented | design/gdd/wave-system.md | — |
| 9 | Spawn System | Gameplay | MVP | Implemented | design/gdd/spawn-system.md | Dungeon Generation, Enemy AI |
| 10 | Fusion Preview UI | UI | MVP | Not Started | design/gdd/fusion-preview-ui.md | Fusion System, Item System |
| 11 | Combat Feedback | Meta | MVP | Implemented | design/gdd/combat-feedback.md | Player Entity, Enemy AI, Bullet System |
| 12 | HUD | UI | MVP | Implemented | design/gdd/hud.md | Player Entity, Item System, Wave System |
| 13 | Score System | Meta | Vertical Slice | Implemented | — | Enemy AI |
| 14 | Fragment System | Progression | Vertical Slice | Implemented | — | Enemy AI, Item System |
| 15 | Gold Economy | Economy | Vertical Slice | Implemented | — | Wave System, Score System |
| 16 | Build Analysis | UI | Vertical Slice | Not Started | — | Item System, Score System |
| 17 | Leaderboard | Persistence | Vertical Slice | Implemented | — | Score System |
| 18 | Upgrade System | Progression | Alpha | Implemented | — | Gold Economy, Player Entity |
| 19 | Daily Challenge System | Meta | Alpha | Implemented | — | Wave System, Score System, Item System |
| 20 | Shop UI | UI | Alpha | Implemented | — | Upgrade System, Gold Economy |
| 21 | Touch Input | Core | Alpha | Implemented | — | Player Entity |
| 22 | Menu / Flow | Core | Alpha | Implemented | — | All systems |
| 23 | Elite Enemies | Gameplay | Full Vision | Not Started | — | Enemy AI, Wave System, Spawn System |
| 24 | Balance / Meta Tracking | Meta | Full Vision | Not Started | — | Score System, Item System |

---

## Categories

| Category | Description | Systems |
|----------|-------------|---------|
| **Core** | Foundation systems everything depends on | Dungeon Generation, Player Entity, Bullet System, Touch Input, Menu/Flow |
| **Gameplay** | The systems that make the game fun | Enemy AI, Auto-Shoot System, Wave System, Spawn System, Elite Enemies |
| **Economy** | Resource creation and consumption | Item System, Fusion System, Gold Economy |
| **Progression** | How the player grows over time | Fragment System, Upgrade System |
| **Persistence** | Save state and continuity | Leaderboard |
| **UI** | Player-facing information displays | HUD, Fusion Preview UI, Build Analysis, Shop UI |
| **Meta** | Systems outside the core game loop | Combat Feedback, Score System, Daily Challenge System, Balance/Meta Tracking |

---

## Priority Tiers

| Tier | Definition | Systems | Target |
|------|------------|---------|--------|
| **MVP** | Core loop required — test "is this fun?" | 12 systems (10 implemented, 2 missing) | Core gameplay |
| **Vertical Slice** | Complete single-run experience | 5 systems (4 implemented, 1 missing) | Full run flow |
| **Alpha** | All features in rough form | 5 systems (all implemented) | Feature complete |
| **Full Vision** | Polish, extras, meta-analysis | 2 systems (all missing) | Release |

---

## Dependency Map

### Foundation Layer (no dependencies)

1. **Dungeon Generation** — Provides the spatial canvas for all gameplay
2. **Player Entity** — Central data object for HP, modifiers, movement
3. **Wave System** — Time-based progression, no gameplay dependencies
4. **Bullet System** — Projectile management framework (depends on Player only for ownership)

### Core Layer (depends on foundation)

1. **Enemy AI** — depends on: Dungeon Generation (tile-aware pathfinding)
2. **Spawn System** — depends on: Dungeon Generation (valid tiles), Enemy AI (spawning)
3. **Auto-Shoot System** — depends on: Player Entity (position), Bullet System (spawning), Enemy AI (targeting)
4. **Item System** — depends on: Player Entity (modifiers)
5. **Touch Input** — depends on: Player Entity (movement)

### Feature Layer (depends on core)

1. **Fusion System** — depends on: Item System (inventory check)
2. **Fragment System** — depends on: Enemy AI (drops), Item System (unlocks)
3. **Gold Economy** — depends on: Wave System (wave rewards), Score System (kill rewards)
4. **Score System** — depends on: Enemy AI (kill tracking)
5. **Upgrade System** — depends on: Gold Economy (spending), Player Entity (bonuses)
6. **Daily Challenge System** — depends on: Wave System, Score System, Item System
7. **Combat Feedback** — depends on: Player Entity, Enemy AI, Bullet System (triggers)

### Presentation Layer (depends on features)

1. **HUD** — depends on: Player Entity, Item System, Wave System
2. **Fusion Preview UI** — depends on: Fusion System, Item System
3. **Build Analysis** — depends on: Item System, Score System
4. **Shop UI** — depends on: Upgrade System, Gold Economy
5. **Leaderboard** — depends on: Score System

### Polish Layer (depends on everything)

1. **Elite Enemies** — depends on: Enemy AI, Wave System, Spawn System
2. **Balance / Meta Tracking** — depends on: Score System, Item System
3. **Menu / Flow** — depends on: All systems (scene orchestration)

---

## Recommended Design Order

| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|-------|--------|----------|-------|----------|-------------|
| 1 | Dungeon Generation | MVP | Foundation | game-designer | S |
| 2 | Player Entity | MVP | Foundation | game-designer | S |
| 3 | Enemy AI | MVP | Foundation | game-designer | M |
| 4 | Bullet System | MVP | Foundation | game-designer | S |
| 5 | Auto-Shoot System | MVP | Core | game-designer + systems-designer | L |
| 6 | Item System | MVP | Core | game-designer + systems-designer | L |
| 7 | Fusion System | MVP | Core | game-designer | M |
| 8 | Wave System | MVP | Core | game-designer | S |
| 9 | Spawn System | MVP | Core | game-designer | S |
| 10 | Fusion Preview UI | MVP | Presentation | ux-designer | M |
| 11 | Combat Feedback | MVP | Feature | game-designer | S |
| 12 | HUD | MVP | Presentation | ui-programmer | M |
| 13 | Score System | Vertical Slice | Feature | game-designer | S |
| 14 | Fragment System | Vertical Slice | Feature | game-designer | M |
| 15 | Gold Economy | Vertical Slice | Feature | game-designer | S |
| 16 | Build Analysis | Vertical Slice | Presentation | ux-designer | M |
| 17 | Leaderboard | Vertical Slice | Presentation | game-designer | S |
| 18 | Upgrade System | Alpha | Feature | game-designer | M |
| 19 | Daily Challenge System | Alpha | Feature | game-designer | M |
| 20 | Shop UI | Alpha | Presentation | ui-programmer | S |
| 21 | Touch Input | Alpha | Foundation | ui-programmer | S |
| 22 | Menu / Flow | Alpha | Foundation | game-designer | S |
| 23 | Elite Enemies | Full Vision | Feature | game-designer + systems-designer | M |
| 24 | Balance / Meta Tracking | Full Vision | Feature | analytics-engineer | M |

---

## Circular Dependencies

None found. The dependency graph is a clean DAG.

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| Auto-Shoot System | Scope | 10+ weapon types × 20+ fusion variants = massive balance surface | Per-weapon GDD with explicit tuning knobs; prototype each new variant |
| Item System | Design | 48 items × 9 levels = 432 data points to balance; pillar "无万金油" requires constant meta-shift | Counter-enemy types that punish meta builds; data-driven tuning |
| Fusion System | Design | 20 recipes must each produce "entirely different gameplay, not just stat buffs" (Pillar 1 design test) | Each fusion GDD includes a "how does this change gameplay?" test |
| Balance / Meta Tracking | Technical | Requires telemetry infrastructure not yet built | Start with localStorage-based tracking; upgrade to server-side post-launch |

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 24 |
| Systems implemented | 20 |
| Systems not started | 4 |
| Design docs started | 12 |
| Design docs reviewed | 0 |
| Design docs approved | 12 |
| MVP systems designed | 12/12 |
| Vertical Slice systems designed | 0/5 |
| Alpha systems designed | 0/5 |
| Full Vision systems designed | 0/2 |

---

## Next Steps

- [ ] Design MVP-tier systems (use `/design-system [system-name]`)
- [ ] Start with order #1: Dungeon Generation
- [ ] Run `/design-review` on each completed GDD
- [ ] Run `/gate-check pre-production` when MVP systems are designed
- [ ] Implement the 4 missing systems (Fusion Preview, Build Analysis, Elite Enemies, Balance/Meta)
