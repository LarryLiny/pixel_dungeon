# 像素地牢 — Pixel Dungeon

Top-down auto-shooter Roguelike with 20 fusion weapon recipes and deep build variety.

## Technology Stack

- **Engine**: Phaser 3.80.1 (Arcade Physics)
- **Language**: TypeScript 5.5
- **Build System**: Vite 5.4
- **Asset Pipeline**: Procedural pixel art via Canvas 2D (pixelAssets.ts)

## Engine Version Reference

@docs/engine-reference/phaser/VERSION.md

## Technical Preferences

@.claude/docs/technical-preferences.md

## Project Structure

```
src/
├── entities/      # Player, Enemy, Bullet, Pickup
├── systems/       # AutoShoot, Spawn, Item, Fusion, Wave, Score, etc.
├── scenes/        # Boot, Menu, Game, Shop, GameOver, Leaderboard
├── data/          # Items, enemies, waves, fragments, fusionRecipes
├── ui/            # HUD, VirtualJoystick
└── utils/         # pixelAssets, helpers, leaderboard
```

## Coordination Rules

- **User-driven collaboration** — ask before writing/editing
- **No auto-commits** — commit only when user requests
- **One change at a time** — show diffs before applying
- Review mode: Solo (no director gates)

## Coding Standards

- TypeScript strict mode
- No `any` types unless unavoidable (add `// eslint-disable-next-line` comment)
- Entity-Component style: entities own their data, systems operate on them
- Pixel art constants in pixelAssets.ts, game constants in constants.ts
- Chinese UI text, English code identifiers
