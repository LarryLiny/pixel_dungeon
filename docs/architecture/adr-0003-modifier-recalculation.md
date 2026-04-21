# ADR-0003: Modifier Recalculation Strategy

## Status
Accepted

## Context
The Player Entity has 30+ modifier fields (damageMul, speedMul, shotCount, orbCount, etc.) that are influenced by items, upgrades, and fusion outputs. When items change (pickup, upgrade, fusion), all modifiers must be updated correctly. Two approaches: incremental patching (modify only what changed) or full rebuild (recalculate everything from scratch).

## Decision
**Full rebuild on every item change.** The `ItemSystem.recalculate()` function starts from `defaultModifiers()` and iterates all skills in order, applying each item's effect sequentially.

### Pattern
```typescript
recalculate() {
  const mod = defaultModifiers();  // Start fresh

  for (const item of this.player.skills) {
    const value = getItemValue(item.id, item.level);
    switch (item.id) {
      case 'basic_shot':
        mod.damageMul *= value;
        mod.weaponType = mod.weaponType || 'basic_shot';
        break;
      case 'shotgun':
        mod.shotCount += value - 1;
        mod.weaponType = 'shotgun';  // Weapon override
        break;
      // ... 48 items total
    }
  }

  this.player.modifiers = mod;  // Atomic replacement
}
```

### When Recalculation Happens
1. Item pickup (new item, upgrade, or weapon replace)
2. Fusion execution (remove 2 items, add 1)
3. Any future state change that affects modifiers

### Weapon Priority Rule
Weapons use **last-wins** for `weaponType`. Since only one weapon can be equipped, the weapon's `case` always sets `mod.weaponType` directly. Other weapon-like items (orbs, chains) use `mod.weaponType || value` to avoid overwriting the active weapon.

### Fusion Slot Bonus
Each fusion output in inventory increments `fusionSlotBonus`, expanding the max skill slots. Tracked during recalculation loop.

## Consequences
- **Pro**: Impossible to have stale modifiers — every change produces a clean state
- **Pro**: Order-independent for non-weapons (additive stacking)
- **Pro**: Easy to debug — `recalculate()` is the single source of truth
- **Con**: O(n) where n = number of skills (currently max ~10, negligible)
- **Con**: Must be careful with weapon priority (last weapon wins)

## Engine Compatibility
- No engine APIs involved — pure TypeScript logic
- `defaultModifiers()` returns a fresh object each call

## GDD Requirements Addressed
- TR-play-001: 30+ modifier fields recalculated on item change
- TR-item-002: Full modifier recalculation on any change
- TR-item-003: Weapon replacement + non-weapon stacking
- TR-item-004: Fusion output bonus slot tracking
