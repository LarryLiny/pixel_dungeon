# ADR-0001: Scene Communication Pattern

## Status
Accepted

## Context
Phaser scenes need to share data between transitions: GameScene → GameOverScene (run results), MenuScene → ShopScene (upgrade state), etc. How should data flow between scenes without introducing global state?

## Decision
**Scene data injection via Phaser's scene plugin.** Use `this.scene.start(key, data)` to pass data, and `this.scene.get(key)` for shared services.

### Pattern
```typescript
// Passing data TO a scene:
this.scene.start('GameOverScene', {
  score: this.scoreSystem.getScore(),
  kills: this.scoreSystem.getKillCount(),
  wave: this.waveSystem.currentWave,
  skills: this.player.skills.map(s => s.id),
});

// Receiving data IN a scene:
init(data: { score: number; kills: number; wave: number; skills: string[] }) {
  this.runData = data;
}

// Accessing shared state across scenes:
const fragmentSystem = new FragmentSystem(); // reads from localStorage
```

### For persistence-heavy systems
FragmentSystem, GoldSystem, and UpgradeSystem use localStorage directly. They don't need scene-to-scene data passing — each scene re-creates them from persisted state.

## Consequences
- **Pro**: No global state, no service locator anti-pattern
- **Pro**: Phaser-native pattern, well-documented
- **Con**: Scene data is transient — if the scene restarts, data is lost (acceptable for run data)
- **Con**: Shared systems (Fragment, Gold, Upgrade) re-read localStorage on each scene init

## Engine Compatibility
- `scene.start(key, data)`: Phaser 3.x stable API, no changes
- `scene.get(key)`: Stable since Phaser 3.0

## GDD Requirements Addressed
- TR-pers-001: localStorage for all persistence
