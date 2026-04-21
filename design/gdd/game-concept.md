# Game Concept: 千刃地牢 (Blade Storm Dungeon)

> **Status**: Approved
> **Genre**: Top-down Auto-shooter Roguelike
> **Platform**: Web + Mobile (Capacitor)
> **Engine**: Phaser 3.80 + TypeScript 5.5 + Vite 5.4
> **Estimated Scope**: Medium (4-6 weeks, solo)
> **Target Audience**: Strategy-oriented achievers who enjoy build crafting and combo discovery

---

## Elevator Pitch

20 种武器、20 种融合、上百种 Build 组合——每次进入地牢都在构建一套独一无二的战斗流派。没有万金油，只有最适合当下随机掉落的最优解。像 Balatro 的策略深度，加上 Vampire Survivors 的割草爽感。

---

## Core Identity

| Field | Value |
|-------|-------|
| **Core Verb** | 组合 + 碾压 (Build + Destroy) |
| **Core Fantasy** | 武器大师——每次探索发现新的融合配方，打造前所未有的战斗流派 |
| **Unique Hook** | 像 Vampire Survivors 的自动射击，**同时** 像 Balatro 的策略组合——武器融合不是数值叠加，而是彻底改变战斗方式 |
| **Primary MDA Aesthetic** | Expression (表达) + Challenge (挑战) |
| **Secondary Aesthetics** | Discovery (发现), Sensation (爽感) |

---

## Game Pillars

### Pillar 1: Build 多样性
> 每局游戏都应该能玩出截然不同的战斗流派

**Design Test**: 如果两个技能可以融合，它们融合后的玩法必须跟原来完全不同，而不仅是数值增强。

### Pillar 2: 决策重量
> 每次拾取和融合都应该让玩家犹豫

**Design Test**: 如果选择 A 还是 B 不需要思考，那这个选择就不应该存在。

### Pillar 3: 爽感节奏
> 前期探索谨慎，后期碾压释放

**Design Test**: 如果玩家到第 20 波还没有感到自己变强了，那平衡性出了问题。

### Pillar 4: 一局一故事
> 每局运行结束时，玩家应该能说出"这局我的 Build 是…"

**Design Test**: 如果玩家只能说"这局我射了很多子弹"，那游戏缺少记忆点。

### Pillar 5: 无万金油
> 不存在绝对最优 Build，每局的最优解取决于你捡到了什么

**Design Test**: 如果某个 Build 连续 5 局都是最高分，那它需要被削弱或需要引入克制它的敌人类型。

---

## Anti-Pillars (What This Game Is NOT)

- **NOT a narrative game** — No NPC dialogues or story quests. Narrative elements would distract from the build strategy focus.
- **NOT a hardcore action game** — No precision aiming or combo inputs. This would exclude casual players.
- **NOT a social/multiplayer game** — No co-op or PVP. Multiplayer balance complexity would explode scope.

---

## Core Loop

### 30-Second Loop (Moment-to-Moment)
Dodge enemies → Auto-shoot kills → Pick up drops → Evaluate current build's strengths and weaknesses

### 5-Minute Loop (Short-Term Goals)
Wave after wave of enemies → Collect 2-3 skills → Encounter first fusion opportunity → **Key decision**: fuse into a rarer weapon, or keep two independent skills?

### Session Loop (30-120 Minutes)
A complete run → Start with basic weapons → Progressively build a unique build → Die at some wave → Review build analysis → "My freeze-shotgun + thunderstorm combo almost made it, next time I'll try death-wheel + hellfire"

### Progression Loop (Days/Weeks)
Unlock new weapon recipes → Accumulate fragments for permanent upgrades → Daily challenges to test different builds → Leaderboard competition for highest scores

---

## Player Motivation Profile

### Self-Determination Theory Analysis

| Need | How It's Satisfied |
|------|-------------------|
| **Autonomy** | 20 fusion recipes = hundreds of build paths. Every run is the player's choice. No forced meta. |
| **Competence** | From dying at wave 5 to crushing wave 30. Clear skill growth curve. Build analysis after each run. |
| **Relatedness** | Leaderboards + daily challenges provide comparison benchmarks. Shared language around build names ("Did you try the black hole + sun storm combo?") |

### Player Type Analysis

| Type | Fit | Reasoning |
|------|-----|-----------|
| **Strategy Achievers** (Primary) | Perfect | Love system mastery, discovering hidden combos, optimizing builds |
| **Casual Challengers** (Secondary) | Good | Quick sessions, score chasing, daily challenges |
| **Creative Builders** (Secondary) | Good | Finding off-meta builds and sharing discoveries |
| Narrative Seekers | Poor | No story content |
| Social Players | Poor | Single-player only |
| Action Competitors | Poor | Auto-shoot, no mechanical skill required |

### Market Validation
- **Vampire Survivors**: 5M+ players. Proved auto-shooter + build variety = massive market
- **Balatro**: Multi-million sales. Proved strategy-combo depth + roguelike = deep engagement
- **20 Minutes Till Dawn**: Similar niche (build-focused auto-shooter), strong indie success

---

## Visual Identity Anchor

### Direction: "Neon Dungeon"
Dark, atmospheric dungeon environments with bright, saturated weapon effects that make each build visually distinct.

**One-Line Visual Rule**: Everything must glow — every weapon, every effect, every fusion must have a signature color and visual pattern that makes builds visually distinguishable at a glance.

**Supporting Principles**:
1. **Dark Canvas, Bright Strokes** — Background is muted (#1a1a2e); weapons, effects, and UI pop with saturated color. Design test: if a screenshot doesn't immediately tell you what build the player is using, visual identity needs work.
2. **Pixel Precision** — All art is hand-crafted pixel art at 16x16 base sprites. No anti-aliasing. Design test: if zooming in reveals sub-pixel rendering, fix the texture.
3. **Effect = Identity** — Each weapon type has a unique visual signature (fireballs are orange orbits, lightning is blue zigzags, ice is expanding rings). Design test: if two different builds look the same in combat, one needs a visual overhaul.

**Color Philosophy**:
- Base palette: dark navy (#1a1a2e), stone gray (#2d2d44), warm brown (#4a3a2a)
- Accent palette: gold (#ffdd44) for UI, weapon-specific saturated colors for gameplay
- Rarity colors: gray → green → blue → purple → gold (standard ARPG convention)

---

## Scope Tiers

### Tier 1: MVP (2-3 weeks)
- Fusion system visualization (show what you can fuse, what you'll get)
- 10 balanced build paths with clear identities
- In-run build analysis panel
- Inter-run unlock progression
- Daily challenge system (seeded runs)
- 5 enemy types + boss every 5 waves

### Tier 2: Full Version (4-6 weeks)
- All 20 fusion recipes balanced and tested
- Weekly challenges with leaderboards
- Enemy variety expansion (7+ types with unique AI)
- Boss mechanics deepened (telegraph patterns, phase transitions)
- Build popularity tracking and meta-analysis
- Advanced wave system with elite enemies

### Tier 3: If Time Runs Short
- Ship MVP with 10 balanced builds
- Stagger remaining fusion balance as post-launch updates
- Basic leaderboard (localStorage)
- Core loop validated, content can be added iteratively

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| 20 fusion recipes can't be balanced in weeks | HIGH | Design counter-enemy types that punish meta builds. Balance by rock-paper-scissors, not flat numbers. |
| Phaser performance on low-end mobile | LOW | Object pooling already implemented. Profile on real devices early. |
| Not enough content variety for replayability | MEDIUM | Daily challenges with seeded randomness provide variety even with limited content. |
| Players don't understand fusion system | MEDIUM | Visual fusion preview + tutorial hints + "recommended fusion" suggestions for first 3 runs. |

---

## Reference Games

| Game | What We Learn |
|------|--------------|
| **Vampire Survivors** | Auto-shooter + wave survival + build variety = addictive loop |
| **Balatro** | Strategy combo depth + no universal best build = infinite replayability |
| **Genshin Impact** | Visual quality bar for pixel-art-style mobile games; gacha-free alternative |
| **Clash of Clans** | Balance philosophy: new content should shift the meta, not power-creep |
| **20 Minutes Till Dawn** | Build-focused auto-shooter execution at indie scale |

---

## Collaboration Notes

- First-time game developer, prefers fast iteration over perfect design
- Strong appreciation for strategic depth (Balatro, Clash of Clans)
- Values visual quality and polish (Genshin Impact influence)
- Development constraint: weeks, not months
- Engine: Phaser 3 (already in use, 38 source files)
