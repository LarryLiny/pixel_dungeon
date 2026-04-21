# Bug Report: Player Movement Stutter (Fast-Slow-Fast-Slow)

- **ID**: BUG-017
- **Title**: Player movement stutters (repeated fast-slow-fast-slow) during combat
- **Severity**: S2
- **Frequency**: Often (during any combat with frequent kills)
- **Build**: 4ab595f (main)
- **Platform**: All (Web/Mobile)
- **Reporter**: qa-tester
- **Date**: 2026-04-17

---

## Steps to Reproduce

1. Start a new game
2. Survive until wave 3+ (enemies spawn frequently)
3. Hold a movement key (e.g., W) continuously
4. Observe player movement while kills are happening

### Expected Behavior

Player moves at a constant, smooth speed while holding a movement direction. Visual movement should be uniform with no perceptible speed changes unless the player is hit.

### Actual Behavior

Player movement visibly stutters in a fast-slow-fast-slow pattern. The player moves at full speed for a moment, then slows noticeably, then speeds up again. This repeats irregularly and correlates with enemy kills.

---

## Root Cause Analysis

There are **two contributing root causes** that compound each other. The primary cause is the `physics.world.timeScale` slow-mo effect; the secondary cause is the knockback velocity override.

### Root Cause #1 (Primary): physics.world.timeScale Slow-Mo Affects Player Movement

**File**: `src/systems/CombatFeedbackSystem.ts`

Every time an enemy is killed by a weapon bullet, `onKill()` is called:

```typescript
// CombatFeedbackSystem.ts, line 68-78
onKill(heavy: boolean = false) {
    // Prevent stacking -- only apply if not already in slow-mo
    if (this.slowMoTimer > 0) return;
    const duration = heavy ? 150 : 80;
    const scale = heavy ? 0.3 : 0.5;
    this.scene.physics.world.timeScale = scale;   // <-- SLOWS ALL PHYSICS
    this.slowMoTimer = duration;
}
```

This sets the entire Arcade Physics world `timeScale` to 0.3 or 0.5. In Phaser 3 Arcade Physics, `timeScale` multiplies the physics step delta, which means **all physics bodies move at 30-50% speed** -- including the player.

The timer counts down in `update()` (line 22-27):

```typescript
// CombatFeedbackSystem.ts, line 22-27
if (this.slowMoTimer > 0) {
    this.slowMoTimer -= delta;
    if (this.slowMoTimer <= 0) {
        this.scene.physics.world.timeScale = 1.0;
        this.slowMoTimer = 0;
    }
}
```

**Critical timing problem**: `CombatFeedbackSystem.update()` is called at the **end** of `GameScene.update()` (line 388), but `player.update()` is called at line 304. This means:

1. Player sets its velocity in `player.update()` (Player.ts line 142)
2. Phaser physics step runs AFTER `GameScene.update()` completes
3. The physics step uses whatever `timeScale` is current at that point
4. `combatFeedback.update()` restores `timeScale = 1.0` at line 25, but this restoration only takes effect on the **next** physics step

The stutter pattern emerges because:
- **Fast frames**: `timeScale = 1.0`, player moves at full speed (160 px/s * 1.0 delta)
- **Slow frames**: `timeScale = 0.3-0.5`, player moves at 48-80 px/s
- Normal kills trigger slow-mo for 80ms (~5 frames at 60fps)
- Heavy kills (crits, damage > 20) trigger slow-mo for 150ms (~9 frames)

During wave 3+ with 5+ enemies dying in quick succession, the player experiences repeated slow-mo pulses even though the anti-stacking guard (`if (this.slowMoTimer > 0) return`) prevents overlap. Each kill starts a fresh slow-mo window after the previous one ends.

**Additional trigger paths**: Slow-mo is triggered from **two separate code paths**:
- `GameScene.onBulletHitEnemy()` at line 521: `this.combatFeedback.onKill(isCrit)`
- `GameScene` constructor at line 97: `this.shootSystem.onWeaponKill` callback also calls `this.combatFeedback.onKill(false)`

A single enemy kill can trigger `onKill()` from the `onWeaponKill` callback (line 97), and then `onBulletHitEnemy` attempts a second call at line 521. The stacking guard prevents the second call, but the first still applies slow-mo.

### Root Cause #2 (Secondary): Knockback Overrides Player Velocity for Multiple Frames

**File**: `src/scenes/GameScene.ts`, lines 605-628

When an enemy overlaps the player, `onEnemyHitPlayer` is invoked by the Phaser physics overlap system. This runs **outside** the `GameScene.update()` loop -- it is called during the physics step itself:

```typescript
// GameScene.ts, lines 622-625
const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
if (playerBody) {
    playerBody.setVelocity((dx / len) * 150, (dy / len) * 150);
}
```

This sets the player body velocity to a knockback vector (150 px/s magnitude). The comment on line 621 says "player update will override velocity next frame", but this is **incorrect** because:

1. `onEnemyHitPlayer` fires during the physics step (after `GameScene.update()` returns)
2. The knockback velocity persists through the physics step
3. On the **next** frame, `GameScene.update()` calls `player.update()` at line 304, which does override velocity
4. However, the player has already moved in the wrong direction for 1 frame

When combined with slow-mo (Root Cause #1), this is worse: the knockback velocity is applied and then persists for multiple physics steps because `timeScale` is reduced, effectively stretching the knockback effect.

### Interaction Diagram

```
Frame N (kill happens):
  GameScene.update() {
    player.update()          -> sets velocity to (160, 0)     [line 304]
    combatFeedback.update()  -> timeScale still 1.0           [line 388]
  }
  Physics step               -> timeScale = 1.0, player moves normally
  onBulletHitEnemy callback  -> onKill() sets timeScale = 0.5 [line 521/97]

Frame N+1 (slow-mo active):
  GameScene.update() {
    player.update()          -> sets velocity to (160, 0)     [line 304]
    combatFeedback.update()  -> slowMoTimer ticking down       [line 388]
  }
  Physics step               -> timeScale = 0.5, player only moves 80 px/s  <-- STUTTER

Frame N+5 (slow-mo ends):
  GameScene.update() {
    player.update()          -> sets velocity to (160, 0)     [line 304]
    combatFeedback.update()  -> slowMoTimer <= 0, timeScale = 1.0 [line 25]
  }
  Physics step               -> timeScale = 1.0, player moves 160 px/s  <-- RECOVERY
```

If another kill happens at Frame N+6, the cycle repeats.

---

## Severity Justification

**S2** -- This is a high-impact gameplay feel issue. Movement stutter is one of the most perceptible quality problems in an action game. It makes the game feel janky, reduces player confidence in controls, and creates a perception of poor performance. It does not prevent gameplay (not S1), but it significantly degrades the experience during the core gameplay loop (combat + movement).

---

## Suggested Fix

### Fix A (Recommended): Exclude Player from Slow-Mo

The slow-mo effect should only apply to enemies and bullets, not the player. There are two approaches:

**Approach A1: Restore player velocity after slow-mo by multiplying speed**

In `Player.ts`, compensate for `timeScale` in the velocity calculation:

```typescript
// Player.ts, update() method, line 138-142
update(time: number, _delta: number) {
    if (!this.isAlive) return;

    const timeScale = this.scene.physics.world.timeScale || 1;
    const speed = PLAYER_SPEED * this.modifiers.speedMul / timeScale;
    this.setVelocity(this.moveDir.x * speed, this.moveDir.y * speed);
    // ... rest of update
}
```

This divides the target speed by the current timeScale, so when physics multiplies by timeScale, the net effect is normal speed. This is the simplest fix.

**Approach A2: Use a separate slow-mo mechanism that skips the player**

Replace `physics.world.timeScale` with per-body velocity scaling. Apply slow-mo only to enemies and bullets. This is more invasive but architecturally cleaner.

### Fix B (Recommended alongside Fix A): Prevent Knockback from Persisting

In `onEnemyHitPlayer`, use a delayed call to reset player velocity instead of relying on the next frame:

```typescript
// GameScene.ts, onEnemyHitPlayer, after line 625
this.time.delayedCall(1, () => {
    if (this.player.isAlive) {
        const speed = PLAYER_SPEED * this.player.modifiers.speedMul;
        this.player.setVelocity(
            this.player.moveDir.x * speed,
            this.player.moveDir.y * speed
        );
    }
});
```

Alternatively, flag the player as "recently knocked back" and skip one velocity override in `player.update()`.

### Fix C (Optional): Reduce Slow-Mo Duration

The 80ms / 150ms durations may be too long for frequent combat. Consider reducing to 40ms / 80ms, or making the effect purely visual (camera shake + flash) without touching `physics.world.timeScale`.

---

## Regression Checklist: BUG-017

After applying fix, verify:

- [ ] Player moves at constant speed while holding a movement key
- [ ] Slow-mo visual effect still plays on kills (camera flash)
- [ ] Enemy death animations still play (slowed or instant, per design intent)
- [ ] Player knockback from enemy hits still works (brief push, then resume control)
- [ ] Shield orb collision still knocks enemies away correctly
- [ ] Chain lightning kills do not stack slow-mo
- [ ] Multiple rapid kills (wave 5+) produce smooth movement
- [ ] Boomerang/orb kills (via onWeaponKill callback) do not double-trigger slow-mo
- [ ] Mobile joystick movement is also smooth during combat
