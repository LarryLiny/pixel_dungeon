import Phaser from 'phaser';

/** Generate a simple pixel-art texture and add it to the scene's texture manager */
function generateTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx, width, height);
  scene.textures.addCanvas(key, canvas);
}

// --- Player ---
export function createPlayerTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'player', 16, 16, (ctx) => {
    // Body (blue armor)
    ctx.fillStyle = '#4a7adb';
    ctx.fillRect(4, 2, 8, 10);
    // Head
    ctx.fillStyle = '#f5c8a8';
    ctx.fillRect(5, 0, 6, 4);
    // Eyes
    ctx.fillStyle = '#222';
    ctx.fillRect(6, 1, 2, 2);
    ctx.fillRect(10, 1, 2, 2);
    // Legs
    ctx.fillStyle = '#3a5a9d';
    ctx.fillRect(4, 12, 3, 4);
    ctx.fillRect(9, 12, 3, 4);
    // Boots
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(4, 14, 3, 2);
    ctx.fillRect(9, 14, 3, 2);
  });
}

// --- Dungeon floor tile ---
export function createFloorTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'floor', 32, 32, (ctx) => {
    ctx.fillStyle = '#2d2d44';
    ctx.fillRect(0, 0, 32, 32);
    // Random stone pattern
    ctx.fillStyle = '#33334d';
    ctx.fillRect(0, 0, 15, 15);
    ctx.fillRect(17, 0, 15, 15);
    ctx.fillRect(0, 17, 15, 15);
    ctx.fillRect(17, 17, 15, 15);
    // Cracks
    ctx.fillStyle = '#252540';
    ctx.fillRect(7, 15, 1, 2);
    ctx.fillRect(15, 7, 2, 1);
    ctx.fillRect(24, 23, 1, 1);
  });
}

// --- Wall tile ---
export function createWallTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'wall', 32, 32, (ctx) => {
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(0, 0, 32, 32);
    // Brick pattern
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(1, 1, 14, 6);
    ctx.fillRect(17, 1, 14, 6);
    ctx.fillRect(1, 9, 14, 6);
    ctx.fillRect(17, 9, 14, 6);
    ctx.fillRect(1, 17, 14, 6);
    ctx.fillRect(17, 17, 14, 6);
    ctx.fillRect(1, 25, 14, 6);
    ctx.fillRect(17, 25, 14, 6);
    // Mortar lines
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, 7, 32, 2);
    ctx.fillRect(0, 15, 32, 2);
    ctx.fillRect(0, 23, 32, 2);
    ctx.fillRect(15, 0, 2, 32);
  });
}

// --- Enemies ---
export function createSlimeTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'slime', 16, 16, (ctx) => {
    ctx.fillStyle = '#44cc44';
    ctx.fillRect(3, 6, 10, 8);
    ctx.fillRect(2, 8, 12, 4);
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(5, 7, 2, 3);
    ctx.fillRect(9, 7, 2, 3);
    ctx.fillStyle = '#111';
    ctx.fillRect(6, 8, 1, 2);
    ctx.fillRect(10, 8, 1, 2);
  });
}

export function createBatTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'bat', 16, 16, (ctx) => {
    ctx.fillStyle = '#8844aa';
    // Wings
    ctx.fillRect(0, 4, 4, 4);
    ctx.fillRect(12, 4, 4, 4);
    // Body
    ctx.fillRect(4, 3, 8, 8);
    // Eyes
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(5, 5, 2, 2);
    ctx.fillRect(9, 5, 2, 2);
    // Fangs
    ctx.fillStyle = '#fff';
    ctx.fillRect(6, 9, 1, 2);
    ctx.fillRect(9, 9, 1, 2);
  });
}

export function createGoblinTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'goblin', 16, 16, (ctx) => {
    // Body
    ctx.fillStyle = '#66aa33';
    ctx.fillRect(4, 4, 8, 8);
    // Head
    ctx.fillRect(5, 1, 6, 5);
    // Ears
    ctx.fillRect(3, 2, 2, 2);
    ctx.fillRect(11, 2, 2, 2);
    // Eyes
    ctx.fillStyle = '#ff0';
    ctx.fillRect(6, 2, 2, 2);
    ctx.fillRect(9, 2, 2, 2);
    // Legs
    ctx.fillStyle = '#558822';
    ctx.fillRect(4, 12, 3, 4);
    ctx.fillRect(9, 12, 3, 4);
  });
}

export function createSkeletonTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'skeleton', 16, 16, (ctx) => {
    ctx.fillStyle = '#ddd8c8';
    // Skull
    ctx.fillRect(4, 0, 8, 6);
    // Eye sockets
    ctx.fillStyle = '#222';
    ctx.fillRect(5, 2, 2, 2);
    ctx.fillRect(9, 2, 2, 2);
    // Ribcage
    ctx.fillStyle = '#ccc7b7';
    ctx.fillRect(5, 6, 6, 6);
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(6, 7, 1, 4);
    ctx.fillRect(9, 7, 1, 4);
    // Legs
    ctx.fillStyle = '#bbb6a6';
    ctx.fillRect(5, 12, 2, 4);
    ctx.fillRect(9, 12, 2, 4);
  });
}

export function createOrcTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'orc', 16, 16, (ctx) => {
    // Body (large)
    ctx.fillStyle = '#557733';
    ctx.fillRect(2, 4, 12, 8);
    // Head
    ctx.fillRect(4, 0, 8, 6);
    // Tusks
    ctx.fillStyle = '#fff';
    ctx.fillRect(5, 5, 1, 2);
    ctx.fillRect(10, 5, 1, 2);
    // Eyes
    ctx.fillStyle = '#f00';
    ctx.fillRect(5, 2, 2, 2);
    ctx.fillRect(9, 2, 2, 2);
    // Legs
    ctx.fillStyle = '#446622';
    ctx.fillRect(3, 12, 4, 4);
    ctx.fillRect(9, 12, 4, 4);
  });
}

export function createGhostTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'ghost', 16, 16, (ctx) => {
    ctx.fillStyle = '#aab8dd';
    // Head
    ctx.fillRect(3, 0, 10, 8);
    // Body (wavy bottom)
    ctx.fillRect(2, 8, 12, 6);
    ctx.fillRect(3, 14, 2, 2);
    ctx.fillRect(7, 14, 2, 2);
    ctx.fillRect(11, 14, 2, 2);
    // Eyes
    ctx.fillStyle = '#334';
    ctx.fillRect(5, 3, 2, 3);
    ctx.fillRect(9, 3, 2, 3);
    // Glow
    ctx.fillStyle = '#8899bb';
    ctx.fillRect(6, 4, 1, 1);
    ctx.fillRect(10, 4, 1, 1);
  });
}

export function createDemonTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'demon', 16, 16, (ctx) => {
    // Body
    ctx.fillStyle = '#cc2233';
    ctx.fillRect(2, 4, 12, 8);
    // Head
    ctx.fillRect(4, 1, 8, 5);
    // Horns
    ctx.fillStyle = '#991122';
    ctx.fillRect(3, 0, 2, 3);
    ctx.fillRect(11, 0, 2, 3);
    // Eyes
    ctx.fillStyle = '#ff0';
    ctx.fillRect(5, 2, 2, 2);
    ctx.fillRect(9, 2, 2, 2);
    // Legs
    ctx.fillStyle = '#aa1133';
    ctx.fillRect(3, 12, 4, 4);
    ctx.fillRect(9, 12, 4, 4);
    // Claws
    ctx.fillStyle = '#ddaa33';
    ctx.fillRect(1, 8, 2, 2);
    ctx.fillRect(13, 8, 2, 2);
  });
}

// --- Bullet ---
export function createBulletTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'bullet', 6, 6, (ctx) => {
    ctx.fillStyle = '#ffee55';
    ctx.fillRect(1, 0, 4, 1);
    ctx.fillRect(0, 1, 6, 4);
    ctx.fillRect(1, 5, 4, 1);
    // Glow
    ctx.fillStyle = '#fff';
    ctx.fillRect(2, 2, 2, 2);
  });
}

// --- Pickup (generic item, tinted by category at runtime) ---
export function createSkillOrbTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'item_pickup', 16, 16, (ctx) => {
    // Diamond shape with inner glow
    ctx.fillStyle = '#ffdd44';
    // Top
    ctx.fillRect(5, 0, 6, 2);
    ctx.fillRect(3, 2, 10, 2);
    // Middle
    ctx.fillRect(1, 4, 14, 6);
    ctx.fillRect(0, 5, 16, 4);
    // Bottom
    ctx.fillRect(3, 10, 10, 2);
    ctx.fillRect(5, 12, 6, 2);
    // Bottom tip
    ctx.fillRect(6, 14, 4, 2);
    // Inner highlight
    ctx.fillStyle = '#fff8cc';
    ctx.fillRect(5, 4, 4, 4);
    // Dark border lines
    ctx.fillStyle = '#aa8800';
    ctx.fillRect(5, 2, 6, 1);
    ctx.fillRect(3, 4, 1, 6);
    ctx.fillRect(12, 4, 1, 6);
    ctx.fillRect(5, 10, 6, 1);
    // Star
    ctx.fillStyle = '#fff';
    ctx.fillRect(7, 6, 2, 1);
    ctx.fillRect(6, 7, 1, 1);
    ctx.fillRect(9, 7, 1, 1);
  });
}

// --- Fireball orb (orbiting weapon) ---
export function createFireballOrbTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'fireball_orb', 12, 12, (ctx) => {
    ctx.fillStyle = '#ff4422';
    ctx.fillRect(2, 0, 8, 2);
    ctx.fillRect(0, 2, 12, 8);
    ctx.fillRect(2, 10, 8, 2);
    // Core
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(3, 3, 6, 6);
    // Bright center
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(4, 4, 4, 4);
    // White hot
    ctx.fillStyle = '#fff';
    ctx.fillRect(5, 5, 2, 2);
  });
}

// --- Pickup (potion) ---
export function createPotionTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'potion', 16, 16, (ctx) => {
    // Outer glow ring (green)
    ctx.fillStyle = '#44ff66';
    ctx.fillRect(2, 0, 12, 2);
    ctx.fillRect(0, 2, 16, 12);
    ctx.fillRect(2, 14, 12, 2);
    // Inner dark border
    ctx.fillStyle = '#118833';
    ctx.fillRect(3, 2, 10, 1);
    ctx.fillRect(3, 13, 10, 1);
    ctx.fillRect(2, 3, 1, 10);
    ctx.fillRect(13, 3, 1, 10);
    // Cross/plus icon (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 4, 4, 8);
    ctx.fillRect(4, 6, 8, 4);
    // Red heart center
    ctx.fillStyle = '#ff4466';
    ctx.fillRect(6, 6, 4, 4);
  });
}

// --- Lightning chain projectile ---
export function createLightningTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'lightning_texture', 16, 16, (ctx) => {
    // Main bolt - zigzag pattern (deep blue)
    ctx.fillStyle = '#2244cc';
    ctx.fillRect(2, 0, 2, 2);
    ctx.fillRect(4, 2, 2, 2);
    ctx.fillRect(2, 4, 2, 2);
    ctx.fillRect(6, 4, 2, 2);
    ctx.fillRect(4, 6, 2, 2);
    ctx.fillRect(2, 8, 2, 2);
    ctx.fillRect(6, 8, 2, 2);
    ctx.fillRect(8, 6, 2, 2);
    ctx.fillRect(10, 8, 2, 2);
    ctx.fillRect(8, 10, 2, 2);
    ctx.fillRect(6, 12, 2, 2);
    ctx.fillRect(10, 12, 2, 2);
    ctx.fillRect(8, 14, 2, 2);
    ctx.fillRect(12, 14, 2, 2);
    // Bright white core along the bolt
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 0, 1, 2);
    ctx.fillRect(5, 2, 1, 2);
    ctx.fillRect(3, 4, 1, 2);
    ctx.fillRect(7, 4, 1, 2);
    ctx.fillRect(5, 6, 1, 2);
    ctx.fillRect(3, 8, 1, 2);
    ctx.fillRect(7, 8, 1, 2);
    ctx.fillRect(9, 6, 1, 2);
    ctx.fillRect(11, 8, 1, 2);
    ctx.fillRect(9, 10, 1, 2);
    ctx.fillRect(7, 12, 1, 2);
    ctx.fillRect(11, 12, 1, 2);
    ctx.fillRect(9, 14, 1, 2);
    ctx.fillRect(13, 14, 1, 2);
    // Side branches (light blue)
    ctx.fillStyle = '#66aaff';
    ctx.fillRect(6, 2, 2, 1);
    ctx.fillRect(8, 4, 2, 1);
    ctx.fillRect(0, 6, 2, 1);
    ctx.fillRect(10, 6, 2, 1);
    ctx.fillRect(0, 10, 2, 1);
    ctx.fillRect(12, 10, 2, 1);
    ctx.fillRect(4, 14, 2, 1);
    ctx.fillRect(14, 12, 2, 1);
  });
}

// --- Sword slash wave ---
export function createSwordSlashTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'sword_slash', 16, 16, (ctx) => {
    // Outer arc (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 2, 3, 2);
    ctx.fillRect(3, 0, 2, 2);
    ctx.fillRect(5, 0, 2, 1);
    ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(10, 0, 2, 2);
    ctx.fillRect(12, 2, 3, 2);
    ctx.fillRect(14, 4, 2, 2);
    // Mid arc (light blue)
    ctx.fillStyle = '#aaddff';
    ctx.fillRect(1, 4, 2, 2);
    ctx.fillRect(3, 2, 2, 2);
    ctx.fillRect(5, 1, 4, 1);
    ctx.fillRect(11, 2, 2, 2);
    ctx.fillRect(13, 4, 2, 2);
    // Inner bright core
    ctx.fillStyle = '#e8f4ff';
    ctx.fillRect(2, 5, 2, 2);
    ctx.fillRect(4, 3, 3, 2);
    ctx.fillRect(8, 2, 3, 2);
    ctx.fillRect(12, 3, 2, 2);
    // Trail wisps (white)
    ctx.fillStyle = '#ccecff';
    ctx.fillRect(0, 5, 1, 3);
    ctx.fillRect(15, 6, 1, 3);
    ctx.fillRect(1, 7, 1, 2);
    ctx.fillRect(14, 8, 1, 2);
    // Spark points
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 2, 1, 1);
    ctx.fillRect(15, 4, 1, 1);
    ctx.fillRect(3, 0, 1, 1);
    ctx.fillRect(12, 0, 1, 1);
  });
}

// --- Ice freeze wave ---
export function createIceWaveTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'ice_wave', 16, 16, (ctx) => {
    // Wave ring (light blue)
    ctx.fillStyle = '#88ccff';
    ctx.fillRect(3, 0, 10, 2);
    ctx.fillRect(1, 2, 14, 2);
    ctx.fillRect(0, 4, 16, 2);
    ctx.fillRect(0, 10, 16, 2);
    ctx.fillRect(1, 12, 14, 2);
    ctx.fillRect(3, 14, 10, 2);
    // Ice crystals (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 1, 2, 1);
    ctx.fillRect(9, 1, 2, 1);
    ctx.fillRect(2, 3, 2, 1);
    ctx.fillRect(12, 3, 2, 1);
    ctx.fillRect(1, 5, 2, 1);
    ctx.fillRect(13, 5, 2, 1);
    ctx.fillRect(1, 10, 2, 1);
    ctx.fillRect(13, 10, 2, 1);
    ctx.fillRect(2, 13, 2, 1);
    ctx.fillRect(12, 13, 2, 1);
    ctx.fillRect(5, 15, 2, 1);
    ctx.fillRect(9, 15, 2, 1);
    // Inner frost fill (pale blue)
    ctx.fillStyle = '#c8e8ff';
    ctx.fillRect(2, 6, 12, 4);
    ctx.fillRect(4, 5, 8, 1);
    ctx.fillRect(4, 10, 8, 1);
    // Center sparkle (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
    // Crystal tips (bright blue)
    ctx.fillStyle = '#44aaee';
    ctx.fillRect(4, 0, 1, 1);
    ctx.fillRect(11, 0, 1, 1);
    ctx.fillRect(0, 6, 1, 2);
    ctx.fillRect(15, 6, 1, 2);
    ctx.fillRect(4, 15, 1, 1);
    ctx.fillRect(11, 15, 1, 1);
  });
}

// --- Poison snake projectile ---
export function createPoisonSnakeTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'poison_snake', 16, 16, (ctx) => {
    // Snake body - coiled S shape (green)
    ctx.fillStyle = '#33aa33';
    ctx.fillRect(4, 0, 3, 2);
    ctx.fillRect(2, 2, 4, 2);
    ctx.fillRect(3, 4, 5, 2);
    ctx.fillRect(7, 6, 5, 2);
    ctx.fillRect(8, 8, 4, 2);
    ctx.fillRect(5, 10, 5, 2);
    ctx.fillRect(3, 12, 5, 2);
    ctx.fillRect(6, 14, 3, 2);
    // Belly highlight (yellow-green)
    ctx.fillStyle = '#aadd44';
    ctx.fillRect(5, 0, 2, 2);
    ctx.fillRect(3, 2, 2, 2);
    ctx.fillRect(4, 4, 3, 2);
    ctx.fillRect(8, 6, 3, 2);
    ctx.fillRect(9, 8, 2, 2);
    ctx.fillRect(6, 10, 3, 2);
    ctx.fillRect(4, 12, 3, 2);
    ctx.fillRect(7, 14, 2, 2);
    // Head details (dark green)
    ctx.fillStyle = '#227722';
    ctx.fillRect(4, 0, 3, 1);
    // Eyes (red)
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(4, 1, 1, 1);
    ctx.fillRect(6, 1, 1, 1);
    // Fangs (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 2, 1, 1);
    ctx.fillRect(6, 2, 1, 1);
    // Venom drops (bright green)
    ctx.fillStyle = '#66ff66';
    ctx.fillRect(3, 3, 1, 1);
    ctx.fillRect(10, 9, 1, 1);
    ctx.fillRect(4, 13, 1, 1);
  });
}

// --- Laser beam ---
export function createLaserBeamTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'laser_beam', 16, 16, (ctx) => {
    // Outer glow (dark magenta)
    ctx.fillStyle = '#aa2266';
    ctx.fillRect(5, 0, 6, 16);
    ctx.fillRect(3, 0, 10, 2);
    ctx.fillRect(3, 14, 10, 2);
    // Main beam body (magenta-pink)
    ctx.fillStyle = '#dd3388';
    ctx.fillRect(6, 1, 4, 14);
    ctx.fillRect(4, 2, 8, 12);
    // Inner beam (bright pink)
    ctx.fillStyle = '#ff66aa';
    ctx.fillRect(6, 2, 4, 12);
    // Core (white-hot center)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 3, 2, 10);
    // Energy particles along edges
    ctx.fillStyle = '#ffaacc';
    ctx.fillRect(3, 4, 2, 1);
    ctx.fillRect(11, 6, 2, 1);
    ctx.fillRect(3, 9, 2, 1);
    ctx.fillRect(11, 11, 2, 1);
    ctx.fillRect(5, 0, 1, 1);
    ctx.fillRect(10, 0, 1, 1);
    ctx.fillRect(5, 15, 1, 1);
    ctx.fillRect(10, 15, 1, 1);
    // Bright tip points (white)
    ctx.fillStyle = '#ff88bb';
    ctx.fillRect(6, 0, 4, 2);
    ctx.fillRect(6, 14, 4, 2);
  });
}

// --- Death scythe ---
export function createDeathScytheTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'death_scythe', 16, 16, (ctx) => {
    // Handle (dark gray-brown)
    ctx.fillStyle = '#443344';
    ctx.fillRect(10, 6, 2, 10);
    ctx.fillRect(12, 7, 2, 8);
    // Handle highlight
    ctx.fillStyle = '#554455';
    ctx.fillRect(11, 6, 1, 10);
    // Blade - curved scythe shape (deep purple)
    ctx.fillStyle = '#7722aa';
    ctx.fillRect(0, 0, 10, 2);
    ctx.fillRect(2, 2, 8, 2);
    ctx.fillRect(4, 4, 8, 2);
    ctx.fillRect(6, 6, 6, 2);
    ctx.fillRect(8, 8, 4, 2);
    ctx.fillRect(10, 10, 2, 2);
    // Blade edge highlight (purple)
    ctx.fillStyle = '#9944cc';
    ctx.fillRect(0, 0, 10, 1);
    ctx.fillRect(2, 2, 8, 1);
    ctx.fillRect(4, 4, 8, 1);
    ctx.fillRect(6, 6, 6, 1);
    ctx.fillRect(8, 8, 4, 1);
    ctx.fillRect(10, 10, 2, 1);
    // Sharp edge (black)
    ctx.fillStyle = '#110011';
    ctx.fillRect(0, 1, 2, 1);
    ctx.fillRect(2, 3, 2, 1);
    ctx.fillRect(4, 5, 2, 1);
    ctx.fillRect(6, 7, 2, 1);
    ctx.fillRect(8, 9, 2, 1);
    // Blade inner glow (light purple)
    ctx.fillStyle = '#bb66ee';
    ctx.fillRect(3, 0, 4, 1);
    ctx.fillRect(5, 2, 4, 1);
    ctx.fillRect(7, 4, 4, 1);
    // Tip decoration (bright)
    ctx.fillStyle = '#dd88ff';
    ctx.fillRect(0, 0, 2, 2);
  });
}

// --- Fragment: Common (white) ---
export function createFragmentCommonTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'fragment_common', 12, 12, (ctx) => {
    // Diamond shape (light gray)
    ctx.fillStyle = '#bbbbbb';
    ctx.fillRect(4, 0, 4, 2);
    ctx.fillRect(2, 2, 8, 2);
    ctx.fillRect(0, 4, 12, 4);
    ctx.fillRect(2, 8, 8, 2);
    ctx.fillRect(4, 10, 4, 2);
    // Inner highlight (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 2, 4, 2);
    ctx.fillRect(2, 4, 8, 2);
    ctx.fillRect(4, 6, 4, 2);
    // Bright center
    ctx.fillStyle = '#eeeeff';
    ctx.fillRect(4, 4, 4, 2);
    // Outline edges (gray)
    ctx.fillStyle = '#888888';
    ctx.fillRect(4, 0, 4, 1);
    ctx.fillRect(2, 2, 1, 1);
    ctx.fillRect(9, 2, 1, 1);
    ctx.fillRect(0, 4, 1, 4);
    ctx.fillRect(11, 4, 1, 4);
    ctx.fillRect(2, 9, 1, 1);
    ctx.fillRect(9, 9, 1, 1);
    ctx.fillRect(4, 11, 4, 1);
  });
}

// --- Fragment: Uncommon (green) ---
export function createFragmentUncommonTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'fragment_uncommon', 12, 12, (ctx) => {
    // Diamond shape (green)
    ctx.fillStyle = '#33bb44';
    ctx.fillRect(4, 0, 4, 2);
    ctx.fillRect(2, 2, 8, 2);
    ctx.fillRect(0, 4, 12, 4);
    ctx.fillRect(2, 8, 8, 2);
    ctx.fillRect(4, 10, 4, 2);
    // Inner highlight (light green)
    ctx.fillStyle = '#88ee66';
    ctx.fillRect(4, 2, 4, 2);
    ctx.fillRect(2, 4, 8, 2);
    ctx.fillRect(4, 6, 4, 2);
    // Bright center
    ctx.fillStyle = '#aaffaa';
    ctx.fillRect(4, 4, 4, 2);
    // Outline edges (dark green)
    ctx.fillStyle = '#228833';
    ctx.fillRect(4, 0, 4, 1);
    ctx.fillRect(2, 2, 1, 1);
    ctx.fillRect(9, 2, 1, 1);
    ctx.fillRect(0, 4, 1, 4);
    ctx.fillRect(11, 4, 1, 4);
    ctx.fillRect(2, 9, 1, 1);
    ctx.fillRect(9, 9, 1, 1);
    ctx.fillRect(4, 11, 4, 1);
  });
}

// --- Fragment: Rare (blue) ---
export function createFragmentRareTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'fragment_rare', 12, 12, (ctx) => {
    // Diamond shape (blue)
    ctx.fillStyle = '#3366dd';
    ctx.fillRect(4, 0, 4, 2);
    ctx.fillRect(2, 2, 8, 2);
    ctx.fillRect(0, 4, 12, 4);
    ctx.fillRect(2, 8, 8, 2);
    ctx.fillRect(4, 10, 4, 2);
    // Inner highlight (light blue)
    ctx.fillStyle = '#66aaff';
    ctx.fillRect(4, 2, 4, 2);
    ctx.fillRect(2, 4, 8, 2);
    ctx.fillRect(4, 6, 4, 2);
    // Bright center
    ctx.fillStyle = '#aaccff';
    ctx.fillRect(4, 4, 4, 2);
    // Outline edges (dark blue)
    ctx.fillStyle = '#2244aa';
    ctx.fillRect(4, 0, 4, 1);
    ctx.fillRect(2, 2, 1, 1);
    ctx.fillRect(9, 2, 1, 1);
    ctx.fillRect(0, 4, 1, 4);
    ctx.fillRect(11, 4, 1, 4);
    ctx.fillRect(2, 9, 1, 1);
    ctx.fillRect(9, 9, 1, 1);
    ctx.fillRect(4, 11, 4, 1);
  });
}

// --- Fragment: Epic (purple) ---
export function createFragmentEpicTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'fragment_epic', 12, 12, (ctx) => {
    // Diamond shape (purple)
    ctx.fillStyle = '#8833cc';
    ctx.fillRect(4, 0, 4, 2);
    ctx.fillRect(2, 2, 8, 2);
    ctx.fillRect(0, 4, 12, 4);
    ctx.fillRect(2, 8, 8, 2);
    ctx.fillRect(4, 10, 4, 2);
    // Inner highlight (light purple)
    ctx.fillStyle = '#aa66ee';
    ctx.fillRect(4, 2, 4, 2);
    ctx.fillRect(2, 4, 8, 2);
    ctx.fillRect(4, 6, 4, 2);
    // Bright center
    ctx.fillStyle = '#ccaaff';
    ctx.fillRect(4, 4, 4, 2);
    // Outline edges (dark purple)
    ctx.fillStyle = '#5522aa';
    ctx.fillRect(4, 0, 4, 1);
    ctx.fillRect(2, 2, 1, 1);
    ctx.fillRect(9, 2, 1, 1);
    ctx.fillRect(0, 4, 1, 4);
    ctx.fillRect(11, 4, 1, 4);
    ctx.fillRect(2, 9, 1, 1);
    ctx.fillRect(9, 9, 1, 1);
    ctx.fillRect(4, 11, 4, 1);
  });
}

// --- Fragment: Legendary (gold) ---
export function createFragmentLegendaryTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'fragment_legendary', 12, 12, (ctx) => {
    // Diamond shape (gold)
    ctx.fillStyle = '#ddaa22';
    ctx.fillRect(4, 0, 4, 2);
    ctx.fillRect(2, 2, 8, 2);
    ctx.fillRect(0, 4, 12, 4);
    ctx.fillRect(2, 8, 8, 2);
    ctx.fillRect(4, 10, 4, 2);
    // Inner highlight (light gold)
    ctx.fillStyle = '#ffdd66';
    ctx.fillRect(4, 2, 4, 2);
    ctx.fillRect(2, 4, 8, 2);
    ctx.fillRect(4, 6, 4, 2);
    // Bright center (pale gold)
    ctx.fillStyle = '#ffeeaa';
    ctx.fillRect(4, 4, 4, 2);
    // Outline edges (dark gold)
    ctx.fillStyle = '#aa7711';
    ctx.fillRect(4, 0, 4, 1);
    ctx.fillRect(2, 2, 1, 1);
    ctx.fillRect(9, 2, 1, 1);
    ctx.fillRect(0, 4, 1, 4);
    ctx.fillRect(11, 4, 1, 4);
    ctx.fillRect(2, 9, 1, 1);
    ctx.fillRect(9, 9, 1, 1);
    ctx.fillRect(4, 11, 4, 1);
    // Sparkle highlights (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 4, 2, 1);
  });
}

// --- Fusion flash effect ---
export function createFusionFlashTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'fusion_flash', 32, 32, (ctx) => {
    // Outer glow ring (yellow)
    ctx.fillStyle = '#ffcc22';
    ctx.fillRect(8, 0, 16, 4);
    ctx.fillRect(4, 4, 24, 4);
    ctx.fillRect(2, 8, 28, 4);
    ctx.fillRect(0, 12, 32, 8);
    ctx.fillRect(2, 20, 28, 4);
    ctx.fillRect(4, 24, 24, 4);
    ctx.fillRect(8, 28, 16, 4);
    // Mid burst (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 4, 12, 4);
    ctx.fillRect(6, 8, 20, 4);
    ctx.fillRect(4, 12, 24, 8);
    ctx.fillRect(6, 20, 20, 4);
    ctx.fillRect(10, 24, 12, 4);
    // Inner hot core (bright yellow)
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(12, 8, 8, 4);
    ctx.fillRect(8, 12, 16, 8);
    ctx.fillRect(12, 20, 8, 4);
    // White-hot center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 12, 8, 8);
    ctx.fillRect(14, 10, 4, 12);
    ctx.fillRect(10, 14, 12, 4);
    // Radiating spikes (white)
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(15, 0, 2, 6);
    ctx.fillRect(15, 26, 2, 6);
    ctx.fillRect(0, 15, 6, 2);
    ctx.fillRect(26, 15, 6, 2);
    // Diagonal spikes
    ctx.fillRect(4, 4, 3, 2);
    ctx.fillRect(25, 4, 3, 2);
    ctx.fillRect(4, 26, 3, 2);
    ctx.fillRect(25, 26, 3, 2);
    // Outer sparkle tips (yellow)
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(14, 0, 4, 2);
    ctx.fillRect(14, 30, 4, 2);
    ctx.fillRect(0, 14, 2, 4);
    ctx.fillRect(30, 14, 2, 4);
  });
}

// --- Item Icons (16x16 each) ---
export function createItemIcons(scene: Phaser.Scene) {
  // 1. icon_basic_shot - 黄色小圆弹
  generateTexture(scene, 'icon_basic_shot', 16, 16, (ctx) => {
    // Outer glow
    ctx.fillStyle = '#ccaa22';
    ctx.fillRect(5, 3, 6, 10);
    ctx.fillRect(3, 5, 10, 6);
    // Main bullet body
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(6, 4, 4, 8);
    ctx.fillRect(4, 6, 8, 4);
    // Highlight
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(6, 5, 3, 3);
    // Bright center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 6, 2, 2);
  });

  // 2. icon_shotgun - 橙色扇形（表示散弹）
  generateTexture(scene, 'icon_shotgun', 16, 16, (ctx) => {
    // Fan spread - 3 bullet trails from bottom center
    ctx.fillStyle = '#ff8822';
    // Left pellet
    ctx.fillRect(1, 1, 2, 2);
    ctx.fillRect(3, 3, 2, 2);
    // Center pellet
    ctx.fillRect(7, 0, 2, 2);
    ctx.fillRect(7, 2, 2, 2);
    // Right pellet
    ctx.fillRect(13, 1, 2, 2);
    ctx.fillRect(11, 3, 2, 2);
    // Barrel base
    ctx.fillStyle = '#cc6600';
    ctx.fillRect(6, 9, 4, 5);
    ctx.fillRect(5, 10, 6, 3);
    // Barrel highlight
    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(7, 10, 2, 3);
    // Muzzle flash
    ctx.fillStyle = '#ffcc66';
    ctx.fillRect(6, 7, 4, 2);
    ctx.fillRect(5, 8, 6, 1);
    // Bright tips
    ctx.fillStyle = '#ffeeaa';
    ctx.fillRect(1, 1, 1, 1);
    ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(14, 1, 1, 1);
  });

  // 3. icon_fireball_orbit - 红色圆+旋转箭头
  generateTexture(scene, 'icon_fireball_orbit', 16, 16, (ctx) => {
    // Orbit ring (dark red)
    ctx.fillStyle = '#882211';
    ctx.fillRect(3, 1, 10, 2);
    ctx.fillRect(1, 3, 2, 10);
    ctx.fillRect(13, 3, 2, 10);
    ctx.fillRect(3, 13, 10, 2);
    // Orbit highlight (orange)
    ctx.fillStyle = '#ee5522';
    ctx.fillRect(4, 1, 8, 1);
    ctx.fillRect(1, 4, 1, 8);
    ctx.fillRect(14, 4, 1, 8);
    ctx.fillRect(4, 14, 8, 1);
    // Center fireball (red)
    ctx.fillStyle = '#ff3322';
    ctx.fillRect(5, 5, 6, 6);
    ctx.fillRect(4, 6, 8, 4);
    // Fireball inner (orange)
    ctx.fillStyle = '#ff7744';
    ctx.fillRect(6, 6, 4, 4);
    // Fireball core (yellow)
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(7, 7, 2, 2);
    // Rotation arrow (bright yellow)
    ctx.fillStyle = '#ffee66';
    // Arrow head (top-right)
    ctx.fillRect(11, 2, 3, 2);
    ctx.fillRect(13, 0, 2, 2);
    // Arrow tail (bottom-left)
    ctx.fillRect(2, 13, 3, 2);
    ctx.fillRect(0, 12, 2, 2);
  });

  // 4. icon_boomerang - 绿色V形（回旋镖形状）
  generateTexture(scene, 'icon_boomerang', 16, 16, (ctx) => {
    // Main V shape (green)
    ctx.fillStyle = '#33bb44';
    // Left arm of V
    ctx.fillRect(1, 2, 3, 2);
    ctx.fillRect(3, 4, 3, 2);
    ctx.fillRect(5, 6, 3, 2);
    ctx.fillRect(6, 8, 3, 2);
    // Right arm of V
    ctx.fillRect(12, 2, 3, 2);
    ctx.fillRect(10, 4, 3, 2);
    ctx.fillRect(8, 6, 3, 2);
    ctx.fillRect(7, 8, 3, 2);
    // Bottom point
    ctx.fillRect(6, 10, 4, 2);
    // Highlight (light green)
    ctx.fillStyle = '#66dd55';
    ctx.fillRect(2, 2, 2, 1);
    ctx.fillRect(4, 4, 2, 1);
    ctx.fillRect(6, 6, 2, 1);
    ctx.fillRect(13, 2, 2, 1);
    ctx.fillRect(11, 4, 2, 1);
    ctx.fillRect(9, 6, 2, 1);
    // Tips (bright green)
    ctx.fillStyle = '#aaff66';
    ctx.fillRect(1, 2, 2, 2);
    ctx.fillRect(13, 2, 2, 2);
    // Motion lines (pale green)
    ctx.fillStyle = '#88cc44';
    ctx.fillRect(0, 5, 2, 1);
    ctx.fillRect(14, 5, 2, 1);
    ctx.fillRect(6, 12, 4, 1);
  });

  // 5. icon_lightning - 蓝色闪电符号
  generateTexture(scene, 'icon_lightning', 16, 16, (ctx) => {
    // Lightning bolt (blue)
    ctx.fillStyle = '#2266ee';
    // Top segment going right
    ctx.fillRect(6, 0, 5, 2);
    ctx.fillRect(8, 2, 4, 2);
    // Middle segment going left
    ctx.fillRect(4, 4, 6, 2);
    ctx.fillRect(2, 6, 6, 2);
    // Bottom segment going right
    ctx.fillRect(6, 8, 6, 2);
    ctx.fillRect(8, 10, 4, 2);
    // Tip
    ctx.fillRect(10, 12, 3, 2);
    ctx.fillRect(11, 14, 2, 2);
    // Bright core (light blue)
    ctx.fillStyle = '#66aaff';
    ctx.fillRect(7, 0, 3, 2);
    ctx.fillRect(9, 2, 2, 2);
    ctx.fillRect(5, 4, 4, 2);
    ctx.fillRect(3, 6, 4, 2);
    ctx.fillRect(7, 8, 4, 2);
    ctx.fillRect(9, 10, 2, 2);
    ctx.fillRect(11, 12, 2, 2);
    // White highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(8, 1, 2, 1);
    ctx.fillRect(5, 5, 2, 1);
    ctx.fillRect(8, 9, 2, 1);
    // Spark (white)
    ctx.fillStyle = '#ccddff';
    ctx.fillRect(3, 3, 2, 1);
    ctx.fillRect(12, 5, 2, 1);
  });

  // 6. icon_sword_slash - 白色剑形
  generateTexture(scene, 'icon_sword_slash', 16, 16, (ctx) => {
    // Blade (white/silver)
    ctx.fillStyle = '#ddddee';
    ctx.fillRect(12, 0, 2, 3);
    ctx.fillRect(10, 2, 3, 2);
    ctx.fillRect(8, 4, 3, 2);
    ctx.fillRect(6, 6, 3, 2);
    ctx.fillRect(4, 8, 3, 2);
    ctx.fillRect(2, 10, 3, 2);
    ctx.fillRect(0, 12, 3, 2);
    // Blade edge (bright white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(13, 0, 1, 3);
    ctx.fillRect(12, 2, 1, 2);
    ctx.fillRect(10, 4, 1, 2);
    ctx.fillRect(8, 6, 1, 2);
    ctx.fillRect(6, 8, 1, 2);
    ctx.fillRect(4, 10, 1, 2);
    ctx.fillRect(2, 12, 1, 2);
    // Cross-guard (gold)
    ctx.fillStyle = '#ddaa33';
    ctx.fillRect(0, 12, 5, 2);
    ctx.fillRect(4, 11, 3, 1);
    // Handle (brown)
    ctx.fillStyle = '#886633';
    ctx.fillRect(0, 14, 3, 2);
    ctx.fillRect(1, 13, 2, 1);
    // Pommel (gold)
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(0, 14, 2, 2);
    // Slash effect (light blue)
    ctx.fillStyle = '#aaddff';
    ctx.fillRect(10, 0, 1, 1);
    ctx.fillRect(14, 1, 2, 1);
    ctx.fillRect(13, 3, 2, 1);
    ctx.fillRect(11, 5, 2, 1);
  });

  // 7. icon_ice_wave - 浅蓝色菱形（冰晶）
  generateTexture(scene, 'icon_ice_wave', 16, 16, (ctx) => {
    // Diamond shape (light blue)
    ctx.fillStyle = '#88ccff';
    ctx.fillRect(6, 0, 4, 2);
    ctx.fillRect(4, 2, 8, 2);
    ctx.fillRect(2, 4, 12, 2);
    ctx.fillRect(0, 6, 16, 4);
    ctx.fillRect(2, 10, 12, 2);
    ctx.fillRect(4, 12, 8, 2);
    ctx.fillRect(6, 14, 4, 2);
    // Inner crystal (white)
    ctx.fillStyle = '#ccecff';
    ctx.fillRect(6, 2, 4, 2);
    ctx.fillRect(4, 4, 8, 2);
    ctx.fillRect(2, 6, 12, 4);
    ctx.fillRect(4, 10, 8, 2);
    ctx.fillRect(6, 12, 4, 2);
    // Cross pattern (bright white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 1, 2, 14);
    ctx.fillRect(1, 7, 14, 2);
    // Crystal tips (deep blue)
    ctx.fillStyle = '#44aaee';
    ctx.fillRect(6, 0, 4, 1);
    ctx.fillRect(6, 15, 4, 1);
    ctx.fillRect(0, 6, 1, 4);
    ctx.fillRect(15, 6, 1, 4);
    // Sparkle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
  });

  // 8. icon_poison_snake - 绿色S形蛇
  generateTexture(scene, 'icon_poison_snake', 16, 16, (ctx) => {
    // Snake body S-curve (green)
    ctx.fillStyle = '#33aa33';
    ctx.fillRect(10, 1, 4, 2);
    ctx.fillRect(12, 3, 3, 2);
    ctx.fillRect(8, 5, 6, 2);
    ctx.fillRect(4, 7, 6, 2);
    ctx.fillRect(1, 9, 6, 2);
    ctx.fillRect(1, 11, 4, 2);
    ctx.fillRect(3, 13, 5, 2);
    // Belly highlight (light green)
    ctx.fillStyle = '#66dd44';
    ctx.fillRect(11, 1, 2, 2);
    ctx.fillRect(13, 3, 2, 2);
    ctx.fillRect(9, 5, 4, 2);
    ctx.fillRect(5, 7, 4, 2);
    ctx.fillRect(2, 9, 4, 2);
    ctx.fillRect(2, 11, 3, 2);
    ctx.fillRect(4, 13, 3, 2);
    // Head (dark green)
    ctx.fillStyle = '#228822';
    ctx.fillRect(10, 0, 4, 2);
    ctx.fillRect(13, 1, 1, 1);
    // Eyes (red)
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(11, 1, 1, 1);
    ctx.fillRect(13, 1, 1, 1);
    // Venom drops (bright green)
    ctx.fillStyle = '#66ff66';
    ctx.fillRect(8, 6, 1, 1);
    ctx.fillRect(6, 8, 1, 1);
    ctx.fillRect(3, 14, 1, 1);
  });

  // 9. icon_laser_beam - 紫红色竖条（光柱）
  generateTexture(scene, 'icon_laser_beam', 16, 16, (ctx) => {
    // Outer glow (dark magenta)
    ctx.fillStyle = '#881155';
    ctx.fillRect(4, 0, 8, 16);
    ctx.fillRect(2, 1, 12, 14);
    // Main beam (magenta-pink)
    ctx.fillStyle = '#dd2288';
    ctx.fillRect(5, 1, 6, 14);
    ctx.fillRect(4, 2, 8, 12);
    // Inner beam (bright pink)
    ctx.fillStyle = '#ff44aa';
    ctx.fillRect(6, 2, 4, 12);
    // Core (white-hot)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 3, 2, 10);
    // Energy particles on sides
    ctx.fillStyle = '#ff88cc';
    ctx.fillRect(2, 3, 2, 1);
    ctx.fillRect(12, 6, 2, 1);
    ctx.fillRect(2, 9, 2, 1);
    ctx.fillRect(12, 12, 2, 1);
    // Top/bottom flare
    ctx.fillStyle = '#ffaadd';
    ctx.fillRect(5, 0, 6, 2);
    ctx.fillRect(5, 14, 6, 2);
    // Bright tip
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(7, 15, 2, 1);
  });

  // 10. icon_death_scythe - 紫色镰刀形状
  generateTexture(scene, 'icon_death_scythe', 16, 16, (ctx) => {
    // Handle (dark brown)
    ctx.fillStyle = '#553344';
    ctx.fillRect(11, 6, 2, 10);
    ctx.fillRect(12, 7, 2, 8);
    // Handle highlight
    ctx.fillStyle = '#664455';
    ctx.fillRect(12, 6, 1, 10);
    // Blade curve (purple)
    ctx.fillStyle = '#7722aa';
    ctx.fillRect(0, 0, 10, 2);
    ctx.fillRect(2, 2, 8, 2);
    ctx.fillRect(4, 4, 8, 2);
    ctx.fillRect(7, 6, 5, 2);
    ctx.fillRect(9, 8, 4, 2);
    ctx.fillRect(11, 10, 2, 1);
    // Blade edge highlight (light purple)
    ctx.fillStyle = '#9944cc';
    ctx.fillRect(0, 0, 10, 1);
    ctx.fillRect(2, 2, 1, 1);
    ctx.fillRect(4, 4, 1, 1);
    ctx.fillRect(7, 6, 1, 1);
    // Sharp edge (dark)
    ctx.fillStyle = '#220033';
    ctx.fillRect(0, 1, 2, 1);
    ctx.fillRect(2, 3, 2, 1);
    ctx.fillRect(4, 5, 2, 1);
    ctx.fillRect(7, 7, 2, 1);
    // Inner glow (bright purple)
    ctx.fillStyle = '#bb66ee';
    ctx.fillRect(3, 0, 4, 1);
    ctx.fillRect(5, 2, 4, 1);
    ctx.fillRect(7, 4, 3, 1);
    // Tip (bright)
    ctx.fillStyle = '#dd88ff';
    ctx.fillRect(0, 0, 2, 2);
  });

  // 11. icon_power - 红色拳头/力量
  generateTexture(scene, 'icon_power', 16, 16, (ctx) => {
    // Fist silhouette (red)
    ctx.fillStyle = '#cc2233';
    // Knuckles row
    ctx.fillRect(3, 3, 3, 3);
    ctx.fillRect(6, 2, 3, 3);
    ctx.fillRect(9, 3, 3, 3);
    // Fist body
    ctx.fillRect(3, 6, 9, 4);
    // Thumb
    ctx.fillRect(2, 6, 2, 3);
    // Wrist
    ctx.fillRect(4, 10, 7, 3);
    ctx.fillRect(5, 13, 5, 2);
    // Knuckle highlights
    ctx.fillStyle = '#ff4455';
    ctx.fillRect(4, 3, 2, 2);
    ctx.fillRect(7, 2, 2, 2);
    ctx.fillRect(10, 3, 2, 2);
    // Fist highlight
    ctx.fillStyle = '#ee3344';
    ctx.fillRect(4, 6, 7, 3);
    // Power aura glow (orange)
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(1, 1, 2, 2);
    ctx.fillRect(13, 1, 2, 2);
    ctx.fillRect(0, 4, 2, 2);
    ctx.fillRect(14, 4, 2, 2);
    // Impact flash (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 4, 2, 2);
    ctx.fillRect(8, 4, 2, 2);
  });

  // 12. icon_bullet_speed - 青色右箭头
  generateTexture(scene, 'icon_bullet_speed', 16, 16, (ctx) => {
    // Arrow body (cyan)
    ctx.fillStyle = '#22ccbb';
    ctx.fillRect(2, 6, 8, 4);
    // Arrowhead (cyan)
    ctx.fillRect(10, 4, 2, 8);
    ctx.fillRect(12, 2, 2, 12);
    ctx.fillRect(14, 0, 2, 16);
    // Arrowhead highlight (light cyan)
    ctx.fillStyle = '#55eedd';
    ctx.fillRect(3, 6, 6, 4);
    ctx.fillRect(10, 5, 2, 6);
    ctx.fillRect(12, 3, 2, 10);
    ctx.fillRect(14, 1, 2, 14);
    // Tip highlight (white)
    ctx.fillStyle = '#aaffee';
    ctx.fillRect(14, 2, 2, 12);
    // Speed lines (pale cyan)
    ctx.fillStyle = '#88eecc';
    ctx.fillRect(0, 3, 3, 1);
    ctx.fillRect(0, 8, 3, 1);
    ctx.fillRect(1, 12, 3, 1);
    // Motion trail
    ctx.fillStyle = '#44ddbb';
    ctx.fillRect(0, 4, 2, 1);
    ctx.fillRect(1, 11, 2, 1);
  });

  // 13. icon_bullet_size - 放大镜/大小扩展
  generateTexture(scene, 'icon_bullet_size', 16, 16, (ctx) => {
    // Magnifying glass lens (yellow circle)
    ctx.fillStyle = '#ddaa22';
    ctx.fillRect(2, 1, 8, 2);
    ctx.fillRect(0, 3, 3, 6);
    ctx.fillRect(9, 3, 3, 6);
    ctx.fillRect(2, 9, 8, 2);
    // Lens fill (bright yellow)
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(3, 2, 6, 2);
    ctx.fillRect(2, 4, 8, 4);
    ctx.fillRect(3, 8, 6, 2);
    // Lens shine (white)
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(4, 3, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 4, 2, 1);
    // Handle (brown diagonal)
    ctx.fillStyle = '#886633';
    ctx.fillRect(11, 10, 2, 2);
    ctx.fillRect(12, 11, 2, 2);
    ctx.fillRect(13, 12, 2, 2);
    ctx.fillRect(14, 13, 2, 2);
    // Handle highlight
    ctx.fillStyle = '#aa8844';
    ctx.fillRect(12, 10, 1, 2);
    ctx.fillRect(13, 12, 1, 2);
    // "+" symbol inside lens (size up)
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(5, 4, 2, 4);
    ctx.fillRect(4, 5, 4, 2);
  });

  // 14. icon_splash - 爆炸冲击波（同心圆扩散）
  generateTexture(scene, 'icon_splash', 16, 16, (ctx) => {
    // Outer shockwave ring (dark orange)
    ctx.fillStyle = '#cc4400';
    ctx.fillRect(3, 0, 10, 2);
    ctx.fillRect(1, 2, 2, 2);
    ctx.fillRect(13, 2, 2, 2);
    ctx.fillRect(0, 4, 2, 8);
    ctx.fillRect(14, 4, 2, 8);
    ctx.fillRect(1, 12, 2, 2);
    ctx.fillRect(13, 12, 2, 2);
    ctx.fillRect(3, 14, 10, 2);
    // Inner shockwave (orange)
    ctx.fillStyle = '#ff6622';
    ctx.fillRect(5, 3, 6, 2);
    ctx.fillRect(3, 5, 2, 6);
    ctx.fillRect(11, 5, 2, 6);
    ctx.fillRect(5, 11, 6, 2);
    // Explosion core (bright orange)
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(6, 5, 4, 6);
    ctx.fillRect(5, 6, 6, 4);
    // Hot center (yellow-white)
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillStyle = '#ffeeaa';
    ctx.fillRect(7, 7, 2, 2);
    // Directional force arrows (bright)
    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(0, 7, 1, 2);
    ctx.fillRect(15, 7, 1, 2);
    ctx.fillRect(7, 15, 2, 1);
    // Diagonal force
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(2, 1, 2, 2);
    ctx.fillRect(12, 1, 2, 2);
    ctx.fillRect(2, 13, 2, 2);
    ctx.fillRect(12, 13, 2, 2);
  });

  // 15. icon_chain_enhance - 蓝色链环
  generateTexture(scene, 'icon_chain_enhance', 16, 16, (ctx) => {
    // Top chain link (blue)
    ctx.fillStyle = '#2266dd';
    ctx.fillRect(3, 1, 10, 2);
    ctx.fillRect(1, 3, 4, 5);
    ctx.fillRect(11, 3, 4, 5);
    ctx.fillRect(3, 8, 10, 2);
    // Top link highlight
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(4, 1, 8, 1);
    ctx.fillRect(2, 3, 2, 4);
    ctx.fillRect(12, 3, 2, 4);
    // Bottom chain link (blue, offset)
    ctx.fillStyle = '#2266dd';
    ctx.fillRect(3, 8, 10, 2);
    ctx.fillRect(1, 10, 4, 5);
    ctx.fillRect(11, 10, 4, 5);
    ctx.fillRect(3, 15, 10, 1);
    // Bottom link highlight
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(4, 8, 8, 1);
    ctx.fillRect(2, 10, 2, 4);
    ctx.fillRect(12, 10, 2, 4);
    // Link join shine (light blue)
    ctx.fillStyle = '#88bbff';
    ctx.fillRect(6, 7, 4, 2);
    // Bright spots
    ctx.fillStyle = '#aaddff';
    ctx.fillRect(7, 3, 2, 1);
    ctx.fillRect(7, 11, 2, 1);
  });

  // 16. icon_pierce_core - 青色穿透线
  generateTexture(scene, 'icon_pierce_core', 16, 16, (ctx) => {
    // Pierce line (cyan) - horizontal arrow through
    ctx.fillStyle = '#22bbcc';
    ctx.fillRect(0, 7, 16, 2);
    // Arrowhead on right
    ctx.fillRect(12, 5, 2, 2);
    ctx.fillRect(14, 4, 2, 2);
    ctx.fillRect(12, 9, 2, 2);
    ctx.fillRect(14, 10, 2, 2);
    // Main line highlight
    ctx.fillStyle = '#55eeff';
    ctx.fillRect(1, 7, 14, 2);
    // Core bright (white)
    ctx.fillStyle = '#aaffff';
    ctx.fillRect(2, 7, 12, 2);
    // Impact point (left side)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 6, 3, 4);
    ctx.fillRect(1, 5, 2, 6);
    // Pierce through effect (pale cyan)
    ctx.fillStyle = '#88ddcc';
    ctx.fillRect(4, 5, 1, 2);
    ctx.fillRect(4, 9, 1, 2);
    ctx.fillRect(7, 4, 1, 3);
    ctx.fillRect(7, 9, 1, 3);
    // Bright tip
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 7, 2, 2);
  });

  // 17. icon_barrage - 弹幕/密集弹雨
  generateTexture(scene, 'icon_barrage', 16, 16, (ctx) => {
    // Rain of bullets from top (orange-red)
    ctx.fillStyle = '#ff6622';
    // Column 1
    ctx.fillRect(1, 0, 2, 2);
    ctx.fillRect(2, 4, 2, 2);
    ctx.fillRect(1, 8, 2, 2);
    ctx.fillRect(2, 12, 2, 2);
    // Column 2
    ctx.fillRect(5, 2, 2, 2);
    ctx.fillRect(6, 6, 2, 2);
    ctx.fillRect(5, 10, 2, 2);
    ctx.fillRect(6, 14, 2, 2);
    // Column 3
    ctx.fillRect(9, 0, 2, 2);
    ctx.fillRect(10, 4, 2, 2);
    ctx.fillRect(9, 8, 2, 2);
    ctx.fillRect(10, 12, 2, 2);
    // Column 4
    ctx.fillRect(13, 2, 2, 2);
    ctx.fillRect(14, 6, 2, 2);
    ctx.fillRect(13, 10, 2, 2);
    // Bright tips
    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillRect(5, 2, 1, 1);
    ctx.fillRect(9, 0, 1, 1);
    ctx.fillRect(13, 2, 1, 1);
    // Hot cores
    ctx.fillStyle = '#ffdd66';
    ctx.fillRect(2, 1, 1, 1);
    ctx.fillRect(6, 3, 1, 1);
    ctx.fillRect(10, 1, 1, 1);
    // Impact zone at bottom
    ctx.fillStyle = '#cc4400';
    ctx.fillRect(0, 14, 16, 2);
    ctx.fillStyle = '#ff6622';
    ctx.fillRect(2, 14, 3, 1);
    ctx.fillRect(8, 14, 3, 1);
    ctx.fillRect(13, 14, 2, 1);
  });

  // 18. icon_attack_speed - 粉色快速连射（三发子弹轨迹）
  generateTexture(scene, 'icon_attack_speed', 16, 16, (ctx) => {
    // Three bullet trails showing rapid fire
    // Bullet 1 (top) - already flying
    ctx.fillStyle = '#ff4488';
    ctx.fillRect(12, 1, 3, 2);
    ctx.fillStyle = '#ff88aa';
    ctx.fillRect(7, 2, 4, 1);
    // Bullet 2 (middle) - just fired
    ctx.fillStyle = '#ff4488';
    ctx.fillRect(9, 6, 3, 2);
    ctx.fillStyle = '#ff88aa';
    ctx.fillRect(4, 7, 4, 1);
    // Bullet 3 (bottom) - emerging from muzzle
    ctx.fillStyle = '#ff4488';
    ctx.fillRect(5, 11, 3, 2);
    // Gun muzzle (gray)
    ctx.fillStyle = '#888899';
    ctx.fillRect(0, 4, 5, 3);
    ctx.fillRect(0, 9, 4, 3);
    // Muzzle flash 1 (orange)
    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(5, 5, 2, 1);
    ctx.fillRect(5, 6, 1, 1);
    // Muzzle flash 2
    ctx.fillStyle = '#ffcc66';
    ctx.fillRect(4, 10, 2, 1);
    ctx.fillRect(4, 11, 1, 1);
    // Speed lines (pink)
    ctx.fillStyle = '#ffaacc';
    ctx.fillRect(6, 1, 4, 1);
    ctx.fillRect(3, 6, 5, 1);
    // Bright bullet tips
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 1, 1, 1);
    ctx.fillRect(11, 6, 1, 1);
    ctx.fillRect(7, 11, 1, 1);
  });

  // 19. icon_lucky_star - 金色五角星
  generateTexture(scene, 'icon_lucky_star', 16, 16, (ctx) => {
    // Five-pointed star (gold)
    ctx.fillStyle = '#ddaa22';
    // Top point
    ctx.fillRect(7, 0, 2, 4);
    ctx.fillRect(6, 1, 4, 2);
    // Upper-right point
    ctx.fillRect(12, 4, 4, 2);
    ctx.fillRect(11, 5, 3, 2);
    // Lower-right point
    ctx.fillRect(10, 10, 3, 2);
    ctx.fillRect(9, 11, 3, 2);
    // Lower-left point
    ctx.fillRect(3, 10, 3, 2);
    ctx.fillRect(4, 11, 3, 2);
    // Upper-left point
    ctx.fillRect(0, 4, 4, 2);
    ctx.fillRect(2, 5, 3, 2);
    // Center fill
    ctx.fillRect(5, 5, 6, 5);
    ctx.fillRect(6, 4, 4, 6);
    ctx.fillRect(4, 6, 8, 4);
    // Star highlight (light gold)
    ctx.fillStyle = '#ffdd66';
    ctx.fillRect(7, 1, 2, 2);
    ctx.fillRect(6, 5, 4, 4);
    // Bright center (pale gold)
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(7, 6, 2, 2);
    // Sparkle (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 1, 1);
    // Twinkle accents (white)
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(6, 0, 1, 1);
    ctx.fillRect(9, 0, 1, 1);
  });

  // 20. icon_shield_orbit - 蓝色盾牌
  generateTexture(scene, 'icon_shield_orbit', 16, 16, (ctx) => {
    // Shield shape (blue)
    ctx.fillStyle = '#2255cc';
    ctx.fillRect(3, 1, 10, 2);
    ctx.fillRect(2, 3, 12, 2);
    ctx.fillRect(1, 5, 14, 4);
    ctx.fillRect(2, 9, 12, 2);
    ctx.fillRect(3, 11, 10, 2);
    ctx.fillRect(4, 13, 8, 1);
    ctx.fillRect(5, 14, 6, 1);
    ctx.fillRect(6, 15, 4, 1);
    // Shield highlight (light blue)
    ctx.fillStyle = '#4488ee';
    ctx.fillRect(4, 1, 8, 2);
    ctx.fillRect(3, 3, 10, 2);
    ctx.fillRect(2, 5, 5, 4);
    // Shield boss/center emblem (bright)
    ctx.fillStyle = '#88bbff';
    ctx.fillRect(5, 5, 6, 4);
    ctx.fillRect(6, 4, 4, 6);
    // Cross emblem (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 5, 2, 5);
    ctx.fillRect(5, 7, 6, 2);
    // Shield border (dark blue)
    ctx.fillStyle = '#1133aa';
    ctx.fillRect(3, 1, 10, 1);
    ctx.fillRect(2, 3, 1, 2);
    ctx.fillRect(13, 3, 1, 2);
    ctx.fillRect(1, 5, 1, 4);
    ctx.fillRect(14, 5, 1, 4);
  });

  // 21. icon_repulse - 紫色扩散波纹
  generateTexture(scene, 'icon_repulse', 16, 16, (ctx) => {
    // Outer wave ring (purple)
    ctx.fillStyle = '#7722aa';
    ctx.fillRect(3, 0, 10, 2);
    ctx.fillRect(1, 2, 2, 2);
    ctx.fillRect(13, 2, 2, 2);
    ctx.fillRect(0, 4, 2, 2);
    ctx.fillRect(14, 4, 2, 2);
    ctx.fillRect(0, 10, 2, 2);
    ctx.fillRect(14, 10, 2, 2);
    ctx.fillRect(1, 12, 2, 2);
    ctx.fillRect(13, 12, 2, 2);
    ctx.fillRect(3, 14, 10, 2);
    // Middle wave ring (lighter purple)
    ctx.fillStyle = '#9944cc';
    ctx.fillRect(5, 3, 6, 2);
    ctx.fillRect(3, 5, 2, 2);
    ctx.fillRect(11, 5, 2, 2);
    ctx.fillRect(3, 9, 2, 2);
    ctx.fillRect(11, 9, 2, 2);
    ctx.fillRect(5, 11, 6, 2);
    // Inner wave ring (bright purple)
    ctx.fillStyle = '#bb66ee';
    ctx.fillRect(6, 6, 4, 4);
    // Center pulse (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
    // Wave direction arrows (outward)
    ctx.fillStyle = '#dd88ff';
    ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(0, 7, 1, 2);
    ctx.fillRect(15, 7, 1, 2);
    ctx.fillRect(7, 15, 2, 1);
  });

  // 22. icon_heal_cloak - 绿色十字
  generateTexture(scene, 'icon_heal_cloak', 16, 16, (ctx) => {
    // Cross shape (green)
    ctx.fillStyle = '#22aa44';
    // Vertical bar
    ctx.fillRect(5, 2, 6, 12);
    // Horizontal bar
    ctx.fillRect(2, 5, 12, 6);
    // Cross highlight (light green)
    ctx.fillStyle = '#44cc66';
    ctx.fillRect(6, 3, 4, 10);
    ctx.fillRect(3, 6, 10, 4);
    // Inner bright (pale green)
    ctx.fillStyle = '#88ee88';
    ctx.fillRect(6, 4, 4, 8);
    ctx.fillRect(4, 6, 8, 4);
    // Center glow (white-green)
    ctx.fillStyle = '#ccffcc';
    ctx.fillRect(7, 6, 2, 4);
    ctx.fillRect(6, 7, 4, 2);
    // Sparkle (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
    // Cloak edge hint (dark green border)
    ctx.fillStyle = '#117733';
    ctx.fillRect(5, 2, 1, 1);
    ctx.fillRect(10, 2, 1, 1);
    ctx.fillRect(5, 13, 1, 1);
    ctx.fillRect(10, 13, 1, 1);
    ctx.fillRect(2, 5, 1, 1);
    ctx.fillRect(13, 5, 1, 1);
    ctx.fillRect(2, 10, 1, 1);
    ctx.fillRect(13, 10, 1, 1);
  });

  // 23. icon_swiftness - 黄色闪电靴
  generateTexture(scene, 'icon_swiftness', 16, 16, (ctx) => {
    // Boot shape (yellow)
    ctx.fillStyle = '#ddaa22';
    // Boot top/leg
    ctx.fillRect(4, 0, 6, 4);
    ctx.fillRect(3, 4, 6, 3);
    // Boot sole
    ctx.fillRect(2, 7, 10, 3);
    // Boot toe (extends right)
    ctx.fillRect(8, 10, 6, 2);
    ctx.fillRect(10, 10, 4, 3);
    // Boot highlight (light yellow)
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(5, 1, 4, 3);
    ctx.fillRect(4, 4, 4, 3);
    ctx.fillRect(3, 7, 8, 2);
    // Lightning bolt on boot (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 2, 2, 1);
    ctx.fillRect(6, 3, 2, 1);
    ctx.fillRect(5, 4, 2, 1);
    ctx.fillRect(6, 5, 2, 1);
    // Speed lines (pale yellow)
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(0, 2, 2, 1);
    ctx.fillRect(0, 5, 2, 1);
    ctx.fillRect(0, 8, 2, 1);
    // Motion trail
    ctx.fillStyle = '#ddbb44';
    ctx.fillRect(12, 11, 2, 1);
    ctx.fillRect(13, 12, 2, 1);
    // Sole dark
    ctx.fillStyle = '#886611';
    ctx.fillRect(2, 9, 10, 1);
    ctx.fillRect(10, 12, 4, 1);
  });

  // 24. icon_armor - 灰色铠甲
  generateTexture(scene, 'icon_armor', 16, 16, (ctx) => {
    // Armor body (gray)
    ctx.fillStyle = '#888899';
    ctx.fillRect(3, 1, 10, 2);
    ctx.fillRect(2, 3, 12, 2);
    ctx.fillRect(1, 5, 14, 6);
    ctx.fillRect(2, 11, 12, 2);
    ctx.fillRect(3, 13, 10, 2);
    // Armor plates (lighter gray)
    ctx.fillStyle = '#aaaabb';
    ctx.fillRect(4, 2, 8, 2);
    ctx.fillRect(3, 4, 10, 2);
    ctx.fillRect(2, 6, 12, 2);
    // Plate division lines (dark gray)
    ctx.fillStyle = '#555566';
    ctx.fillRect(3, 5, 10, 1);
    ctx.fillRect(3, 8, 10, 1);
    ctx.fillRect(3, 11, 10, 1);
    // Center rivet (bright)
    ctx.fillStyle = '#ddddee';
    ctx.fillRect(7, 6, 2, 2);
    // Chest plate highlight
    ctx.fillStyle = '#ccccdd';
    ctx.fillRect(4, 6, 3, 2);
    ctx.fillRect(9, 6, 3, 2);
    // Shoulder guards
    ctx.fillStyle = '#777788';
    ctx.fillRect(0, 3, 2, 3);
    ctx.fillRect(14, 3, 2, 3);
    // Rivets (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, 3, 1, 1);
    ctx.fillRect(11, 3, 1, 1);
    ctx.fillRect(7, 7, 1, 1);
  });

  // 25. icon_ghost_step - 浅蓝幽灵
  generateTexture(scene, 'icon_ghost_step', 16, 16, (ctx) => {
    // Ghost body (pale blue)
    ctx.fillStyle = '#88aadd';
    // Head (rounded top)
    ctx.fillRect(4, 1, 8, 6);
    ctx.fillRect(3, 2, 10, 4);
    ctx.fillRect(2, 4, 12, 3);
    // Body
    ctx.fillRect(2, 7, 12, 5);
    // Wavy bottom
    ctx.fillRect(2, 12, 3, 2);
    ctx.fillRect(6, 12, 4, 2);
    ctx.fillRect(11, 12, 3, 2);
    ctx.fillRect(3, 14, 2, 1);
    ctx.fillRect(7, 14, 2, 1);
    ctx.fillRect(12, 14, 1, 1);
    // Ghost highlight (lighter blue)
    ctx.fillStyle = '#aaccff';
    ctx.fillRect(5, 2, 6, 4);
    ctx.fillRect(3, 5, 10, 4);
    // Eyes (dark)
    ctx.fillStyle = '#223355';
    ctx.fillRect(5, 4, 2, 3);
    ctx.fillRect(9, 4, 2, 3);
    // Eye glow (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 5, 1, 1);
    ctx.fillRect(9, 5, 1, 1);
    // Ghost tail wisps (pale)
    ctx.fillStyle = '#bbddff';
    ctx.fillRect(4, 13, 1, 1);
    ctx.fillRect(8, 13, 1, 1);
    // Transparency effect (dots)
    ctx.fillStyle = '#ccddef';
    ctx.fillRect(6, 9, 1, 1);
    ctx.fillRect(9, 10, 1, 1);
    ctx.fillRect(4, 8, 1, 1);
  });

  // 26. icon_magnet - 红色U形磁铁
  generateTexture(scene, 'icon_magnet', 16, 16, (ctx) => {
    // U-shape magnet (red)
    ctx.fillStyle = '#cc2222';
    // Left arm
    ctx.fillRect(2, 1, 3, 9);
    // Right arm
    ctx.fillRect(11, 1, 3, 9);
    // Bottom curve
    ctx.fillRect(2, 8, 12, 3);
    ctx.fillRect(4, 11, 8, 2);
    ctx.fillRect(5, 13, 6, 1);
    // Left pole (blue tip)
    ctx.fillStyle = '#2244cc';
    ctx.fillRect(2, 1, 3, 3);
    // Right pole (red tip)
    ctx.fillStyle = '#cc2222';
    ctx.fillRect(11, 1, 3, 3);
    // Red pole highlight
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(3, 1, 2, 3);
    // Blue pole highlight
    ctx.fillStyle = '#4466ee';
    ctx.fillRect(11, 1, 2, 3);
    // Pole bright tips
    ctx.fillStyle = '#ff8888';
    ctx.fillRect(3, 1, 1, 2);
    ctx.fillStyle = '#88aaff';
    ctx.fillRect(12, 1, 1, 2);
    // Magnet body highlight
    ctx.fillStyle = '#ee4444';
    ctx.fillRect(3, 4, 2, 5);
    ctx.fillRect(12, 4, 2, 5);
    ctx.fillRect(4, 9, 8, 2);
    // Magnetic field lines (light red)
    ctx.fillStyle = '#ffaaaa';
    ctx.fillRect(6, 2, 1, 1);
    ctx.fillRect(9, 2, 1, 1);
    ctx.fillRect(7, 1, 2, 1);
    // Attraction dots
    ctx.fillStyle = '#ffccaa';
    ctx.fillRect(5, 0, 1, 1);
    ctx.fillRect(10, 0, 1, 1);
  });

  // 27. icon_reflect_mirror - 蓝色镜子
  generateTexture(scene, 'icon_reflect_mirror', 16, 16, (ctx) => {
    // Mirror frame (dark blue)
    ctx.fillStyle = '#1133aa';
    ctx.fillRect(4, 1, 8, 2);
    ctx.fillRect(2, 3, 2, 10);
    ctx.fillRect(12, 3, 2, 10);
    ctx.fillRect(4, 13, 8, 2);
    // Mirror surface (light blue)
    ctx.fillStyle = '#88bbff';
    ctx.fillRect(4, 3, 8, 10);
    // Mirror reflection (white diagonal)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 3, 3, 1);
    ctx.fillRect(5, 4, 2, 1);
    ctx.fillRect(4, 5, 2, 1);
    // Mirror shine (pale blue)
    ctx.fillStyle = '#ccddff';
    ctx.fillRect(5, 3, 6, 2);
    ctx.fillRect(4, 5, 4, 2);
    // Handle (gray)
    ctx.fillStyle = '#667788';
    ctx.fillRect(7, 14, 2, 2);
    // Handle top (dark)
    ctx.fillStyle = '#445566';
    ctx.fillRect(6, 13, 4, 2);
    // Reflection lines (white)
    ctx.fillStyle = '#eeeeff';
    ctx.fillRect(8, 7, 3, 1);
    ctx.fillRect(7, 9, 4, 1);
    // Edge sparkle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 3, 1, 1);
    ctx.fillRect(12, 12, 1, 1);
    // Frame corners
    ctx.fillStyle = '#2255cc';
    ctx.fillRect(3, 1, 2, 2);
    ctx.fillRect(11, 1, 2, 2);
    ctx.fillRect(3, 13, 2, 2);
    ctx.fillRect(11, 13, 2, 2);
  });

  // 28. icon_holy_guard - 金色光环
  generateTexture(scene, 'icon_holy_guard', 16, 16, (ctx) => {
    // Outer halo ring (gold)
    ctx.fillStyle = '#ddaa22';
    ctx.fillRect(3, 1, 10, 2);
    ctx.fillRect(1, 3, 3, 2);
    ctx.fillRect(12, 3, 3, 2);
    ctx.fillRect(0, 5, 2, 2);
    ctx.fillRect(14, 5, 2, 2);
    ctx.fillRect(0, 9, 2, 2);
    ctx.fillRect(14, 9, 2, 2);
    ctx.fillRect(1, 11, 3, 2);
    ctx.fillRect(12, 11, 3, 2);
    ctx.fillRect(3, 13, 10, 2);
    // Halo highlight (light gold)
    ctx.fillStyle = '#ffdd66';
    ctx.fillRect(4, 1, 8, 2);
    ctx.fillRect(1, 4, 2, 2);
    ctx.fillRect(13, 4, 2, 2);
    // Inner halo (bright gold)
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(4, 3, 8, 2);
    ctx.fillRect(2, 5, 12, 2);
    ctx.fillRect(2, 9, 12, 2);
    ctx.fillRect(4, 11, 8, 2);
    // Holy light rays (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 3, 2, 3);
    ctx.fillRect(4, 7, 2, 2);
    ctx.fillRect(10, 7, 2, 2);
    ctx.fillRect(7, 10, 2, 3);
    // Center glow (pale gold)
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(6, 6, 4, 4);
    // Inner sparkle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
    // Outer glow tips (bright)
    ctx.fillStyle = '#ffee44';
    ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(7, 15, 2, 1);
    ctx.fillRect(0, 7, 1, 2);
    ctx.fillRect(15, 7, 1, 2);
  });
}

/** Generate all pixel art textures for the game */
export function generateAllTextures(scene: Phaser.Scene) {
  createPlayerTexture(scene);
  createFloorTexture(scene);
  createWallTexture(scene);
  createSlimeTexture(scene);
  createBatTexture(scene);
  createGoblinTexture(scene);
  createSkeletonTexture(scene);
  createOrcTexture(scene);
  createGhostTexture(scene);
  createDemonTexture(scene);
  createBulletTexture(scene);
  createSkillOrbTexture(scene);
  createFireballOrbTexture(scene);
  createPotionTexture(scene);
  createLightningTexture(scene);
  createSwordSlashTexture(scene);
  createIceWaveTexture(scene);
  createPoisonSnakeTexture(scene);
  createLaserBeamTexture(scene);
  createDeathScytheTexture(scene);
  createFragmentCommonTexture(scene);
  createFragmentUncommonTexture(scene);
  createFragmentRareTexture(scene);
  createFragmentEpicTexture(scene);
  createFragmentLegendaryTexture(scene);
  createFusionFlashTexture(scene);
  createItemIcons(scene);
}
