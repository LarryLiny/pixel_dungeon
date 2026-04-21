# ADR-0004: Collision Architecture

## Status
Accepted

## Context
The game has multiple collision types: bullet→enemy, enemy→player, player→pickup, all→walls. Each collision type triggers different game logic (damage, kill, pickup, physics bounce). Who owns the collision handlers and how are kill events propagated?

## Decision
**GameScene owns all collision handlers as the mediator. Kill events propagate via callback functions on AutoShootSystem.**

### Collision Registration (in GameScene.create())
```typescript
// Bullet → Enemy
this.physics.add.overlap(this.bullets, this.enemies, (bulletObj, enemyObj) => {
  const bullet = bulletObj as Bullet;
  const enemy = enemyObj as Enemy;
  // Damage, status effects, chain lightning, splash, execute...
  bullet.onHitEnemy();
});

// Enemy → Player
this.physics.add.overlap(this.enemies, this.player, (enemyObj) => {
  this.player.takeDamage((enemyObj as Enemy).enemyData.damage);
  this.combatFeedback.onHit();
});

// Player → Pickup
this.physics.add.overlap(this.player, this.pickups, (playerObj, pickupObj) => {
  // Item/potion/fragment collection
});

// Player/Enemies/Bullets → Walls
this.physics.add.collider(this.player, this.walls);
this.physics.add.collider(this.enemies, this.walls);
this.physics.add.collider(this.bullets, this.walls, (bulletObj) => {
  (bulletObj as Bullet).recycle();
});
```

### Kill Event Propagation
AutoShootSystem has two callback slots:
- `onOrbKill`: Fired when an orbiting orb kills an enemy
- `onWeaponKill`: Fired when any weapon (bullet, lightning, laser, etc.) kills an enemy

GameScene sets these callbacks:
```typescript
this.shootSystem.onOrbKill = (enemy) => {
  if (enemy.scored) return;
  enemy.scored = true;
  this.scoreSystem.addKill(enemy.score);
  this.onEnemyKilled(enemy);  // Drops, fragments, etc.
};

this.shootSystem.onWeaponKill = (enemy) => {
  if (enemy.scored) return;
  enemy.scored = true;
  this.scoreSystem.addKill(enemy.score);
  this.onEnemyKilled(enemy);
  this.combatFeedback.onKill(false);
  this.combatFeedback.deathExplosion(enemy.x, enemy.y, 0xffaa44, 4);
};
```

### Double-Kill Prevention
The `enemy.scored` boolean flag prevents the same enemy from being scored twice when multiple damage sources hit in the same frame (e.g., bullet + splash + chain lightning).

## Consequences
- **Pro**: GameScene is the single place to understand all collision handling
- **Pro**: Systems don't need references to each other — callbacks provide loose coupling
- **Pro**: `scored` flag is a simple, effective double-kill guard
- **Con**: GameScene is a large orchestrator (~662 lines) — could be split but current scope is manageable
- **Con**: Collision handler is a complex function with many branches (chain lightning, splash, execute, boomerang)

## Engine Compatibility
- `physics.add.overlap()`: Stable since Phaser 3.0
- `physics.add.collider()`: Stable since Phaser 3.0
- Callback signature `(obj1, obj2)`: No changes in 3.80

## GDD Requirements Addressed
- TR-dung-004: Wall collision for all entities
- TR-bull-003: Status effect application on hit
- TR-bull-002: Pierce, chain, splash, boomerang behaviors
