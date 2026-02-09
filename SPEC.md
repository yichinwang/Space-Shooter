# Retro 2D Space Shooter - Game Specification

## Overview

A classic vertical-scrolling space shooter built with **Phaser.js 3**. The player pilots a spaceship, destroys waves of enemies, collects power-ups, and battles bosses across 3 waves of increasing difficulty. The game features parallax scrolling space backgrounds, an arcade scoring system, and retro pixel-art visuals.

---

## Tech Stack

- **Engine:** Phaser.js 3 (latest stable)
- **Language:** JavaScript (ES6+)
- **Build:** Vanilla HTML + JS (no bundler required), served via local dev server
- **Resolution:** 480 x 640 (portrait, classic arcade ratio)
- **Scroll Direction:** Vertical (top-down). Player at bottom, enemies from top.

---

## Core Gameplay

- The player controls a spaceship that can move in all 4 directions within the screen bounds.
- The player auto-fires laser bolts upward at a steady rate.
- Enemies spawn from the top of the screen in predefined wave patterns and move downward.
- Enemies fire projectiles at the player.
- Destroying enemies awards points.
- The player starts with **3 lives**. Getting hit by an enemy or enemy projectile costs 1 life.
- When hit, the player has a brief invincibility window (flashing effect).
- Power-ups drop randomly from destroyed enemies.
- Each wave ends with a **boss fight**.
- Game over when all lives are lost. A "Game Over" screen shows the final score with a restart option.

---

## Asset Inventory

All assets are located under `Legacy Collection/Assets/`.

### Player

| Asset | Path | Notes |
|---|---|---|
| Player Ship | `Packs/SpaceShipShooter/spritesheets/ship.png` | Spritesheet with multiple animation frames (idle, banking left/right) |

### Enemies

| Asset | Path | Notes |
|---|---|---|
| Small Enemy | `Packs/SpaceShipShooter/spritesheets/JH01.png` | Basic fodder enemy. Fast, low HP (1 hit). |
| Medium Enemy | `Packs/SpaceShipShooter/spritesheets/JW.png` | Tougher enemy. Medium speed, 2-3 hits to destroy. |
| Big Enemy (Boss) | `Packs/SpaceShipShooter/spritesheets/enemy-big.png` | Boss enemy. Slow, high HP, fires multiple projectile patterns. |

### Projectiles

| Asset | Path | Notes |
|---|---|---|
| Laser Bolts | `Packs/SpaceShipShooter/spritesheets/laser-bolts.png` | Blue bolts = player, Pink bolts = enemy. |

### Effects

| Asset | Path | Notes |
|---|---|---|
| Explosion (small) | `Packs/SpaceShipShooter/spritesheets/explosion.png` | Used for small enemy deaths. |
| Explosion A | `Misc/Explosions pack/explosion-1-a/spritesheet.png` | Compact fireball. Use for medium enemy deaths. |
| Explosion B | `Misc/Explosions pack/explosion-1-b/spritesheet.png` | Large explosion with smoke. Use for boss phase transitions. |
| Explosion C | `Misc/Explosions pack/explosion-1-c/spritesheet.png` | Big dramatic burst. Use for boss death. |
| Explosion D | `Misc/Explosions pack/explosion-1-d/spritsheet.png` | Mushroom cloud. Alternate boss death. |
| Explosion E | `Misc/Explosions pack/explosion-1-e/explosion-5.png` | Shockwave ring. Use for player death. |
| Explosion F | `Misc/Explosions pack/explosion-1-f/Sprites.png` | Small burst. Use for projectile impacts. |

### Power-Ups

| Asset | Path | Notes |
|---|---|---|
| Power-Up Orbs | `Packs/SpaceShipShooter/spritesheets/power-up.png` | Blue orb = weapon upgrade, Red orb = shield/extra life. |

### Backgrounds (Parallax Layers - back to front)

| Layer | Asset | Path | Scroll Speed |
|---|---|---|---|
| 1 (farthest) | Space BG | `Environments/space_background_pack/Old Version/layers/parallax-space-backgound.png` | 0.1x (near-static) |
| 2 | Stars | `Environments/space_background_pack/Old Version/layers/parallax-space-stars.png` | 0.3x |
| 3 | Far Planets | `Environments/space_background_pack/Old Version/layers/parallax-space-far-planets.png` | 0.5x |
| 4 | Ring Planet | `Environments/space_background_pack/Old Version/layers/parallax-space-ring-planet.png` | 0.7x |
| 5 (nearest) | Big Planet | `Environments/space_background_pack/Old Version/layers/parallax-space-big-planet.png` | 0.9x |

---

## Scoring

| Event | Points |
|---|---|
| Small enemy destroyed | 100 |
| Medium enemy destroyed | 250 |
| Boss destroyed | 1000 |
| Power-up collected | 50 |

---

## Power-Up System

Power-ups have a **15% drop chance** from any destroyed enemy.

| Type | Color | Effect |
|---|---|---|
| Weapon Upgrade | Blue orb | Increases fire rate or adds side-firing bolts (up to 3 levels). |
| Shield / Extra Life | Red orb | Grants a 1-hit shield. If shield is already active, grants +1 life instead. |

Weapon upgrade levels:
1. **Base:** Single bolt, normal fire rate.
2. **Level 1:** Single bolt, fast fire rate.
3. **Level 2:** Double bolt (two parallel), fast fire rate.
4. **Level 3 (max):** Triple bolt (forward + two angled), fast fire rate.

Power-up level resets to base on death.

---

## Wave Structure

### Wave 1 - "First Contact"
- **Enemies:** Small enemies only.
- **Patterns:** Simple top-to-bottom lines, single-file columns, and small V-formations.
- **Duration:** ~60 seconds of enemy waves before the boss.
- **Boss:** Big enemy with single aimed shot, sweeping left-right movement. HP: 15 hits.

### Wave 2 - "Escalation"
- **Enemies:** Mix of small and medium enemies.
- **Patterns:** Zigzag paths, diagonal sweeps, cluster formations.
- **Duration:** ~75 seconds of enemy waves before the boss.
- **Boss:** Big enemy with 3-shot spread pattern, faster movement. HP: 25 hits.

### Wave 3 - "Final Stand"
- **Enemies:** All types. Medium enemies more frequent. Occasional small enemy swarms.
- **Patterns:** Complex curved paths, pincer attacks from screen edges, dense formations.
- **Duration:** ~90 seconds of enemy waves before the boss.
- **Boss:** Big enemy with alternating attack patterns (aimed shots + spread shots + bullet ring). HP: 40 hits. Two-phase fight (changes pattern at 50% HP with explosion effect).

After Wave 3, the game shows a **"Victory"** screen with the final score.

---

## Controls

| Input | Action |
|---|---|
| Arrow keys / WASD | Move ship |
| Spacebar | Fire (optional manual override; ship auto-fires) |

---

## UI / HUD

- **Score:** Top-left corner, white pixel font.
- **Lives:** Top-right corner, displayed as small ship icons.
- **Wave indicator:** Brief "WAVE X" text centered on screen at wave start.
- **Boss HP bar:** Appears at top-center during boss fights.

---

## Screens

1. **Title Screen:** Game title, "Press ENTER to Start", starfield background.
2. **Gameplay:** Main game with HUD overlay.
3. **Game Over:** "GAME OVER" text, final score, "Press ENTER to Restart".
4. **Victory:** "YOU WIN" text, final score, "Press ENTER to Play Again".

---

## Milestones

### Milestone 1 - "Fly & Shoot" (Playable Prototype)

**Goal:** Player can fly, shoot, and destroy enemies in a single endless wave.

**Deliverables:**
- [x] Phaser.js project scaffolding (HTML + JS entry point)
- [x] Load all player, enemy (small only), laser bolt, and small explosion assets
- [x] Parallax scrolling space background (all 5 layers)
- [x] Player ship with 4-directional movement + screen bounds clamping
- [x] Player auto-fire (blue laser bolts going upward)
- [x] Small enemies spawning from random positions at top, moving downward
- [x] Collision detection: player bullets vs enemies (enemy dies + explosion)
- [x] Collision detection: enemies vs player (player takes damage)
- [x] Lives system (3 lives, invincibility flash on hit, game over screen)
- [x] Score display (top-left) and lives display (top-right)
- [x] Title screen and Game Over screen with restart

**Playable result:** A simple but complete game loop - fly around, shoot enemies, try to survive.

---

### Milestone 2 - "Power & Peril" (Power-Ups + Medium Enemies + Wave 1 Boss)

**Goal:** Add power-ups, medium enemies, enemy shooting, and the first boss fight.

**Deliverables:**
- [x] Load medium enemy, big enemy (boss), power-up, and additional explosion assets
- [x] Medium enemies with higher HP (health tracking system)
- [x] Enemy projectiles: enemies fire pink laser bolts toward the player
- [x] Collision detection: enemy bullets vs player
- [x] Power-up drops from destroyed enemies (15% chance)
- [x] Blue power-up: weapon upgrade (3 levels)
- [x] Red power-up: shield / extra life
- [x] Wave 1 structure: timed enemy spawns in formations, then boss
- [x] Boss behavior: left-right sweep, aimed single shot, HP bar at top
- [x] Boss death: large explosion (explosion C), wave complete text
- [x] "WAVE 1" announcement text at start

**Playable result:** A full Wave 1 experience with escalating difficulty, collectible power-ups, and a satisfying boss fight.

---

### Milestone 3 - "Full Arcade" (All Waves + Polish)

**Goal:** Complete 3-wave game with all enemy patterns, bosses, and final polish.

**Deliverables:**
- [x] Wave 2: mixed enemy types, zigzag/diagonal patterns, boss with spread shots (HP 25)
- [x] Wave 3: all enemy types, complex patterns, two-phase boss (HP 40)
- [x] Boss phase transition effect (explosion B at 50% HP, pattern change)
- [x] Player death explosion (explosion E - shockwave ring)
- [x] Projectile impact effect (explosion F - small burst)
- [x] Increasing difficulty curve (faster enemies, more frequent spawns per wave)
- [x] Wave transition screens ("WAVE 2", "WAVE 3" announcements)
- [x] Victory screen after Wave 3 with final score
- [x] Screen shake on boss hits and player death
- [x] Sound effects placeholder hooks (for future audio)

**Playable result:** A complete retro arcade space shooter with 3 waves, 3 bosses, power-ups, and polished game feel.

---

## Project Structure

```
Space_Shooter/
  index.html              # Entry point
  js/
    main.js               # Phaser config + game init
    scenes/
      BootScene.js         # Asset loading
      TitleScene.js        # Title screen
      GameScene.js         # Main gameplay
      GameOverScene.js     # Game over screen
      VictoryScene.js      # Victory screen
  assets/                  # Copied/symlinked from Legacy Collection
    player/
      ship.png
    enemies/
      enemy-small.png
      enemy-medium.png
      enemy-big.png
    projectiles/
      laser-bolts.png
    powerups/
      power-up.png
    explosions/
      explosion-small.png
      explosion-a.png
      explosion-b.png
      explosion-c.png
      explosion-d.png
      explosion-e.png
      explosion-f.png
    backgrounds/
      space-bg.png
      space-stars.png
      space-far-planets.png
      space-ring-planet.png
      space-big-planet.png
```
