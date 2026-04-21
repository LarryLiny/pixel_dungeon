# Art Bible — 千刃地牢 (Blade Storm Dungeon)

> **Status**: In Review
> **Visual Identity Anchor**: Neon Dungeon — "Everything must glow"
> **Art Pipeline**: Procedural pixel art via Canvas 2D (no external assets)
> **Target Platform**: Web + Mobile
> **Minimum Feature Size**: 2px (mobile legibility)

---

## 1. Visual Identity Statement

**One-line visual rule:**
> Every gameplay-critical element must be identifiable by silhouette alone at 16x16, and by color family alone at thumbnail scale. Dark backgrounds serve as a stage; bright, saturated sprites are the actors.

**Supporting Principles:**

### Principle 1: Silhouette-First Design
Every sprite must be identifiable by its outline shape alone at 1x scale (16px).
- **Design test**: If you fill the sprite with a single solid color, can you still tell what it is?
- **Serves pillar**: Build Diversity — players must recognize weapons and enemies at a glance during chaotic combat
- **Rule**: Each of the 20 fusion items has a unique silhouette that visually references both parents (split-blend composition: left half = parent A shape, right half = parent B shape, center = blended transition)

### Principle 2: Glow as Gameplay Language
Additive-blended glow layers communicate power tier and element type. Glow is not decoration — it's information.
- **Design test**: Can you tell which element a weapon uses by its glow color alone, without seeing the sprite?
- **Serves pillar**: One Run One Story — the glow signature of a build should be screenshot-worthy
- **Rule**: Each element family has a dedicated glow color: Fire `#ff4422`, Ice `#88ccff`, Lightning `#4488ff`, Poison `#44cc22`, Dark `#aa44ff`, Holy `#ffcc44`. Rarity glow intensity scales with tier.

### Principle 3: Value Hierarchy Over Hue
Brightness contrast does the heavy lifting for readability; hue is secondary signaling. The player must always be able to distinguish "important" from "background" regardless of color.
- **Design test**: Convert a screenshot to grayscale — can you still identify your character, the enemies, and the dropped items?
- **Serves pillar**: Decision Weight — pickup items must pop from the chaotic battlefield so players can make fast fusion choices
- **Rule**: Gameplay sprites use a 4-step brightness ramp (Dark outline → Body fill → Highlight → Bright core). Background elements never exceed the Body brightness level.

---

## 2. Mood & Atmosphere

Each game state has a distinct emotional target and visual treatment.

| Game State | Primary Emotion | Lighting Character | Atmospheric Adjectives | Energy Level |
|---|---|---|---|---|
| **Menu / Loading** | Anticipation, mystery | Warm gold focal light on dark void | Atmospheric, inviting, intriguing, nostalgic | Contemplative |
| **Early Waves (1-5)** | Cautious exploration | Cool ambient, low contrast, sparse | Quiet, tense, uncertain, focused | Measured |
| **Mid-Game (6-15)** | Growing power, excitement | Warming, increasing glow density, moderate contrast | Dynamic, building, colorful, satisfying | Rising |
| **Late-Game (16+)** | Dominance, spectacle | Hot, saturated, high contrast, screen-filling glow layers | Frenetic, overwhelming, glorious, chaotic | Frenetic |
| **Boss Waves** | Intimidation, focus | Red-shifted, pulsing ambient, extreme contrast | Threatening, grand, intense, concentrated | Peak |
| **Death / Game Over** | Defeat, reflection | Sudden cool-to-dark shift, desaturation | Somber, empty, fading, quiet | Contemplative |
| **Shop** | Contemplation, planning | Neutral warm, even lighting, clean backdrop | Organized, calm, considered, inviting | Measured |
| **Fusion Moment** | Excitement, discovery | Flash of white-gold burst, screen shake | Electric, celebratory, brilliant, surprising | Spike |

**Lighting evolution rule**: The dungeon starts cold and dim (blue-tinted ambient). As waves progress and the player's build gains power, the cumulative glow from weapon effects naturally warms and brightens the visual field. By wave 20+, the player's own effects light the dungeon. This is emergent — no explicit lighting system needed. The "rhythm of power" pillar is visually self-reinforcing.

---

## 3. Shape Language

### Character Silhouette Philosophy
- **Player**: Compact, symmetrical, upright. Rounded top (helmet/head), rectangular body (armor). The most "regular" silhouette — the player is the baseline. Blue family color.
- **Enemies**: Each enemy type has a distinct silhouette rule:
  - Slime: Amorphous blob (rounded, no straight lines) — "nature, chaos"
  - Bat: Angular, top-heavy with pointed wings — "threat from above"
  - Goblin: Hunched, asymmetric with pointed ears — "cunning, mischievous"
  - Skeleton: Thin, vertical, exposed "negative space" (ribs) — "death, hollow"
  - Orc: Wide, blocky, heavy bottom — "brute, grounded"
  - Ghost: Translucent oval, no hard edges — "otherworldly, intangible"
  - Demon: Tall, horned, spiked — "boss-tier threat, dangerous"

### Environment Geometry
- **Dungeon floors**: Grid-aligned stone blocks (geometric, predictable). Rectangular cracks break the regularity without destroying it.
- **Walls**: Stacked brick pattern (horizontal rectangles with mortar gaps). Warm brown tones contrast the cool floor.
- **Future expansion**: Special rooms (treasure, boss arena, shop room) should use distinct tile patterns (e.g., boss arena = cracked red stone, treasure = gold-veined marble) while maintaining the same geometric grid system.

### UI Shape Grammar
UI is a distinct visual layer from the game world — it does NOT echo the dungeon aesthetic.
- **Skill bar**: Clean rectangular slots with rounded-corner category backgrounds. Flat design, no pixel-art texture on UI chrome.
- **Text**: Monospace font family throughout. No decorative or fantasy fonts — readability trumps atmosphere for UI text.
- **Icons**: Pixel art (matching in-game sprites) placed inside flat UI containers. The pixel art is the "content"; the UI chrome is the "frame."

### Hero Shapes vs Supporting Shapes
- **Hero (eye-catcher)**: Player character, active weapon effects, dropped items, fusion flash. These use the brightest value tier and saturated hues.
- **Supporting (background)**: Dungeon tiles, inactive enemies at distance, UI chrome. These never exceed mid-value brightness.
- **Rule**: If two things compete for attention and one is a gameplay decision (pickup, fusion prompt, enemy about to hit), that one wins. Always.

---

## 4. Color System

### Primary Palette

| Color | Hex | Role | Emotional Association |
|---|---|---|---|
| **Deep Navy** | `#1a1a2e` | Background base, screen clear color | Mystery, depth, nighttime |
| **Stone Floor** | `#2d2d44` | Dungeon floor fill | Grounded, cold, ancient |
| **Warm Brown** | `#4a3a2a` | Dungeon wall fill | Warmth, structure, material |
| **Gold Accent** | `#ffdd44` | UI hero color, score, titles, pickups | Achievement, reward, prestige |
| **Crimson HP** | `#ff3344` | Player health bar, damage flash | Danger, vitality, urgency |
| **Cyan Info** | `#44ddff` | Wave counter, button highlights | Information, clarity, calm |
| **Green Action** | `#44ff88` | Shop buttons, defense items | Growth, safety, progression |

### Element Color Families

Each element has a 4-step ramp (Dark → Body → Highlight → Core):

| Element | Dark (outline) | Body (fill) | Highlight | Core (bright) | Glow Color |
|---|---|---|---|---|---|
| **Fire** | `#991100` | `#ff4422` | `#ff8844` | `#ffcc44` / `#ffffff` | `#ff4422` |
| **Ice** | `#225577` | `#88ccff` | `#c8e8ff` | `#ffffff` | `#88ccff` |
| **Lightning** | `#1133aa` | `#4488ff` | `#88ccff` | `#ffffff` | `#4488ff` |
| **Poison** | `#116611` | `#44cc22` | `#88ee66` | `#ccffaa` | `#44cc22` |
| **Dark** | `#330066` | `#aa44ff` | `#cc88ff` | `#eeddff` | `#aa44ff` |
| **Holy** | `#886600` | `#ffcc44` | `#ffdd88` | `#ffffee` | `#ffcc44` |

### Rarity Color System

| Rarity | Border/Text | Body Fill | Background (HUD) | Glow Intensity |
|---|---|---|---|---|
| Common | `#cccccc` | `#bbbbbb` | `#222244` | None |
| Uncommon | `#44cc44` | `#33bb44` | `#224422` | Subtle pulse |
| Rare | `#4488ff` | `#3366dd` | `#222244` | Steady glow |
| Epic | `#aa44ff` | `#8833cc` | `#332244` | Bright pulse |
| Legendary | `#ffaa00` | `#ddaa22` | `#443322` | Intense pulse + particle trail |

### Item Category Colors

| Category | Border | Background | Pickup Glow |
|---|---|---|---|
| Weapon | `#ff8844` (orange) | `#663311` (dark brown) | `#ff8844` |
| Augment | `#44eeff` (cyan) | `#113355` (dark navy) | `#44eeff` |
| Defense | `#44ff88` (green) | `#115533` (dark green) | `#44ff88` |

### Colorblind Safety

| Potential Confusion | Colors | Backup Cue |
|---|---|---|
| Fire vs Poison (red-green) | `#ff4422` vs `#44cc22` | Fire = animated flicker, Poison = drip animation + skull icon |
| Rare vs Epic (blue-purple) | `#4488ff` vs `#aa44ff` | Rarity label text ("R", "E", "L") + distinct border thickness (Rare=2px, Epic=3px, Legendary=4px) |
| HP bar (red) vs enemy damage (red tint) | Both red family | HP bar = static rectangle, damage = flash-tint on sprite body |
| Weapon vs Defense (orange vs green) | `#ff8844` vs `#44ff88` | Category icon shape: sword for weapon, shield for defense |

### Per-Wave Color Temperature Evolution

| Wave Range | Temperature | Dominant Hue | Visual Effect |
|---|---|---|---|
| 1-5 | Cool | Blue-gray (#2d2d44 floor reads as cold) | Sparse, dim |
| 6-10 | Neutral | Mixed (player's build determines the palette) | Moderate glow density |
| 11-15 | Warm | Fire/gold tones dominate as power builds | Rich, saturated |
| 16-20 | Hot | Multi-element, screen-filling color | Kaleidoscopic, spectacular |
| 20+ | Extreme | Everything at once — the dungeon is lit by the player | Overwhelming, glorious |
| Boss | Red-shifted | `#cc2233` demon red ambient | Threatening, focused |

---

## 5. Character Design Direction

### Player Visual Archetype
The player is the visual "baseline" — the most regular, symmetrical silhouette on screen. Compact and upright, communicating "small but determined adventurer."

| Part | Current Color | Rule |
|---|---|---|
| Head | `#f5c8a8` (skin) | Round, human-readable at 4x4 px minimum |
| Body | `#4a7adb` (blue armor) | Rectangular, 1px blue outline for pop |
| Legs | `#3a5a9d` (dark blue) | Thinner than body, suggests movement |
| Boots | `#8b6914` (brown) | Grounding element, anchors the character |
| Eyes | `#222222` (black) | 1px each, always visible |

**Improvement target**: Add a 1px white highlight on the helmet (top-left) and a subtle sword/weapon indicator on the back to increase silhouette uniqueness.

### Enemy Distinguishing Features

| Enemy | Primary Color | Silhouette Keyword | Scale | Body Size | At-a-Glance Differentiator |
|---|---|---|---|---|---|
| Slime | `#44cc44` | Blob (rounded) | 1.2 | 10x10 | No straight lines, widest at bottom |
| Bat | `#8844aa` | Angular wings | 1.3 | 10x8 | Pointed top (ears), wide horizontal spread |
| Goblin | `#66aa33` | Hunched humanoid | 1.4 | 10x12 | Pointed ears, smaller than orc, yellow eyes |
| Skeleton | `#ddd8c8` | Thin vertical | 1.5 | 8x14 | Lightest body, visible rib gaps, bone white |
| Orc | `#557733` | Wide blocky | 2.0 | 14x14 | Widest enemy, red eyes, flat head |
| Ghost | `#aab8dd` | Oval translucent | 1.4 | 10x12 | Lightest outline (semi-transparent body), no legs |
| Demon | `#cc2233` | Tall horned | 2.2 | 12x16 | Tallest enemy, distinct horns, gold claws |

**Design test**: If all enemies were rendered as solid-black silhouettes at 16px, could you identify each type? Yes = pass.

### Expression Without Animation
Since all sprites are single-frame, expression comes from:
1. **Movement behavior** — slimes wobble (velocity variation), bats zigzag, ghosts phase through walls
2. **Eye design** — red eyes = aggressive (bat, orc), yellow eyes = cunning (goblin), hollow eyes = undead (skeleton, ghost)
3. **Color intensity** — demon's `#cc2233` is the most saturated enemy color, signaling highest threat

### Fusion Item Icon System
Each of the 20 fusion items uses a **split-blend composition**:

- **Left half** (cols 0-7): Parent A's shape + color family
- **Right half** (cols 8-15): Parent B's shape + color family
- **Center blend** (cols 6-9): 50/50 color mix, creates visual "seam"

| Fusion Item | Parent A | Parent B | Left Color | Right Color | Blend Color | Rarity |
|---|---|---|---|---|---|---|
| freeze_shotgun | shotgun | bullet_speed | `#ff8844` | `#22ccbb` | `#88ddcc` | Uncommon |
| hellfire | fireball_orbit | power | `#ff4422` | `#ff4488` | `#ff5555` | Uncommon |
| death_wheel | boomerang | death_scythe | `#88ff44` | `#9944cc` | `#bb77dd` | Uncommon |
| wind_runner | swiftness | heal_cloak | `#44aaff` | `#44ff88` | `#66ffcc` | Uncommon |
| mega_blaster | basic_shot | pierce_core | `#ffee55` | `#4488ff` | `#aaccff` | Uncommon |
| shield_bash | shield_orbit | reflect_mirror | `#4488ff` | `#aaddff` | `#77bbff` | Uncommon |
| thunder_slash | sword_slash | lightning | `#ddddee` | `#4488ff` | `#aaddff` | Rare |
| fragment_bomb | shotgun | splash | `#ff8844` | `#ff6622` | `#ff7733` | Rare |
| thunderstorm | lightning | chain_enhance | `#4488ff` | `#88ccff` | `#66aaff` | Rare |
| tracking_fireball | fireball_orbit | barrage | `#ff4422` | `#ffcc44` | `#ff8833` | Rare |
| void_walker | ghost_step | swiftness | `#8899bb` | `#44aaff` | `#66bbff` | Rare |
| frost_storm | ice_wave | lightning | `#88ccff` | `#4488ff` | `#66aaff` | Epic |
| plague_bomb | poison_snake | splash | `#44cc22` | `#ff6622` | `#aa9922` | Epic |
| black_hole | repulse | magnet | `#6644aa` | `#8866cc` | `#7755bb` | Epic |
| sun_storm | fireball_orbit | barrage | `#ff4422` | `#ffcc44` | `#ff8833` | Epic |
| nuclear_core | power | splash | `#ff4488` | `#ff6622` | `#ff5555` | Epic |
| photon_cannon | laser_beam | attack_speed | `#dd3388` | `#ffdd44` | `#ee8866` | Legendary |
| absolute_defense | shield_orbit | reflect_mirror | `#4488ff` | `#aaddff` | `#77ccff` | Legendary |
| soul_reaper | death_scythe | splash | `#9944cc` | `#ff6622` | `#cc5544` | Legendary |
| angel_embrace | holy_guard | ghost_step | `#ffcc44` | `#8899bb` | `#ccbb77` | Legendary |

**Design test**: At 16x16, can you identify both parents within 200ms of seeing the icon?

---

## 6. Environment Design Language

### Architectural Style
The dungeon is a **procedural ruin** — once a structured underground complex, now crumbling and overgrown. This justifies the random room generation.

### Tile System

| Tile Type | Base Color | Detail Color | Pattern | Future Variant |
|---|---|---|---|---|
| Standard Floor | `#2d2d44` | `#33334d` (stone), `#252540` (cracks) | 32x32 grid of rectangular stone blocks | Moss variant `#2d3d34` for deeper floors |
| Standard Wall | `#4a3a2a` | `#5a4a3a` (brick face), `#3a2a1a` (mortar) | Horizontal brick stack | Crumbling variant with gaps |
| Boss Arena Floor | `#3d2228` | `#553338` (cracks), `#2d1520` (deep cracks) | Red-tinted stone, wider crack pattern | — |
| Treasure Room Floor | `#2d2d44` | `#443d2d` (gold veins), `#ffdd44` (sparkle) | Standard floor + gold mineral veins | — |
| Corridor Floor | `#282840` | `#30304a` | Slightly darker than rooms | — |

### Prop Density Rules
- **Current state**: Zero props. This is acceptable for MVP.
- **Recommended minimum**: 2-3 decorative elements per room (cracks, moss patches, broken stone chunks) — purely visual, no collision
- **Maximum**: Never obscure more than 10% of floor area with decoration. Gameplay readability > atmosphere.
- **Implementation**: Decorative props are non-colliding `Phaser.GameObjects.Image` at depth 0.5 (between floor at 0 and walls at 2).

### Environmental Storytelling
Without text or NPCs, the dungeon tells its story through visual details:
1. **Wave 1-10 rooms**: Clean stone, intact walls — "recently explored"
2. **Wave 11-20 rooms**: Cracked floors, moss patches, broken wall segments — "deeper, older"
3. **Wave 20+ rooms**: Red-veined stone, structural damage, dark ambient — "approaching the abyss"

This progression is achieved by tileset selection based on wave number, not by generating new textures at runtime.

---

## 7. UI/HUD Visual Direction

### HUD Architecture
The HUD is **screen-space only** — no diegetic (in-world) UI elements. This keeps the pixel-art dungeon clean and avoids readability conflicts during chaotic combat.

### Typography Hierarchy

| Element | Font Size | Color | Weight | Position |
|---|---|---|---|---|
| Game title | 28-48px (scaled) | `#ffdd44` | Bold | Menu center |
| Score | 14px (scaled) | `#ffdd44` | Regular | Top-left |
| Wave counter | 13px (scaled) | `#44ddff` | Regular | Top-left, below score |
| Kill count | 12px (scaled) | `#aaaacc` | Regular | Top-left, below wave |
| Timer | 11px (scaled) | `#88aa88` | Regular | Top-left, below kills |
| HP text | 11px (scaled) | `#ffffff` | Regular | Top-left, on HP bar |
| Level text | 10px (scaled) | `#ffdd44` | Bold | Bottom, on skill slot |
| Button labels | 18-26px (scaled) | Category color | Regular | Center-screen |
| Instructions | 10px (scaled) | `#666688` | Regular | Bottom-center |

**Font family**: Monospace throughout. No decorative fonts. Readability > atmosphere for all UI text.

### Skill Bar Design

| Component | Size | Color | Notes |
|---|---|---|---|
| Bar background | Dynamic width × 50px | `#111122` (α 0.9) | Expands with fusion bonus slots |
| Slot background | 40×40px | `#222244` | Dark recessed look |
| Category fill | 36×36px | Category color (dark) | Weapon `#663311`, Augment `#113355`, Defense `#115533` |
| Slot border | 2px stroke | Category color | Weapon `#ff8844`, Augment `#44eeff`, Defense `#44ff88` |
| Item icon | 40px (scaled from 16px) | Pixel art sprite | 2.5x scale from 16px base |
| Level badge | 10px text | `#ffdd44` bold on `#000000cc` | Bottom-right of slot |

### UI Animation Feel
All UI animations use Phaser tweens with these timing rules:
- **Button hover**: Color shift only, 0ms duration (instant feedback)
- **Fusion flash**: 300ms expand + fade, gold burst `#ffdd44` → transparent
- **Message fade**: Last 40% of duration is fade-out (linear alpha interpolation)
- **HP bar change**: Immediate (no tween) — delayed HP feels wrong in combat
- **Skill bar expansion**: 200ms width transition when new slot added

### Mobile Adaptations

| Element | Mobile Rule |
|---|---|
| Touch targets | Minimum 44×44px (Apple HIG standard) for all buttons |
| Skill bar | Safe area above bottom notch/pill (safe-area-inset-bottom) |
| Joystick zone | Left 40% of screen, semi-transparent |
| Score/info | Top safe area, no overlap with notch |
| Text scaling | `Math.min(sw/800, sh/600)` ratio ensures readability on small screens |

---

## 8. Asset Standards

### Asset Pipeline
All assets are **procedural pixel art** generated at runtime via `generateTexture()` in `src/utils/pixelAssets.ts`.

- **No external image files** — zero file dependencies
- **No sprite sheets** — each texture is individually generated
- **No build step for art** — textures exist only in code

### Texture Key Naming Convention

| Category | Pattern | Examples |
|---|---|---|
| Player | `player` | `player` (single texture) |
| Enemies | `[enemy_type]` | `slime`, `bat`, `goblin`, `skeleton`, `orc`, `ghost`, `demon` |
| Bullets | `bullet` | `bullet` (single pool, tint-differentiated) |
| Weapon-specific | `[weapon_id]` | `fireball_orb`, `lightning_bolt`, `sword_slash`, `ice_wave`, `laser_beam`, `death_scythe` |
| Item icons | `icon_[item_id]` | `icon_basic_shot`, `icon_shotgun`, `icon_fireball_orbit` |
| Fragment icons | `fragment_[rarity]` | `fragment_common`, `fragment_rare`, `fragment_legendary` |
| Pickup | `item_pickup`, `potion` | Shared pickup base textures |
| Environment | `floor`, `wall` | Single tileset each |
| Effects | `fusion_flash` | Runtime effects |

### Sprite Size Tiers

| Tier | Size | Use Case | Scale Range |
|---|---|---|---|
| Micro | 6×6 | Bullets, small projectiles | 1.0-1.5x |
| Small | 12×12 | Fragments, weapon orbs | 1.0-2.0x |
| Standard | 16×16 | Characters, enemies, items, icons | 1.0-2.5x |
| Tile | 32×32 | Floor, wall, environment | 1.0x |
| Effect | 32×32 | Fusion flash, large VFX | 1.0-3.0x |

### Color Depth Rules
Every sprite must comply with the **4-step brightness ramp**:
1. **Dark** (outline/shadow): Darkest color in the element family
2. **Body** (main fill): Primary identifying color
3. **Highlight** (top-left 2×2 to 3×3): Brightest non-white color
4. **Core** (center specular): `#ffffff` or near-white for "glow point"

**Validation**: If a sprite uses fewer than 3 steps, it likely lacks depth. If it uses more than 5, it's over-detailed for 16×16.

### Performance Budget

| Metric | Current | Target | Constraint |
|---|---|---|---|
| Active bullets | 80 (MAX_BULLETS) | 200 | Object pool with recycling |
| Active enemies | 25 (MAX_ENEMIES) | 50 | Cleanup dead every 2s |
| Active pickups | 15 (MAX_PICKUPS) | 20 | Remove on collect or timeout |
| Texture count | ~55 | < 100 | Each generateTexture() creates a WebGL texture |
| Draw calls per frame | ~50-100 | < 200 | Arcade physics adds overhead |
| Target FPS | 60 | 60 | 16.6ms frame budget |
| JS bundle size (gzipped) | ~371 KB | < 500 KB | Single chunk, no code splitting |

### Design Validation Checklist (per new asset)
- [ ] Silhouette test: Fill with one color — still identifiable?
- [ ] Grayscale test: Convert to gray — still readable against `#2d2d44`?
- [ ] Mobile test: On 375px width screen — still readable at game zoom?
- [ ] Ramp test: Uses 3-5 colors from element family ramp?
- [ ] Naming test: Texture key follows convention?
- [ ] Size test: Fits in correct size tier?

---

## 9. Reference Direction

### Reference 1: Vampire Survivors (poncle, 2022)
- **What to draw from**: Screen-filling chaos management — how to make 200+ simultaneous visual elements readable through strict value hierarchy and element color coding
- **What to avoid**: Do NOT copy the flat/vector art style. Our game is pixel art with glow; theirs is minimalist vector. Also avoid their extremely sparse environments — our dungeon should feel more atmospheric

### Reference 2: Enter the Gungeon (Dodge Roll, 2016)
- **What to draw from**: Character silhouette diversity — every enemy in Gungeon is instantly identifiable by shape alone at any zoom level. Study their approach to giving each enemy type a unique "verb silhouette" (rolling, flying, charging)
- **What to avoid**: Do NOT aim for their animation quality (they have 24+ frame walk cycles). We work with single-frame sprites + runtime tweens. Also avoid their room-to-room transition system — our game is open-floor survival

### Reference 3: Dead Cells (Motion Twin, 2018)
- **What to draw from**: Atmospheric pixel art lighting — how they use warm/cool color temperature to distinguish biomes and create mood without a formal lighting system. Their "Prisoners' Quarters" biome is close to our visual target
- **What to avoid**: Do NOT try to replicate their fluid animation system or particle density. They have a full VFX team. We achieve atmosphere through color temperature and glow layers, not particle count

### Reference 4: Balatro (LocalThunk, 2024)
- **What to draw from**: Visual feedback density — how every action (playing a card, scoring, triggering a Joker) has immediate, satisfying visual feedback despite minimalist art. Study their use of color intensity and screen shake as "reward signals"
- **What to avoid**: Do NOT adopt their flat 2D card-game aesthetic. Our game needs spatial depth and environmental atmosphere, which their table-top view deliberately lacks

### Reference 5: Hades (Supergiant Games, 2020)
- **What to draw from**: Weapon visual identity — each weapon in Hades has a completely unique attack animation, color signature, and "feel." This is our model for making 20 fusion builds visually distinct. Study how the Stygian Blade vs. the Eternal Spear vs. the Adamant Rail all feel fundamentally different
- **What to avoid**: Do NOT aim for their art production quality (hand-painted 2D characters by professional artists). Our pixel art achieves distinctiveness through silhouette + color, not illustration quality. Also avoid their narrative-driven room design — our dungeon is procedurally generated

---

> **Art Director Sign-Off (AD-ART-BIBLE)**: Skipped — Solo mode
