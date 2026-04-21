# ADR-0002: Entity Lifecycle Management

## Status
Accepted

## Context
The game creates many short-lived entities (bullets, enemies, pickups). Without careful lifecycle management, we risk memory leaks, frame drops, and zombie entities. What pattern should govern entity creation, usage, and destruction?

## Decision
**Phaser Groups with object pooling for bullets, create-and-destroy for enemies and pickups.**

### Bullets — Object Pool
```typescript
// Group configured with maxSize for automatic recycling
this.bullets = this.physics.add.group({
  classType: Bullet,
  runChildUpdate: false,
  maxSize: MAX_BULLETS,  // 80
});

// Acquire from pool
const bullet = this.bullets.get(x, y) as Bullet;

// Return to pool (NOT destroy)
bullet.recycle();  // Sets inactive, invisible, disables body
```

- Bullets are never `destroy()`ed — only `recycle()`d
- When pool is full, oldest active bullet is recycled to make room
- `runChildUpdate: false` — AutoShootSystem manages updates manually

### Enemies — Create and Destroy
```typescript
// Created via Phaser group (no maxSize — dynamic count)
const enemy = new Enemy(scene, x, y, data);
this.enemies.add(enemy);
enemy.initBody();

// Destroyed when dead (after cleanup timer)
enemy.die();  // Sets inactive + invisible
// Later: removed from group by cleanupEnemies()
```

- Enemies are created on demand (no pre-allocation)
- Dead enemies cleaned up every 2 seconds
- Hard cap: 25 active enemies (MAX_ENEMIES)
- `scored` flag prevents double-processing

### Pickups — Create and Destroy
- Same pattern as enemies
- Hard cap: 15 active pickups (MAX_PICKUPS)
- Three types: item, potion, fragment

### Invariant
- Never call `destroy()` on pooled entities (bullets)
- Always call `die()` on enemies before cleanup (sets state flags)
- `scored` flag must be checked before processing kills

## Consequences
- **Pro**: Bullets have zero GC pressure — pooled and recycled
- **Pro**: Enemies/pickups are simple — create when needed, destroy when done
- **Con**: Must manually call `initBody()` after adding enemy to group (Phaser quirk)
- **Con**: Cleanup timer adds 2s delay before dead entities are removed from group

## Engine Compatibility
- `Phaser.Physics.Arcade.Group` with `maxSize`: Stable since Phaser 3.0
- `group.get()`: Returns null when pool exhausted — must handle gracefully
- `body.enable = false`: Disables physics without removing from group

## GDD Requirements Addressed
- TR-bull-001: Object pool max 80 bullets
- TR-perf-001: 60fps target with pooled entities
- TR-perf-002: Object pooling for bullets
