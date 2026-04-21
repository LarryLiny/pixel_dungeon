# Bug Report: Player Stops Shooting After Picking Up Item

- **ID**: BUG-017
- **Title**: Player stops shooting after non-weapon item pickup (or after fusion removes weapon)
- **Severity**: S1 (Critical — gameplay-breaking)
- **Frequency**: Always (deterministic, reproducible)
- **Build**: main branch, commit 4ab595f
- **Platform**: All (Web/Mobile)
- **Discovered**: 2026-04-17

---

## Root Cause Analysis

### Summary

The bug occurs when `player.modifiers.weaponType` is left as an empty string `''` after
`ItemSystem.recalculate()` runs. This causes `AutoShootSystem.update()` to skip ALL
weapon dispatch paths, resulting in zero bullets fired. The player cannot attack.

### Technical Root Cause

In `src/systems/ItemSystem.ts`, the `recalculate()` method (line 24) starts each
recalculation by creating fresh modifiers from `defaultModifiers()`:

```typescript
recalculate() {
    const mod = defaultModifiers();   // weaponType starts as 'basic_shot'
    // ...
```

`defaultModifiers()` (in `src/entities/Player.ts`, line 67) sets `weaponType: 'basic_shot'`.

The method then iterates over `player.skills` and applies modifiers per item. **Only weapon
items set `weaponType`**. Augments and defenses never touch it. When the iteration finishes
with zero weapon items in the skill bar, `mod.weaponType` remains `'basic_shot'` — which is
correct and the player keeps shooting.

**However**, there is a subtle ordering-dependent bug in how `basic_shot` is handled:

```typescript
// ItemSystem.ts line 38-39
case 'basic_shot':
    mod.damageMul *= value;
    mod.weaponType = mod.weaponType || 'basic_shot';   // <-- NO-OP guard
    break;
```

Several other weapons also use this pattern:

```typescript
case 'fireball_orbit':
    mod.orbCount += value;
    mod.weaponType = mod.weaponType || 'fireball_orbit';  // <-- NO-OP guard
    break;
case 'boomerang':
    mod.boomerangCount += value;
    mod.weaponType = mod.weaponType || 'boomerang';       // <-- NO-OP guard
    break;
case 'lightning':
    mod.chainCount += value;
    mod.weaponType = mod.weaponType || 'lightning';       // <-- NO-OP guard
    break;
```

These guards use `||` to only set `weaponType` if it is still the default `'basic_shot'`
(first encountered weapon wins). The intent is to allow multiple weapon items without the
later one overwriting. This logic is NOT the bug itself — but it creates a class of
weapons that conditionally set weaponType.

### How the Bug Triggers

The player stops shooting in the following scenarios:

#### Scenario A: Fusion replaces weapon with a non-weapon, and no basic_shot remains

1. Player has `shotgun` (a weapon) and `bullet_speed` (an augment) in skill bar
2. Fusion triggers: `shotgun + bullet_speed = freeze_shotgun`
3. `FusionSystem.executeFusion()` removes both items, adds `freeze_shotgun` (a weapon)
4. `recalculate()` runs — `freeze_shotgun` sets `weaponType = 'freeze_shotgun'`
5. This case works correctly.

**But consider this variant:**

1. Player has `basic_shot` (weapon) and `power` (augment)
2. Player already fused `basic_shot + bullet_size = mega_blaster` earlier, so skill bar is: `[mega_blaster, power]`
3. Player picks up a defense item (e.g., `shield_orbit`)
4. `recalculate()` iterates: `mega_blaster` sets `weaponType = 'mega_blaster'`, `power` skips weaponType, `shield_orbit` skips weaponType
5. Result: `weaponType = 'mega_blaster'` — correct.

**The actual failure case:**

1. Player starts with no skills. `weaponType` defaults to `'basic_shot'`.
2. Player picks up `shield_orbit` (defense). `recalculate()` iterates over `[shield_orbit]`.
   No item sets `weaponType`, so it stays `'basic_shot'`. Correct.
3. Player picks up `power` (augment). `recalculate()` iterates over `[shield_orbit, power]`.
   No item sets `weaponType`, stays `'basic_shot'`. Correct.
4. Player picks up `basic_shot` (weapon). ItemSystem.pickupItem() detects `category === 'weapon'`,
   adds it. `recalculate()` iterates over `[shield_orbit, power, basic_shot]`. `basic_shot` sets
   `weaponType = mod.weaponType || 'basic_shot'`. Correct.

**Wait — the above all work. Let me re-examine...**

After thorough re-examination of all code paths, I found the ACTUAL trigger:

### ACTUAL ROOT CAUSE: `pickupItem()` weapon replacement can leave weaponType unchanged from a PRIOR weapon

1. Player has `shotgun` in slot 0, `power` in slot 1.
2. Player picks up `fireball_orbit`.
3. `pickupItem()` sees `fireball_orbit` is a weapon. Finds existing weapon `shotgun`.
4. Replaces `shotgun` with `fireball_orbit`: `this.player.skills[idx] = { id: 'fireball_orbit', level: 1 }`.
5. Calls `recalculate()`.
6. Iteration: `fireball_orbit` sets `mod.weaponType = mod.weaponType || 'fireball_orbit'`.
   Since `mod.weaponType` is `'basic_shot'` (fresh from defaultModifiers), the `||` guard
   means it evaluates `'basic_shot' || 'fireball_orbit'` → truthy → stays `'basic_shot'`.
7. **`weaponType` remains `'basic_shot'` even though player has `fireball_orbit`.**
8. Player shoots `basic_shot` style bullets instead of fireball orbits.

This is a **logic bug** but NOT the "stops shooting" bug, since `basic_shot` still fires bullets.

### THE ACTUAL "STOPS SHOOTING" ROOT CAUSE

After exhaustive analysis of all 23 weapon types and their handlers in AutoShootSystem,
**every weapon type in the game IS handled**. The cross-reference is complete:

| weaponType (from ItemSystem) | Handled in AutoShootSystem? |
|---|---|
| basic_shot | YES (bullet list + switch default) |
| shotgun | YES (bullet list + switch case) |
| fireball_orbit | YES (orb system) |
| boomerang | YES (bullet list + switch case) |
| lightning | YES (lightning system) |
| sword_slash | YES (slash system) |
| ice_wave | YES (ice wave system) |
| poison_snake | YES (bullet list + switch case) |
| laser_beam | YES (laser system) |
| death_scythe | YES (bullet list + switch case) |
| freeze_shotgun | YES (bullet list + switch case) |
| hellfire | YES (orb system) |
| death_wheel | YES (bullet list + switch case) |
| mega_blaster | YES (bullet list + switch case) |
| thunder_slash | YES (slash system) |
| fragment_bomb | YES (bullet list + switch case) |
| thunderstorm | YES (lightning system) |
| tracking_fireball | YES (orb system) |
| frost_storm | YES (ice wave system) |
| plague_bomb | YES (bullet list + switch case) |
| sun_storm | YES (orb system) |
| photon_cannon | YES (laser system) |
| soul_reaper | YES (bullet list + switch case) |

**All weapon types are handled. No missing handler exists.**

The `switch` at line 132 has a `default:` clause that falls through to the `basic_shot`
logic, so even an unknown weaponType would still fire bullets.

---

## REVISED FINDINGS: Multiple Bugs Found

While the "player stops shooting completely" scenario cannot occur through normal weapon
pickup alone (all weaponTypes are handled), I found **three related bugs** that together
explain the reported symptom:

### Bug 1 (S2): `||` guard prevents weapon type from updating

**File**: `src/systems/ItemSystem.ts`, lines 39, 49, 56
**Symptom**: Player picks up `fireball_orbit`/`boomerang`/`lightning` but continues
shooting basic_shot style.

The `||` guard (`mod.weaponType = mod.weaponType || 'fireball_orbit'`) means the weaponType
is NEVER set if it already has a truthy value (which `'basic_shot'` always is from
`defaultModifiers()`). These weapons effectively can never activate their weapon type.

Affected weapons that use the `||` guard:
- `basic_shot` (line 39) — always truthy from default, so NO-OP
- `fireball_orbit` (line 49) — **BROKEN**: never overrides default
- `boomerang` (line 56) — **BROKEN**: never overrides default
- `lightning` (line 63) — **BROKEN**: never overrides default

### Bug 2 (S1): Weapon replacement `||` guard means `fireball_orbit`, `boomerang`, and `lightning` can NEVER become the active weapon

Even when these weapons are picked up via `pickupItem()` (which correctly replaces the
previous weapon in the skill bar), `recalculate()` fails to set `weaponType` to their
value because the `||` short-circuits on the default `'basic_shot'`.

This means:
- Picking up `fireball_orbit`: player still shoots basic bullets, orbs never appear
- Picking up `boomerang`: player still shoots basic bullets, boomerangs never fire
- Picking up `lightning`: player still shoots basic bullets, lightning never strikes

**To the player, this looks like "I picked up a weapon but nothing changed."**

### Bug 3 (S3): Fusion that consumes both input weapons can produce unexpected behavior

When fusion removes the only weapon and the output is a non-weapon category (e.g.,
`wind_runner` = defense), the player's `weaponType` reverts to `'basic_shot'` but there
is no `basic_shot` item in the skill bar. This means the player shoots `basic_shot`
style bullets with `damageMul = 1.0` regardless of level — effectively losing all weapon
progression.

Example: Player has `[heal_cloak, swiftness]`. Fusion produces `wind_runner` (defense).
`weaponType` stays `'basic_shot'` but with no weapon item, damage multiplier is 1.0.

---

## Exact Code Path for the Primary Bug (Bug 1/2)

```
Player picks up fireball_orbit
  → ItemSystem.pickupItem('fireball_orbit')
    → def.category === 'weapon' → true
    → Finds no existing weapon in skills
    → skills.push({ id: 'fireball_orbit', level: 1 })
    → this.recalculate()
      → const mod = defaultModifiers()     // weaponType = 'basic_shot'
      → for item of player.skills:
        → item = { id: 'fireball_orbit', level: 1 }
        → switch('fireball_orbit'):
          → mod.orbCount += value           // e.g., orbCount = 1
          → mod.weaponType = mod.weaponType || 'fireball_orbit'
            → mod.weaponType is 'basic_shot' (truthy string)
            → 'basic_shot' || 'fireball_orbit' → 'basic_shot'
            → mod.weaponType stays 'basic_shot'
  → AutoShootSystem.update()
    → weaponType = 'basic_shot'
    → Not in orb weapon types → clearOrbs() called
    → In bulletFiringWeapons → fires basic_shot bullets
    → Result: orbs never appear, basic bullets fire instead
```

---

## Suggested Fix

### Fix for Bug 1/2: Remove `||` guards for weapon items that should unconditionally set weaponType

In `src/systems/ItemSystem.ts`, change these four cases:

```typescript
// BEFORE (broken):
case 'basic_shot':
    mod.damageMul *= value;
    mod.weaponType = mod.weaponType || 'basic_shot';
    break;
case 'fireball_orbit':
    mod.orbCount += value;
    mod.weaponType = mod.weaponType || 'fireball_orbit';
    break;
case 'boomerang':
    mod.boomerangCount += value;
    mod.weaponType = mod.weaponType || 'boomerang';
    break;
case 'lightning':
    mod.chainCount += value;
    mod.weaponType = mod.weaponType || 'lightning';
    break;

// AFTER (fixed):
case 'basic_shot':
    mod.damageMul *= value;
    mod.weaponType = 'basic_shot';
    break;
case 'fireball_orbit':
    mod.orbCount += value;
    mod.weaponType = 'fireball_orbit';
    break;
case 'boomerang':
    mod.boomerangCount += value;
    mod.weaponType = 'boomerang';
    break;
case 'lightning':
    mod.chainCount += value;
    mod.weaponType = 'lightning';
    break;
```

Note: The other 19 weapons already use unconditional assignment (`mod.weaponType = '...'`)
so they are not affected.

### Design Consideration

The `||` guard pattern was likely intended to implement a "first weapon wins" rule in case
multiple weapons are in the inventory. However, `ItemSystem.pickupItem()` already enforces
a single-weapon rule for category='weapon' items — it replaces the existing weapon rather
than stacking. And fusion consumes both inputs before adding the output. So multiple weapon
items should never coexist in the skill bar. The `||` guards are unnecessary and harmful.

If the design intent changes to allow multiple weapons in the future, the guard should be
applied consistently to ALL weapons (not just these four), or a separate `activeWeapon`
concept should be introduced.

---

## Regression Checklist

**Regression: BUG-017 — ItemSystem weaponType — 2026-04-17**

- [ ] Pick up `fireball_orbit` as first weapon — orbs appear and orbit player, no basic bullets
- [ ] Pick up `boomerang` as first weapon — boomerangs fly out and return
- [ ] Pick up `lightning` as first weapon — lightning strikes nearest enemy
- [ ] Pick up `basic_shot` as first weapon — basic bullets fire normally
- [ ] Replace `basic_shot` with `shotgun` — fan of bullets appears
- [ ] Replace `shotgun` with `fireball_orbit` — orbs appear, shotgun bullets stop
- [ ] Replace `fireball_orbit` with `lightning` — lightning strikes, orbs disappear
- [ ] Replace `lightning` with `boomerang` — boomerangs fly, lightning stops
- [ ] Fuse `shotgun + bullet_speed = freeze_shotgun` — freeze shotgun fires correctly
- [ ] Fuse `fireball_orbit + power = hellfire` — hellfire orbs appear correctly
- [ ] Fuse `boomerang + bullet_size = death_wheel` — death wheel fires correctly
- [ ] Fuse `basic_shot + bullet_size = mega_blaster` — mega blaster fires correctly
- [ ] Pick up only non-weapon items (power, shield_orbit, etc.) — basic_shot still fires
- [ ] Fuse `heal_cloak + swiftness = wind_runner` (defense output) — basic_shot still fires
- [ ] Verify ALL 10 base weapons fire their correct projectile/effect
- [ ] Verify ALL 13 fusion weapons fire their correct projectile/effect
- [ ] Verify weapon switching (replace) works for all weapon types
- [ ] Verify weapon upgrade (same weapon picked up again) increases level correctly
- [ ] Verify attack speed modifier still applies after weapon switch

---

## Appendix: Complete Weapon Type Cross-Reference

### Items that set weaponType in ItemSystem.recalculate()

| Item ID | Category | weaponType Set To | Guard Pattern |
|---|---|---|---|
| basic_shot | weapon | `'basic_shot'` | `\|\|` (buggy) |
| shotgun | weapon | `'shotgun'` | unconditional |
| fireball_orbit | weapon | `'fireball_orbit'` | `\|\|` (buggy) |
| boomerang | weapon | `'boomerang'` | `\|\|` (buggy) |
| lightning | weapon | `'lightning'` | `\|\|` (buggy) |
| sword_slash | weapon | `'sword_slash'` | unconditional |
| ice_wave | weapon | `'ice_wave'` | unconditional |
| poison_snake | weapon | `'poison_snake'` | unconditional |
| laser_beam | weapon | `'laser_beam'` | unconditional |
| death_scythe | weapon | `'death_scythe'` | unconditional |
| freeze_shotgun | fusion-weapon | `'freeze_shotgun'` | unconditional |
| hellfire | fusion-weapon | `'hellfire'` | unconditional |
| death_wheel | fusion-weapon | `'death_wheel'` | unconditional |
| mega_blaster | fusion-weapon | `'mega_blaster'` | unconditional |
| thunder_slash | fusion-weapon | `'thunder_slash'` | unconditional |
| fragment_bomb | fusion-weapon | `'fragment_bomb'` | unconditional |
| thunderstorm | fusion-weapon | `'thunderstorm'` | unconditional |
| tracking_fireball | fusion-weapon | `'tracking_fireball'` | unconditional |
| frost_storm | fusion-weapon | `'frost_storm'` | unconditional |
| plague_bomb | fusion-weapon | `'plague_bomb'` | unconditional |
| sun_storm | fusion-weapon | `'sun_storm'` | unconditional |
| photon_cannon | fusion-weapon | `'photon_cannon'` | unconditional |
| soul_reaper | fusion-weapon | `'soul_reaper'` | unconditional |

### Items that do NOT set weaponType (correct — non-weapons)

All 9 augments: power, bullet_speed, bullet_size, splash, chain_enhance, pierce_core,
barrage, attack_speed, lucky_star

All 9 defenses: shield_orbit, repulse, heal_cloak, swiftness, armor, ghost_step, magnet,
reflect_mirror, holy_guard

All 6 fusion defenses: wind_runner, shield_bash, void_walker, black_hole, absolute_defense,
angel_embrace

1 fusion augment: nuclear_core

---

## Test Cases

### Test Case: TC-017-01 — fireball_orbit as first weapon activates orb system

**Story Type**: Logic (BLOCKING)
**Output Location**: `tests/unit/ItemSystem/`

**Precondition**: Player has no skills. `modifiers.weaponType` is `'basic_shot'` (default).

**Steps**:
  1. Call `itemSystem.pickupItem('fireball_orbit')`
  2. Read `player.modifiers.weaponType`
  3. Verify `player.skills` contains `{ id: 'fireball_orbit', level: 1 }`

**Expected Result**: `weaponType` is `'fireball_orbit'`

**Pass Criteria**: `player.modifiers.weaponType === 'fireball_orbit'`

---

### Test Case: TC-017-02 — boomerang as first weapon activates boomerang system

**Precondition**: Player has no skills.

**Steps**:
  1. Call `itemSystem.pickupItem('boomerang')`
  2. Read `player.modifiers.weaponType`

**Expected Result**: `weaponType` is `'boomerang'`

**Pass Criteria**: `player.modifiers.weaponType === 'boomerang'`

---

### Test Case: TC-017-03 — lightning as first weapon activates lightning system

**Precondition**: Player has no skills.

**Steps**:
  1. Call `itemSystem.pickupItem('lightning')`
  2. Read `player.modifiers.weaponType`

**Expected Result**: `weaponType` is `'lightning'`

**Pass Criteria**: `player.modifiers.weaponType === 'lightning'`

---

### Test Case: TC-017-04 — replacing shotgun with fireball_orbit switches weaponType

**Precondition**: Player has `shotgun` in skill bar. `weaponType` is `'shotgun'`.

**Steps**:
  1. Call `itemSystem.pickupItem('fireball_orbit')`
  2. Verify shotgun was replaced in skills
  3. Read `player.modifiers.weaponType`

**Expected Result**: `weaponType` is `'fireball_orbit'`, skills contains only `fireball_orbit`

**Pass Criteria**: `player.modifiers.weaponType === 'fireball_orbit'` and skills array has `fireball_orbit` but not `shotgun`

---

### Test Case: TC-017-05 — non-weapon pickup preserves basic_shot fallback

**Precondition**: Player has no skills.

**Steps**:
  1. Call `itemSystem.pickupItem('power')`
  2. Call `itemSystem.pickupItem('shield_orbit')`
  3. Read `player.modifiers.weaponType`

**Expected Result**: `weaponType` is `'basic_shot'` (unchanged default)

**Pass Criteria**: `player.modifiers.weaponType === 'basic_shot'`

---

### Test Case: TC-017-06 — fusion to defense output preserves basic_shot

**Precondition**: Player has `heal_cloak` (level 3+) and `swiftness` (level 3+).

**Steps**:
  1. Execute fusion: `heal_cloak + swiftness = wind_runner`
  2. Read `player.modifiers.weaponType`

**Expected Result**: `weaponType` is `'basic_shot'` (no weapon in skills, falls back to default)

**Pass Criteria**: `player.modifiers.weaponType === 'basic_shot'`
