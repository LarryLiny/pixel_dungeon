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

type PlayerFacing = 'down' | 'down_right' | 'right' | 'up_right' | 'up' | 'up_left' | 'left' | 'down_left';
type PlayerFrame = 'idle' | 'walk1' | 'walk2';

function drawPlayerFrame(ctx: CanvasRenderingContext2D, facing: PlayerFacing, frame: PlayerFrame) {
  const side = facing.includes('right') ? 1 : facing.includes('left') ? -1 : 0;
  const lookingUp = facing.startsWith('up');
  const lookingDown = facing.startsWith('down');
  const step = frame === 'idle' ? 0 : frame === 'walk1' ? -1 : 1;

  // Shadow and boots
  ctx.fillStyle = '#172038';
  ctx.fillRect(4, 14, 8, 1);
  ctx.fillStyle = '#8b6914';
  ctx.fillRect(4 + Math.max(0, step), 13, 3, 3);
  ctx.fillRect(9 + Math.min(0, step), 13, 3, 3);

  // Cape/back marker for upward views
  if (lookingUp) {
    ctx.fillStyle = '#263b7c';
    ctx.fillRect(5, 3, 6, 8);
    ctx.fillStyle = '#d7e8ff';
    ctx.fillRect(5, 2, 2, 1);
  }

  // Armor body
  ctx.fillStyle = '#4a7adb';
  ctx.fillRect(4, 4, 8, 8);
  ctx.fillStyle = '#2f4d9a';
  ctx.fillRect(4, 10, 8, 2);
  ctx.fillStyle = '#86a9ff';
  ctx.fillRect(side >= 0 ? 5 : 9, 4, 2, 6);

  // Shoulders and small side weapon cue
  ctx.fillStyle = '#31518f';
  ctx.fillRect(3, 5, 2, 4);
  ctx.fillRect(11, 5, 2, 4);
  ctx.fillStyle = '#c8ced8';
  ctx.fillRect(side >= 0 ? 12 : 2, 6, 1, 5);
  ctx.fillStyle = '#785124';
  ctx.fillRect(side >= 0 ? 13 : 1, 7, 1, 3);

  // Head and helmet direction
  ctx.fillStyle = lookingUp ? '#3a5a9d' : '#f5c8a8';
  ctx.fillRect(5, 1, 6, 5);
  ctx.fillStyle = '#3a5a9d';
  ctx.fillRect(4, 0, 8, 2);
  ctx.fillRect(4, 2, 1, 3);
  ctx.fillRect(11, 2, 1, 3);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(5, 0, 2, 1);

  if (!lookingUp) {
    ctx.fillStyle = '#222233';
    if (side > 0) {
      ctx.fillRect(8, 3, 2, 2);
      ctx.fillRect(11, 3, 1, 2);
    } else if (side < 0) {
      ctx.fillRect(4, 3, 1, 2);
      ctx.fillRect(6, 3, 2, 2);
    } else if (lookingDown) {
      ctx.fillRect(6, 3, 2, 2);
      ctx.fillRect(10, 3, 2, 2);
    } else {
      ctx.fillRect(6, 2, 1, 1);
      ctx.fillRect(10, 2, 1, 1);
    }
  }

  // Readability outline accents
  ctx.fillStyle = '#111827';
  ctx.fillRect(3, 9, 1, 3);
  ctx.fillRect(12, 9, 1, 3);
}

// --- Player ---
export function createPlayerTexture(scene: Phaser.Scene) {
  const facings: PlayerFacing[] = ['down', 'down_right', 'right', 'up_right', 'up', 'up_left', 'left', 'down_left'];
  const frames: PlayerFrame[] = ['idle', 'walk1', 'walk2'];
  for (const facing of facings) {
    for (const frame of frames) {
      generateTexture(scene, `player_${facing}_${frame}`, 16, 16, (ctx) => {
        drawPlayerFrame(ctx, facing, frame);
      });
    }
  }
  generateTexture(scene, 'player', 16, 16, (ctx) => {
    drawPlayerFrame(ctx, 'down', 'idle');
  });
}

// --- Dungeon floor tile ---
export function createFloorTexture(scene: Phaser.Scene) {
  const drawBaseFloor = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#2d2d44';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#33334d';
    ctx.fillRect(0, 0, 15, 15);
    ctx.fillRect(17, 0, 15, 15);
    ctx.fillRect(0, 17, 15, 15);
    ctx.fillRect(17, 17, 15, 15);
    ctx.fillStyle = '#252540';
    ctx.fillRect(15, 0, 2, 32);
    ctx.fillRect(0, 15, 32, 2);
  };

  generateTexture(scene, 'floor_base', 32, 32, (ctx) => {
    drawBaseFloor(ctx);
    ctx.fillStyle = '#39405d';
    ctx.fillRect(3, 3, 4, 1);
    ctx.fillRect(21, 20, 5, 1);
  });
  generateTexture(scene, 'floor_cracked', 32, 32, (ctx) => {
    drawBaseFloor(ctx);
    ctx.fillStyle = '#252540';
    ctx.fillRect(7, 15, 1, 2);
    ctx.fillRect(15, 7, 2, 1);
    ctx.fillRect(24, 23, 1, 1);
    ctx.fillRect(8, 17, 7, 1);
    ctx.fillRect(14, 18, 1, 5);
    ctx.fillRect(20, 8, 1, 7);
  });
  generateTexture(scene, 'floor_dark', 32, 32, (ctx) => {
    drawBaseFloor(ctx);
    ctx.fillStyle = '#22263a';
    ctx.fillRect(0, 0, 15, 15);
    ctx.fillRect(17, 17, 15, 15);
    ctx.fillStyle = '#1b2033';
    ctx.fillRect(2, 2, 8, 2);
    ctx.fillRect(20, 25, 8, 2);
  });
  generateTexture(scene, 'floor_chipped', 32, 32, (ctx) => {
    drawBaseFloor(ctx);
    ctx.fillStyle = '#1f2436';
    ctx.fillRect(0, 0, 5, 3);
    ctx.fillRect(28, 13, 4, 4);
    ctx.fillRect(13, 28, 7, 4);
    ctx.fillStyle = '#414968';
    ctx.fillRect(4, 2, 2, 1);
    ctx.fillRect(23, 27, 3, 1);
  });
  generateTexture(scene, 'floor_moss', 32, 32, (ctx) => {
    drawBaseFloor(ctx);
    ctx.fillStyle = '#274234';
    ctx.fillRect(0, 26, 11, 4);
    ctx.fillRect(22, 2, 7, 3);
    ctx.fillStyle = '#3d6a44';
    ctx.fillRect(2, 25, 3, 1);
    ctx.fillRect(24, 5, 4, 1);
  });
  generateTexture(scene, 'floor_rubble', 32, 32, (ctx) => {
    drawBaseFloor(ctx);
    ctx.fillStyle = '#55506a';
    ctx.fillRect(5, 22, 4, 3);
    ctx.fillRect(22, 6, 3, 3);
    ctx.fillRect(25, 10, 5, 2);
    ctx.fillStyle = '#1d2233';
    ctx.fillRect(9, 25, 2, 1);
    ctx.fillRect(20, 9, 1, 2);
  });
  generateTexture(scene, 'floor', 32, 32, (ctx) => {
    drawBaseFloor(ctx);
  });
}

// --- Wall tile ---
export function createWallTexture(scene: Phaser.Scene) {
  const drawBaseWall = (ctx: CanvasRenderingContext2D, base = '#4a3a2a') => {
    ctx.fillStyle = '#4a3a2a';
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 32, 32);
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
  };

  generateTexture(scene, 'wall_base', 32, 32, (ctx) => {
    drawBaseWall(ctx);
    ctx.fillStyle = '#6a5848';
    ctx.fillRect(2, 1, 7, 1);
    ctx.fillRect(18, 17, 6, 1);
  });
  generateTexture(scene, 'wall_cracked', 32, 32, (ctx) => {
    drawBaseWall(ctx);
    ctx.fillStyle = '#2c2118';
    ctx.fillRect(8, 4, 1, 8);
    ctx.fillRect(9, 11, 5, 1);
    ctx.fillRect(21, 18, 1, 7);
    ctx.fillRect(17, 21, 4, 1);
  });
  generateTexture(scene, 'wall_dark', 32, 32, (ctx) => {
    drawBaseWall(ctx, '#3e3228');
    ctx.fillStyle = '#2a2119';
    ctx.fillRect(0, 24, 32, 8);
    ctx.fillRect(0, 0, 3, 32);
  });
  generateTexture(scene, 'wall_chipped', 32, 32, (ctx) => {
    drawBaseWall(ctx);
    ctx.fillStyle = '#2c2118';
    ctx.fillRect(1, 1, 5, 4);
    ctx.fillRect(27, 18, 4, 5);
    ctx.fillStyle = '#6a5848';
    ctx.fillRect(6, 2, 3, 1);
    ctx.fillRect(24, 19, 3, 1);
  });
  generateTexture(scene, 'wall_border', 32, 32, (ctx) => {
    drawBaseWall(ctx, '#3a2f28');
    ctx.fillStyle = '#211a16';
    ctx.fillRect(0, 0, 32, 4);
    ctx.fillRect(0, 28, 32, 4);
    ctx.fillRect(0, 0, 4, 32);
    ctx.fillRect(28, 0, 4, 32);
  });
  generateTexture(scene, 'wall', 32, 32, (ctx) => {
    drawBaseWall(ctx);
  });
}

// --- Enemies ---
type EnemyKey = 'slime' | 'bat' | 'goblin' | 'skeleton' | 'orc' | 'ghost' | 'demon';

function drawEyes(ctx: CanvasRenderingContext2D, facing: PlayerFacing, color: string, y: number) {
  const side = facing.includes('right') ? 1 : facing.includes('left') ? -1 : 0;
  if (facing.startsWith('up')) return;
  ctx.fillStyle = color;
  if (side > 0) {
    ctx.fillRect(8, y, 2, 2);
    ctx.fillRect(11, y, 1, 2);
  } else if (side < 0) {
    ctx.fillRect(4, y, 1, 2);
    ctx.fillRect(6, y, 2, 2);
  } else {
    ctx.fillRect(5, y, 2, 2);
    ctx.fillRect(9, y, 2, 2);
  }
}

function drawEnemyFrame(ctx: CanvasRenderingContext2D, enemy: EnemyKey, facing: PlayerFacing, frame: PlayerFrame) {
  const side = facing.includes('right') ? 1 : facing.includes('left') ? -1 : 0;
  const lookingUp = facing.startsWith('up');
  const bob = frame === 'walk1' ? -1 : frame === 'walk2' ? 1 : 0;

  switch (enemy) {
    case 'slime': {
      ctx.fillStyle = '#235b2d';
      ctx.fillRect(4, 13, 9, 2);
      ctx.fillStyle = '#44cc44';
      ctx.fillRect(3 + (side > 0 ? 1 : 0), 6 + bob, 10, 8);
      ctx.fillRect(2 + (side < 0 ? -1 : 0), 8 + bob, 12, 4);
      ctx.fillStyle = '#79ee75';
      ctx.fillRect(5 + side, 6 + bob, 3, 1);
      drawEyes(ctx, facing, '#ffffff', 8 + bob);
      ctx.fillStyle = '#111';
      if (!lookingUp) {
        ctx.fillRect(6 + side, 9 + bob, 1, 1);
        ctx.fillRect(10 + side, 9 + bob, 1, 1);
      }
      break;
    }
    case 'bat': {
      const wingY = 4 + (frame === 'walk1' ? -1 : frame === 'walk2' ? 1 : 0);
      ctx.fillStyle = '#5e2f78';
      ctx.fillRect(0, wingY, 5, 4);
      ctx.fillRect(11, wingY, 5, 4);
      ctx.fillRect(2, wingY + 4, 3, 3);
      ctx.fillRect(11, wingY + 4, 3, 3);
      ctx.fillStyle = '#8844aa';
      ctx.fillRect(4 + side, 3, 8, 8);
      ctx.fillStyle = '#aa66cc';
      ctx.fillRect(6 + side, 2, 4, 2);
      drawEyes(ctx, facing, '#ff4444', lookingUp ? 3 : 5);
      ctx.fillStyle = '#fff';
      if (!lookingUp) {
        ctx.fillRect(6 + side, 9, 1, 2);
        ctx.fillRect(9 + side, 9, 1, 2);
      }
      break;
    }
    case 'goblin': {
      ctx.fillStyle = '#35591d';
      ctx.fillRect(4, 13, 8, 2);
      ctx.fillStyle = '#66aa33';
      ctx.fillRect(4, 5 + bob, 8, 7);
      ctx.fillRect(5 + side, 1 + bob, 6, 5);
      ctx.fillRect(side >= 0 ? 11 : 3, 2 + bob, 2, 2);
      ctx.fillRect(side >= 0 ? 3 : 11, 3 + bob, 2, 2);
      drawEyes(ctx, facing, '#ffff33', 3 + bob);
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(side >= 0 ? 12 : 2, 7 + bob, 2, 5);
      ctx.fillStyle = '#558822';
      ctx.fillRect(4, 12, 3, 4);
      ctx.fillRect(9, 12, 3, 4);
      break;
    }
    case 'skeleton': {
      ctx.fillStyle = '#696554';
      ctx.fillRect(5, 14, 6, 1);
      ctx.fillStyle = '#ddd8c8';
      ctx.fillRect(4 + side, 1 + bob, 8, 6);
      ctx.fillStyle = '#ccc7b7';
      ctx.fillRect(5, 7 + bob, 6, 5);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(6, 8 + bob, 1, 4);
      ctx.fillRect(9, 8 + bob, 1, 4);
      drawEyes(ctx, facing, '#222222', 3 + bob);
      ctx.fillStyle = '#b8b09c';
      ctx.fillRect(4, 12, 2, 4);
      ctx.fillRect(10, 12, 2, 4);
      ctx.fillStyle = '#ddd8c8';
      ctx.fillRect(side >= 0 ? 11 : 3, 8 + bob, 2, 1);
      ctx.fillRect(side >= 0 ? 12 : 2, 9 + bob, 1, 3);
      break;
    }
    case 'orc': {
      ctx.fillStyle = '#243616';
      ctx.fillRect(3, 14, 10, 2);
      ctx.fillStyle = '#557733';
      ctx.fillRect(2, 5 + bob, 12, 8);
      ctx.fillRect(4 + side, 1 + bob, 8, 6);
      ctx.fillStyle = '#6c8f42';
      ctx.fillRect(3, 5 + bob, 4, 2);
      drawEyes(ctx, facing, '#ff3333', 3 + bob);
      ctx.fillStyle = '#ffffff';
      if (!lookingUp) {
        ctx.fillRect(5 + side, 6 + bob, 1, 2);
        ctx.fillRect(10 + side, 6 + bob, 1, 2);
      }
      ctx.fillStyle = '#446622';
      ctx.fillRect(3, 12, 4, 4);
      ctx.fillRect(9, 12, 4, 4);
      break;
    }
    case 'ghost': {
      ctx.fillStyle = '#5a6688';
      ctx.fillRect(4, 14, 8, 1);
      ctx.fillStyle = lookingUp ? '#8ca0c8' : '#aab8dd';
      ctx.fillRect(3 + side, 1 + bob, 10, 8);
      ctx.fillRect(2, 8 + bob, 12, 6);
      ctx.fillRect(3, 14 + Math.max(0, bob), 2, 2);
      ctx.fillRect(7 + side, 14, 2, 2);
      ctx.fillRect(11, 14 + Math.max(0, -bob), 2, 2);
      drawEyes(ctx, facing, '#334455', 4 + bob);
      ctx.fillStyle = '#d6e2ff';
      ctx.fillRect(5 + side, 3 + bob, 1, 1);
      break;
    }
    case 'demon': {
      ctx.fillStyle = '#4f0714';
      ctx.fillRect(3, 14, 10, 2);
      ctx.fillStyle = '#cc2233';
      ctx.fillRect(2, 5 + bob, 12, 8);
      ctx.fillRect(4 + side, 2 + bob, 8, 5);
      ctx.fillStyle = '#991122';
      ctx.fillRect(3 + side, 0 + bob, 2, 3);
      ctx.fillRect(11 + side, 0 + bob, 2, 3);
      drawEyes(ctx, facing, '#ffff33', 4 + bob);
      ctx.fillStyle = '#aa1133';
      ctx.fillRect(3, 12, 4, 4);
      ctx.fillRect(9, 12, 4, 4);
      ctx.fillStyle = '#ddaa33';
      ctx.fillRect(side >= 0 ? 13 : 1, 8 + bob, 2, 2);
      ctx.fillRect(side >= 0 ? 1 : 13, 9 + bob, 2, 2);
      break;
    }
  }
}

function createDirectionalEnemyTextures(scene: Phaser.Scene, enemy: EnemyKey) {
  const facings: PlayerFacing[] = ['down', 'down_right', 'right', 'up_right', 'up', 'up_left', 'left', 'down_left'];
  const frames: PlayerFrame[] = ['idle', 'walk1', 'walk2'];
  for (const facing of facings) {
    for (const frame of frames) {
      generateTexture(scene, `${enemy}_${facing}_${frame}`, 16, 16, (ctx) => {
        drawEnemyFrame(ctx, enemy, facing, frame);
      });
    }
  }
  generateTexture(scene, enemy, 16, 16, (ctx) => {
    drawEnemyFrame(ctx, enemy, 'down', 'idle');
  });
}

export function createSlimeTexture(scene: Phaser.Scene) {
  createDirectionalEnemyTextures(scene, 'slime');
}

export function createBatTexture(scene: Phaser.Scene) {
  createDirectionalEnemyTextures(scene, 'bat');
}

export function createGoblinTexture(scene: Phaser.Scene) {
  createDirectionalEnemyTextures(scene, 'goblin');
}

export function createSkeletonTexture(scene: Phaser.Scene) {
  createDirectionalEnemyTextures(scene, 'skeleton');
}

export function createOrcTexture(scene: Phaser.Scene) {
  createDirectionalEnemyTextures(scene, 'orc');
}

export function createGhostTexture(scene: Phaser.Scene) {
  createDirectionalEnemyTextures(scene, 'ghost');
}

export function createDemonTexture(scene: Phaser.Scene) {
  createDirectionalEnemyTextures(scene, 'demon');
}

// --- Bullet ---
export function createBulletTexture(scene: Phaser.Scene) {
  generateTexture(scene, 'bullet_basic', 14, 14, (ctx) => {
    ctx.fillStyle = '#3b2b0b';
    ctx.fillRect(5, 0, 4, 2);
    ctx.fillRect(3, 2, 8, 2);
    ctx.fillRect(1, 4, 12, 6);
    ctx.fillRect(3, 10, 8, 2);
    ctx.fillRect(5, 12, 4, 2);
    ctx.fillStyle = '#c9951d';
    ctx.fillRect(5, 1, 4, 2);
    ctx.fillRect(3, 3, 8, 2);
    ctx.fillRect(2, 5, 10, 4);
    ctx.fillRect(4, 9, 6, 2);
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(5, 3, 4, 6);
    ctx.fillRect(4, 5, 6, 2);
    ctx.fillStyle = '#fff8c8';
    ctx.fillRect(6, 4, 2, 3);
    ctx.fillRect(8, 5, 1, 1);
  });

  generateTexture(scene, 'bullet_shotgun_pellet', 12, 12, (ctx) => {
    ctx.fillStyle = '#4a1c09';
    ctx.fillRect(4, 0, 4, 2);
    ctx.fillRect(2, 2, 8, 2);
    ctx.fillRect(1, 4, 10, 5);
    ctx.fillRect(3, 9, 6, 2);
    ctx.fillStyle = '#a64714';
    ctx.fillRect(4, 1, 4, 2);
    ctx.fillRect(3, 3, 6, 5);
    ctx.fillRect(4, 8, 4, 2);
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(5, 3, 3, 4);
    ctx.fillStyle = '#ffd7a0';
    ctx.fillRect(6, 3, 2, 1);
  });

  generateTexture(scene, 'bullet_frost_shard', 14, 14, (ctx) => {
    ctx.fillStyle = '#174b76';
    ctx.fillRect(6, 0, 2, 14);
    ctx.fillRect(4, 2, 6, 10);
    ctx.fillRect(2, 5, 10, 4);
    ctx.fillStyle = '#4daee8';
    ctx.fillRect(6, 1, 2, 12);
    ctx.fillRect(4, 4, 6, 6);
    ctx.fillRect(3, 6, 8, 2);
    ctx.fillStyle = '#bfefff';
    ctx.fillRect(6, 2, 2, 8);
    ctx.fillRect(5, 5, 4, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 3, 1, 4);
    ctx.fillRect(9, 6, 1, 1);
  });

  generateTexture(scene, 'bullet_fragment_shell', 14, 14, (ctx) => {
    ctx.fillStyle = '#321006';
    ctx.fillRect(4, 0, 6, 2);
    ctx.fillRect(2, 2, 10, 2);
    ctx.fillRect(1, 4, 12, 6);
    ctx.fillRect(3, 10, 8, 3);
    ctx.fillStyle = '#8c2d0e';
    ctx.fillRect(4, 1, 6, 2);
    ctx.fillRect(3, 3, 8, 6);
    ctx.fillRect(4, 9, 6, 2);
    ctx.fillStyle = '#ff5522';
    ctx.fillRect(5, 3, 4, 6);
    ctx.fillRect(3, 5, 8, 2);
    ctx.fillStyle = '#ffcc55';
    ctx.fillRect(6, 5, 2, 2);
    ctx.fillStyle = '#24120a';
    ctx.fillRect(3, 3, 2, 1);
    ctx.fillRect(9, 9, 2, 1);
    ctx.fillRect(5, 11, 4, 1);
  });

  generateTexture(scene, 'bullet_boomerang_blade', 14, 14, (ctx) => {
    ctx.fillStyle = '#073b2d';
    ctx.fillRect(0, 1, 4, 7);
    ctx.fillRect(10, 1, 4, 7);
    ctx.fillRect(2, 8, 10, 4);
    ctx.fillRect(5, 11, 4, 2);
    ctx.fillStyle = '#20996f';
    ctx.fillRect(1, 2, 3, 6);
    ctx.fillRect(10, 2, 3, 6);
    ctx.fillRect(3, 8, 8, 3);
    ctx.fillStyle = '#55e6a8';
    ctx.fillRect(2, 2, 2, 5);
    ctx.fillRect(10, 2, 2, 5);
    ctx.fillRect(4, 8, 6, 2);
    ctx.fillStyle = '#ddfff0';
    ctx.fillRect(3, 2, 1, 2);
    ctx.fillRect(10, 2, 1, 2);
  });

  generateTexture(scene, 'bullet_death_wheel', 16, 16, (ctx) => {
    ctx.fillStyle = '#031f1c';
    ctx.fillRect(4, 0, 8, 2);
    ctx.fillRect(2, 2, 12, 2);
    ctx.fillRect(0, 4, 16, 8);
    ctx.fillRect(2, 12, 12, 2);
    ctx.fillRect(4, 14, 8, 2);
    ctx.fillStyle = '#0f6b58';
    ctx.fillRect(5, 1, 6, 2);
    ctx.fillRect(2, 5, 12, 6);
    ctx.fillRect(5, 13, 6, 2);
    ctx.fillStyle = '#22ddaa';
    ctx.fillRect(6, 2, 4, 2);
    ctx.fillRect(3, 6, 10, 4);
    ctx.fillRect(6, 12, 4, 2);
    ctx.fillStyle = '#bbfff0';
    ctx.fillRect(7, 7, 2, 2);
    ctx.fillStyle = '#031f1c';
    ctx.fillRect(0, 7, 3, 2);
    ctx.fillRect(13, 7, 3, 2);
  });

  generateTexture(scene, 'bullet_venom_fang', 14, 14, (ctx) => {
    ctx.fillStyle = '#0c2d10';
    ctx.fillRect(6, 0, 3, 14);
    ctx.fillRect(3, 2, 7, 9);
    ctx.fillRect(1, 5, 11, 4);
    ctx.fillStyle = '#2f8c2b';
    ctx.fillRect(6, 1, 2, 11);
    ctx.fillRect(4, 4, 5, 5);
    ctx.fillRect(3, 6, 7, 2);
    ctx.fillStyle = '#89d441';
    ctx.fillRect(7, 2, 1, 7);
    ctx.fillRect(5, 5, 3, 2);
    ctx.fillStyle = '#d8ff76';
    ctx.fillRect(7, 2, 1, 2);
    ctx.fillRect(9, 6, 1, 1);
    ctx.fillStyle = '#0c2d10';
    ctx.fillRect(6, 11, 2, 1);
  });

  generateTexture(scene, 'bullet_plague_pod', 14, 14, (ctx) => {
    ctx.fillStyle = '#172407';
    ctx.fillRect(4, 1, 6, 2);
    ctx.fillRect(2, 3, 10, 8);
    ctx.fillRect(4, 11, 6, 2);
    ctx.fillStyle = '#496f16';
    ctx.fillRect(4, 2, 6, 2);
    ctx.fillRect(3, 4, 8, 6);
    ctx.fillRect(5, 10, 4, 2);
    ctx.fillStyle = '#91b82a';
    ctx.fillRect(5, 4, 4, 4);
    ctx.fillStyle = '#d6ff55';
    ctx.fillRect(6, 5, 2, 2);
    ctx.fillStyle = '#2c4a0e';
    ctx.fillRect(2, 9, 3, 1);
    ctx.fillRect(10, 3, 1, 3);
    ctx.fillStyle = '#b7e949';
    ctx.fillRect(3, 2, 1, 1);
    ctx.fillRect(11, 10, 1, 1);
  });

  generateTexture(scene, 'bullet_death_scythe', 16, 16, (ctx) => {
    ctx.fillStyle = '#09000f';
    ctx.fillRect(2, 1, 9, 2);
    ctx.fillRect(1, 2, 4, 8);
    ctx.fillRect(4, 7, 9, 3);
    ctx.fillRect(11, 9, 3, 6);
    ctx.fillStyle = '#4f1570';
    ctx.fillRect(3, 2, 8, 1);
    ctx.fillRect(2, 3, 3, 6);
    ctx.fillRect(5, 7, 7, 2);
    ctx.fillRect(12, 10, 1, 4);
    ctx.fillStyle = '#a94fe0';
    ctx.fillRect(3, 3, 5, 1);
    ctx.fillRect(3, 4, 1, 4);
    ctx.fillRect(6, 8, 5, 1);
    ctx.fillStyle = '#e8a8ff';
    ctx.fillRect(2, 2, 2, 1);
    ctx.fillRect(8, 8, 2, 1);
  });

  generateTexture(scene, 'bullet_soul_reaper', 16, 16, (ctx) => {
    ctx.fillStyle = '#080011';
    ctx.fillRect(2, 1, 9, 2);
    ctx.fillRect(1, 2, 4, 8);
    ctx.fillRect(4, 7, 9, 3);
    ctx.fillRect(11, 9, 3, 6);
    ctx.fillStyle = '#5f1d91';
    ctx.fillRect(3, 2, 8, 1);
    ctx.fillRect(2, 3, 3, 6);
    ctx.fillRect(5, 7, 7, 2);
    ctx.fillRect(12, 10, 1, 4);
    ctx.fillStyle = '#bb77ff';
    ctx.fillRect(6, 8, 4, 2);
    ctx.fillRect(3, 3, 4, 1);
    ctx.fillStyle = '#f2d8ff';
    ctx.fillRect(7, 8, 2, 1);
    ctx.fillStyle = '#54266f';
    ctx.fillRect(12, 4, 2, 2);
    ctx.fillRect(10, 12, 2, 2);
  });

  generateTexture(scene, 'bullet_mega_blaster', 16, 16, (ctx) => {
    ctx.fillStyle = '#3f2800';
    ctx.fillRect(5, 0, 6, 2);
    ctx.fillRect(3, 2, 10, 2);
    ctx.fillRect(1, 4, 14, 8);
    ctx.fillRect(3, 12, 10, 2);
    ctx.fillRect(5, 14, 6, 2);
    ctx.fillStyle = '#a46b05';
    ctx.fillRect(5, 1, 6, 2);
    ctx.fillRect(3, 4, 10, 7);
    ctx.fillRect(5, 12, 6, 2);
    ctx.fillStyle = '#ffbb22';
    ctx.fillRect(6, 3, 4, 10);
    ctx.fillRect(2, 6, 12, 4);
    ctx.fillStyle = '#fff1aa';
    ctx.fillRect(7, 6, 2, 3);
    ctx.fillRect(10, 7, 1, 1);
  });

  generateTexture(scene, 'bullet', 14, 14, (ctx) => {
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(3, 4, 8, 6);
    ctx.fillRect(5, 2, 4, 10);
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
  generateTexture(scene, 'orb_fireball', 20, 20, (ctx) => {
    ctx.fillStyle = '#5c1408';
    ctx.fillRect(6, 0, 8, 2);
    ctx.fillRect(3, 2, 14, 4);
    ctx.fillRect(1, 6, 18, 8);
    ctx.fillRect(3, 14, 14, 4);
    ctx.fillRect(6, 18, 8, 2);
    ctx.fillStyle = '#ff4422';
    ctx.fillRect(5, 2, 10, 3);
    ctx.fillRect(3, 5, 14, 10);
    ctx.fillRect(5, 15, 10, 3);
    ctx.fillStyle = '#ff8a33';
    ctx.fillRect(6, 5, 8, 8);
    ctx.fillRect(4, 8, 12, 4);
    ctx.fillStyle = '#ffdd55';
    ctx.fillRect(7, 7, 6, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 8, 3, 3);
    ctx.fillStyle = '#ff6622';
    ctx.fillRect(4, 0, 2, 4);
    ctx.fillRect(14, 0, 2, 4);
    ctx.fillRect(2, 14, 3, 2);
    ctx.fillRect(15, 14, 3, 2);
  });

  generateTexture(scene, 'orb_hellfire', 22, 22, (ctx) => {
    ctx.fillStyle = '#2b0302';
    ctx.fillRect(6, 0, 10, 2);
    ctx.fillRect(3, 2, 16, 5);
    ctx.fillRect(0, 7, 22, 8);
    ctx.fillRect(3, 15, 16, 5);
    ctx.fillRect(6, 20, 10, 2);
    ctx.fillStyle = '#8f1608';
    ctx.fillRect(5, 2, 12, 3);
    ctx.fillRect(2, 5, 18, 12);
    ctx.fillRect(5, 17, 12, 3);
    ctx.fillStyle = '#ff3300';
    ctx.fillRect(6, 4, 10, 14);
    ctx.fillRect(4, 7, 14, 8);
    ctx.fillStyle = '#ff9500';
    ctx.fillRect(8, 7, 7, 8);
    ctx.fillStyle = '#fff2aa';
    ctx.fillRect(9, 9, 4, 4);
    ctx.fillStyle = '#4a0803';
    ctx.fillRect(2, 10, 3, 2);
    ctx.fillRect(17, 10, 3, 2);
    ctx.fillRect(10, 1, 2, 3);
  });

  generateTexture(scene, 'orb_tracking_fire', 20, 20, (ctx) => {
    ctx.fillStyle = '#3a0503';
    ctx.fillRect(5, 1, 11, 3);
    ctx.fillRect(2, 4, 15, 10);
    ctx.fillRect(5, 14, 11, 4);
    ctx.fillRect(11, 17, 5, 2);
    ctx.fillStyle = '#b51b0d';
    ctx.fillRect(5, 3, 10, 3);
    ctx.fillRect(4, 6, 12, 9);
    ctx.fillRect(7, 15, 9, 2);
    ctx.fillStyle = '#ff5533';
    ctx.fillRect(6, 5, 8, 8);
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(8, 7, 5, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 8, 2, 2);
    ctx.fillStyle = '#ff3300';
    ctx.fillRect(15, 4, 4, 2);
    ctx.fillRect(16, 6, 3, 4);
    ctx.fillRect(13, 13, 3, 3);
  });

  generateTexture(scene, 'orb_sun_storm', 24, 24, (ctx) => {
    ctx.fillStyle = '#5a1600';
    ctx.fillRect(10, 0, 4, 24);
    ctx.fillRect(0, 10, 24, 4);
    ctx.fillRect(6, 2, 12, 3);
    ctx.fillRect(2, 6, 20, 12);
    ctx.fillRect(6, 19, 12, 3);
    ctx.fillStyle = '#d95a00';
    ctx.fillRect(8, 2, 8, 20);
    ctx.fillRect(2, 8, 20, 8);
    ctx.fillRect(5, 5, 14, 14);
    ctx.fillStyle = '#ff9d22';
    ctx.fillRect(7, 7, 10, 10);
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(9, 9, 6, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 10, 3, 3);
    ctx.fillStyle = '#fff4aa';
    ctx.fillRect(11, 1, 2, 22);
    ctx.fillRect(1, 11, 22, 2);
  });

  generateTexture(scene, 'orb_guardian_shield', 22, 22, (ctx) => {
    ctx.fillStyle = '#07152e';
    ctx.fillRect(7, 1, 8, 2);
    ctx.fillRect(4, 3, 14, 3);
    ctx.fillRect(2, 6, 18, 8);
    ctx.fillRect(4, 14, 14, 4);
    ctx.fillRect(8, 18, 6, 3);
    ctx.fillStyle = '#1b3f7a';
    ctx.fillRect(7, 2, 8, 2);
    ctx.fillRect(5, 5, 12, 3);
    ctx.fillRect(4, 8, 14, 6);
    ctx.fillRect(6, 14, 10, 3);
    ctx.fillRect(9, 17, 4, 2);
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(8, 4, 6, 2);
    ctx.fillRect(6, 8, 10, 4);
    ctx.fillRect(8, 12, 6, 4);
    ctx.fillStyle = '#b8d8ff';
    ctx.fillRect(9, 7, 4, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 8, 2, 2);
    ctx.fillStyle = '#88bbff';
    ctx.fillRect(4, 4, 2, 2);
    ctx.fillRect(16, 4, 2, 2);
    ctx.fillRect(10, 18, 2, 1);
  });

  generateTexture(scene, 'poison_cloud', 40, 40, (ctx) => {
    ctx.fillStyle = '#102408';
    ctx.fillRect(12, 5, 16, 5);
    ctx.fillRect(7, 10, 26, 7);
    ctx.fillRect(4, 17, 32, 9);
    ctx.fillRect(8, 26, 26, 6);
    ctx.fillRect(13, 32, 16, 3);
    ctx.fillStyle = '#25440f';
    ctx.fillRect(13, 7, 14, 5);
    ctx.fillRect(8, 13, 24, 6);
    ctx.fillRect(6, 19, 30, 6);
    ctx.fillRect(10, 25, 22, 6);
    ctx.fillStyle = '#5b8f22';
    ctx.fillRect(14, 10, 12, 4);
    ctx.fillRect(10, 17, 22, 4);
    ctx.fillRect(13, 23, 18, 4);
    ctx.fillStyle = '#9fd63a';
    ctx.fillRect(15, 14, 4, 2);
    ctx.fillRect(24, 18, 3, 2);
    ctx.fillRect(11, 23, 2, 2);
    ctx.fillStyle = '#d7ff67';
    ctx.fillRect(18, 15, 2, 1);
    ctx.fillRect(28, 21, 1, 1);
    ctx.fillRect(8, 20, 1, 1);
    ctx.fillStyle = '#162a0a';
    ctx.fillRect(5, 14, 3, 2);
    ctx.fillRect(32, 24, 3, 2);
    ctx.fillRect(20, 31, 4, 1);
  });

  generateTexture(scene, 'fireball_orb', 20, 20, (ctx) => {
    ctx.drawImage(scene.textures.get('orb_fireball').getSourceImage() as HTMLCanvasElement, 0, 0);
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

  // ===================================================================
  // FUSION WEAPON ICONS (upgraded combos of two parent items)
  // ===================================================================

  // 11. icon_freeze_shotgun = shotgun + ice
  // Shotgun pellet spread with ICE SHARD pellets + frost crystals
  generateTexture(scene, 'icon_freeze_shotgun', 16, 16, (ctx) => {
    // Frost aura background (dark cyan outline)
    ctx.fillStyle = '#1a5566';
    ctx.fillRect(2, 2, 12, 12);
    // Ice shard pellets - spread pattern (cyan-blue base)
    // Left shard
    ctx.fillStyle = '#44aadd';
    ctx.fillRect(1, 1, 3, 2);
    ctx.fillRect(2, 3, 2, 2);
    // Center shard
    ctx.fillStyle = '#55ccee';
    ctx.fillRect(7, 0, 2, 2);
    ctx.fillRect(6, 2, 4, 2);
    // Right shard
    ctx.fillStyle = '#44aadd';
    ctx.fillRect(12, 1, 3, 2);
    ctx.fillRect(12, 3, 2, 2);
    // Shard bright highlights (white)
    ctx.fillStyle = '#ccf0ff';
    ctx.fillRect(1, 1, 2, 1);
    ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(13, 1, 2, 1);
    // Barrel base (steel blue)
    ctx.fillStyle = '#336688';
    ctx.fillRect(6, 9, 4, 5);
    ctx.fillRect(5, 10, 6, 3);
    // Barrel highlight
    ctx.fillStyle = '#5599bb';
    ctx.fillRect(7, 10, 2, 3);
    // Muzzle frost spray (pale cyan)
    ctx.fillStyle = '#88ddff';
    ctx.fillRect(5, 7, 6, 2);
    ctx.fillRect(4, 8, 8, 1);
    // Frost crystals around spread (white-blue)
    ctx.fillStyle = '#aaeeff';
    ctx.fillRect(0, 5, 2, 1);
    ctx.fillRect(14, 5, 2, 1);
    ctx.fillRect(3, 6, 1, 2);
    ctx.fillRect(12, 6, 1, 2);
    // Crystal sparkle tips (bright white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 1, 1, 1);
    ctx.fillRect(14, 1, 1, 1);
    ctx.fillRect(7, 7, 2, 1);
  });

  // 12. icon_hellfire = fireball_orbit + power
  // SINGLE large fireball with intense red core, dark red glow, flame wisps
  generateTexture(scene, 'icon_hellfire', 16, 16, (ctx) => {
    // Outer dark red glow
    ctx.fillStyle = '#881111';
    ctx.fillRect(2, 2, 12, 12);
    ctx.fillRect(1, 4, 14, 8);
    ctx.fillRect(4, 1, 8, 14);
    // Main fireball body (deep red)
    ctx.fillStyle = '#cc2211';
    ctx.fillRect(3, 3, 10, 10);
    ctx.fillRect(2, 5, 12, 6);
    ctx.fillRect(5, 2, 6, 12);
    // Inner fireball (red-orange)
    ctx.fillStyle = '#ee4422';
    ctx.fillRect(4, 4, 8, 8);
    ctx.fillRect(3, 6, 10, 4);
    // Intense core (orange)
    ctx.fillStyle = '#ff8833';
    ctx.fillRect(5, 5, 6, 6);
    ctx.fillRect(4, 7, 8, 2);
    // Hot center (bright orange-yellow)
    ctx.fillStyle = '#ffbb44';
    ctx.fillRect(6, 6, 4, 4);
    // White-hot core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
    // Flame wisps radiating outward (orange)
    ctx.fillStyle = '#ff6622';
    ctx.fillRect(0, 3, 2, 2);
    ctx.fillRect(14, 3, 2, 2);
    ctx.fillRect(0, 11, 2, 2);
    ctx.fillRect(14, 11, 2, 2);
    ctx.fillRect(3, 0, 2, 2);
    ctx.fillRect(11, 0, 2, 2);
    ctx.fillRect(3, 14, 2, 2);
    ctx.fillRect(11, 14, 2, 2);
    // Wisp highlights (bright)
    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(0, 3, 1, 1);
    ctx.fillRect(14, 3, 1, 1);
    ctx.fillRect(3, 0, 1, 1);
    ctx.fillRect(11, 0, 1, 1);
  });

  // 13. icon_death_wheel = boomerang + execute
  // Spinning circular blade/chakram, dark green with red edge glow + rotation lines
  generateTexture(scene, 'icon_death_wheel', 16, 16, (ctx) => {
    // Rotation motion lines (dark green, behind blade)
    ctx.fillStyle = '#226633';
    ctx.fillRect(0, 7, 3, 2);
    ctx.fillRect(13, 7, 3, 2);
    ctx.fillRect(7, 0, 2, 3);
    ctx.fillRect(7, 13, 2, 3);
    // Diagonal motion lines
    ctx.fillRect(1, 1, 2, 1);
    ctx.fillRect(13, 1, 2, 1);
    ctx.fillRect(1, 14, 2, 1);
    ctx.fillRect(13, 14, 2, 1);
    // Chakram outer ring (dark green)
    ctx.fillStyle = '#227744';
    ctx.fillRect(3, 1, 10, 2);
    ctx.fillRect(1, 3, 2, 2);
    ctx.fillRect(13, 3, 2, 2);
    ctx.fillRect(0, 5, 2, 6);
    ctx.fillRect(14, 5, 2, 6);
    ctx.fillRect(1, 11, 2, 2);
    ctx.fillRect(13, 11, 2, 2);
    ctx.fillRect(3, 13, 10, 2);
    // Inner ring hollow (black/empty - no fill needed, canvas is transparent)
    // Blade teeth/serrations (green)
    ctx.fillStyle = '#33aa55';
    ctx.fillRect(4, 2, 2, 1);
    ctx.fillRect(7, 1, 2, 1);
    ctx.fillRect(10, 2, 2, 1);
    ctx.fillRect(2, 4, 1, 2);
    ctx.fillRect(2, 10, 1, 2);
    ctx.fillRect(4, 13, 2, 1);
    ctx.fillRect(7, 14, 2, 1);
    ctx.fillRect(10, 13, 2, 1);
    ctx.fillRect(13, 4, 1, 2);
    ctx.fillRect(13, 10, 1, 2);
    // Inner ring edge (light green highlight)
    ctx.fillStyle = '#55cc66';
    ctx.fillRect(5, 3, 6, 1);
    ctx.fillRect(3, 5, 1, 6);
    ctx.fillRect(12, 5, 1, 6);
    ctx.fillRect(5, 12, 6, 1);
    // Red execute edge glow on teeth
    ctx.fillStyle = '#cc2233';
    ctx.fillRect(4, 1, 2, 1);
    ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(10, 1, 2, 1);
    ctx.fillRect(0, 4, 1, 2);
    ctx.fillRect(0, 10, 1, 2);
    ctx.fillRect(4, 14, 2, 1);
    ctx.fillRect(7, 15, 2, 1);
    ctx.fillRect(10, 14, 2, 1);
    ctx.fillRect(15, 4, 1, 2);
    ctx.fillRect(15, 10, 1, 2);
    // Red glow highlights
    ctx.fillStyle = '#ff4455';
    ctx.fillRect(5, 1, 1, 1);
    ctx.fillRect(7, 0, 1, 1);
    ctx.fillRect(11, 1, 1, 1);
    // Center hub (dark green)
    ctx.fillStyle = '#1a5533';
    ctx.fillRect(6, 6, 4, 4);
    // Center hub highlight
    ctx.fillStyle = '#33bb55';
    ctx.fillRect(7, 7, 2, 2);
    // Red center accent
    ctx.fillStyle = '#ee3344';
    ctx.fillRect(7, 7, 1, 1);
  });

  // 14. icon_mega_blaster = basic_shot + pierce
  // LARGE bullet (2x size) with long trail, pierce-through arrow, gold/yellow
  generateTexture(scene, 'icon_mega_blaster', 16, 16, (ctx) => {
    // Trail (dark gold outline)
    ctx.fillStyle = '#886611';
    ctx.fillRect(0, 7, 5, 2);
    // Trail body (gold)
    ctx.fillStyle = '#bbaa22';
    ctx.fillRect(0, 7, 4, 2);
    // Trail fade
    ctx.fillStyle = '#ddcc44';
    ctx.fillRect(1, 7, 3, 2);
    // Large bullet body (dark gold outline)
    ctx.fillStyle = '#aa8811';
    ctx.fillRect(4, 3, 10, 10);
    ctx.fillRect(3, 5, 12, 6);
    // Bullet fill (gold)
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(5, 4, 8, 8);
    ctx.fillRect(4, 6, 10, 4);
    // Bullet inner (bright gold)
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(6, 5, 6, 6);
    ctx.fillRect(5, 7, 8, 2);
    // White core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 4, 2);
    // Pierce-through arrow (going through bullet)
    ctx.fillStyle = '#cc9900';
    ctx.fillRect(12, 7, 4, 2);
    ctx.fillRect(14, 6, 2, 1);
    ctx.fillRect(14, 9, 2, 1);
    // Arrow highlight
    ctx.fillStyle = '#ffcc33';
    ctx.fillRect(13, 7, 2, 2);
    // Arrow tip (bright)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(15, 7, 1, 2);
    // Pierce impact lines (white)
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(4, 4, 1, 1);
    ctx.fillRect(13, 4, 1, 1);
    ctx.fillRect(4, 11, 1, 1);
    ctx.fillRect(13, 11, 1, 1);
  });

  // 15. icon_thunder_slash = sword_slash + lightning
  // Sword with lightning bolt running along blade, electric sparks
  generateTexture(scene, 'icon_thunder_slash', 16, 16, (ctx) => {
    // Sword blade (blue-white steel)
    ctx.fillStyle = '#8899cc';
    ctx.fillRect(12, 0, 2, 3);
    ctx.fillRect(10, 2, 3, 2);
    ctx.fillRect(8, 4, 3, 2);
    ctx.fillRect(6, 6, 3, 2);
    ctx.fillRect(4, 8, 3, 2);
    ctx.fillRect(2, 10, 3, 2);
    ctx.fillRect(0, 12, 3, 2);
    // Blade edge highlight (white)
    ctx.fillStyle = '#ccddff';
    ctx.fillRect(13, 0, 1, 3);
    ctx.fillRect(12, 2, 1, 2);
    ctx.fillRect(10, 4, 1, 2);
    ctx.fillRect(8, 6, 1, 2);
    ctx.fillRect(6, 8, 1, 2);
    ctx.fillRect(4, 10, 1, 2);
    ctx.fillRect(2, 12, 1, 2);
    // Lightning bolt RUNNING ALONG the blade (bright cyan)
    ctx.fillStyle = '#44ccff';
    ctx.fillRect(11, 1, 2, 1);
    ctx.fillRect(9, 3, 2, 1);
    ctx.fillRect(7, 5, 2, 1);
    ctx.fillRect(5, 7, 2, 1);
    ctx.fillRect(3, 9, 2, 1);
    ctx.fillRect(1, 11, 2, 1);
    // Lightning core (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(12, 1, 1, 1);
    ctx.fillRect(10, 3, 1, 1);
    ctx.fillRect(8, 5, 1, 1);
    ctx.fillRect(6, 7, 1, 1);
    ctx.fillRect(4, 9, 1, 1);
    ctx.fillRect(2, 11, 1, 1);
    // Electric sparks branching off (cyan)
    ctx.fillStyle = '#66ddff';
    ctx.fillRect(13, 2, 2, 1);
    ctx.fillRect(0, 3, 2, 1);
    ctx.fillRect(14, 5, 2, 1);
    ctx.fillRect(0, 6, 2, 1);
    ctx.fillRect(12, 7, 2, 1);
    ctx.fillRect(1, 9, 2, 1);
    ctx.fillRect(14, 10, 2, 1);
    ctx.fillRect(0, 12, 1, 1);
    // Spark tips (white)
    ctx.fillStyle = '#aaeeff';
    ctx.fillRect(14, 2, 1, 1);
    ctx.fillRect(15, 5, 1, 1);
    ctx.fillRect(0, 6, 1, 1);
    ctx.fillRect(13, 7, 1, 1);
    // Cross-guard (electric blue)
    ctx.fillStyle = '#2266cc';
    ctx.fillRect(0, 12, 5, 2);
    ctx.fillRect(4, 11, 3, 1);
    // Handle (dark blue)
    ctx.fillStyle = '#223366';
    ctx.fillRect(0, 14, 3, 2);
    ctx.fillRect(1, 13, 2, 1);
    // Pommel (bright blue)
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(0, 14, 2, 2);
  });

  // 16. icon_fragment_bomb = shotgun + splash
  // Explosion blast with embedded pellets flying outward, bright center
  generateTexture(scene, 'icon_fragment_bomb', 16, 16, (ctx) => {
    // Outer shockwave ring (dark orange outline)
    ctx.fillStyle = '#993300';
    ctx.fillRect(3, 0, 10, 2);
    ctx.fillRect(1, 2, 2, 2);
    ctx.fillRect(13, 2, 2, 2);
    ctx.fillRect(0, 4, 2, 8);
    ctx.fillRect(14, 4, 2, 8);
    ctx.fillRect(1, 12, 2, 2);
    ctx.fillRect(13, 12, 2, 2);
    ctx.fillRect(3, 14, 10, 2);
    // Inner explosion fill (orange)
    ctx.fillStyle = '#ee6622';
    ctx.fillRect(5, 2, 6, 2);
    ctx.fillRect(3, 4, 10, 2);
    ctx.fillRect(2, 6, 12, 4);
    ctx.fillRect(3, 10, 10, 2);
    ctx.fillRect(5, 12, 6, 2);
    // Explosion core (bright yellow)
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(5, 5, 6, 6);
    ctx.fillRect(4, 6, 8, 4);
    // Hot white center
    ctx.fillStyle = '#ffeeaa';
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
    // Embedded pellets flying outward (dark orange dots)
    ctx.fillStyle = '#884411';
    ctx.fillRect(1, 1, 2, 2);
    ctx.fillRect(13, 1, 2, 2);
    ctx.fillRect(1, 13, 2, 2);
    ctx.fillRect(13, 13, 2, 2);
    ctx.fillRect(5, 0, 2, 1);
    ctx.fillRect(9, 0, 2, 1);
    ctx.fillRect(5, 15, 2, 1);
    ctx.fillRect(9, 15, 2, 1);
    ctx.fillRect(0, 5, 1, 2);
    ctx.fillRect(15, 5, 1, 2);
    ctx.fillRect(0, 9, 1, 2);
    ctx.fillRect(15, 9, 1, 2);
    // Pellet highlights (bright orange)
    ctx.fillStyle = '#ff8833';
    ctx.fillRect(1, 1, 1, 1);
    ctx.fillRect(14, 1, 1, 1);
    ctx.fillRect(1, 13, 1, 1);
    ctx.fillRect(14, 13, 1, 1);
    // Directional force lines (bright orange)
    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(7, 15, 2, 1);
    ctx.fillRect(0, 7, 1, 2);
    ctx.fillRect(15, 7, 1, 2);
  });

  // 17. icon_thunderstorm = lightning + chain
  // MULTIPLE lightning bolts converging on center point, dramatic
  generateTexture(scene, 'icon_thunderstorm', 16, 16, (ctx) => {
    // Center convergence glow (electric blue)
    ctx.fillStyle = '#2255cc';
    ctx.fillRect(5, 5, 6, 6);
    ctx.fillRect(4, 7, 8, 2);
    // Lightning bolt 1: top-left to center
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(1, 0, 2, 2);
    ctx.fillRect(2, 2, 2, 2);
    ctx.fillRect(3, 4, 2, 2);
    // Lightning bolt 2: top-right to center
    ctx.fillRect(13, 0, 2, 2);
    ctx.fillRect(12, 2, 2, 2);
    ctx.fillRect(11, 4, 2, 2);
    // Lightning bolt 3: bottom-left to center
    ctx.fillRect(1, 14, 2, 2);
    ctx.fillRect(2, 12, 2, 2);
    ctx.fillRect(3, 10, 2, 2);
    // Lightning bolt 4: bottom-right to center
    ctx.fillRect(13, 14, 2, 2);
    ctx.fillRect(12, 12, 2, 2);
    ctx.fillRect(11, 10, 2, 2);
    // Bolt white cores
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(2, 0, 1, 2);
    ctx.fillRect(3, 2, 1, 2);
    ctx.fillRect(4, 4, 1, 2);
    ctx.fillRect(14, 0, 1, 2);
    ctx.fillRect(13, 2, 1, 2);
    ctx.fillRect(12, 4, 1, 2);
    ctx.fillRect(2, 14, 1, 2);
    ctx.fillRect(3, 12, 1, 2);
    ctx.fillRect(4, 10, 1, 2);
    ctx.fillRect(14, 14, 1, 2);
    ctx.fillRect(13, 12, 1, 2);
    ctx.fillRect(12, 10, 1, 2);
    // Bright center point (white)
    ctx.fillStyle = '#aaddff';
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
    // Side branch sparks (light blue)
    ctx.fillStyle = '#66aaff';
    ctx.fillRect(0, 2, 1, 1);
    ctx.fillRect(15, 2, 1, 1);
    ctx.fillRect(0, 13, 1, 1);
    ctx.fillRect(15, 13, 1, 1);
    ctx.fillRect(5, 1, 2, 1);
    ctx.fillRect(9, 1, 2, 1);
    ctx.fillRect(5, 14, 2, 1);
    ctx.fillRect(9, 14, 2, 1);
    // Bright electric tips
    ctx.fillStyle = '#ccddff';
    ctx.fillRect(1, 0, 1, 1);
    ctx.fillRect(14, 0, 1, 1);
    ctx.fillRect(1, 15, 1, 1);
    ctx.fillRect(14, 15, 1, 1);
  });

  // 18. icon_tracking_fireball = fireball_orbit + speed
  // Fireball with CURVED homing trail showing direction change
  generateTexture(scene, 'icon_tracking_fireball', 16, 16, (ctx) => {
    // Curved homing trail - dark outline
    ctx.fillStyle = '#882211';
    ctx.fillRect(0, 10, 2, 2);
    ctx.fillRect(1, 8, 2, 2);
    ctx.fillRect(2, 6, 2, 2);
    ctx.fillRect(4, 4, 2, 2);
    ctx.fillRect(6, 3, 3, 2);
    // Curved trail body (red-orange)
    ctx.fillStyle = '#cc4422';
    ctx.fillRect(1, 10, 1, 1);
    ctx.fillRect(2, 8, 1, 1);
    ctx.fillRect(3, 6, 1, 1);
    ctx.fillRect(5, 4, 1, 1);
    ctx.fillRect(7, 3, 2, 1);
    // Trail fade (orange)
    ctx.fillStyle = '#ee6633';
    ctx.fillRect(1, 9, 1, 1);
    ctx.fillRect(2, 7, 1, 1);
    ctx.fillRect(3, 5, 1, 1);
    ctx.fillRect(5, 4, 1, 1);
    // Fireball body (red-orange outline)
    ctx.fillStyle = '#cc2211';
    ctx.fillRect(8, 0, 8, 8);
    ctx.fillRect(7, 1, 2, 6);
    // Fireball fill (orange)
    ctx.fillStyle = '#ee4422';
    ctx.fillRect(9, 1, 6, 6);
    ctx.fillRect(8, 2, 8, 4);
    // Fireball inner (bright orange)
    ctx.fillStyle = '#ff7733';
    ctx.fillRect(10, 2, 4, 4);
    ctx.fillRect(9, 3, 6, 2);
    // Hot core (yellow)
    ctx.fillStyle = '#ffbb44';
    ctx.fillRect(11, 3, 2, 2);
    // White-hot center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 3, 1, 1);
    // Direction change indicator (bright trail tip)
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(0, 11, 1, 1);
    // Speed lines (pale orange)
    ctx.fillStyle = '#ff8844';
    ctx.fillRect(3, 12, 3, 1);
    ctx.fillRect(1, 13, 2, 1);
    // Trail heat glow
    ctx.fillStyle = '#ff9944';
    ctx.fillRect(6, 5, 2, 1);
  });

  // 19. icon_frost_storm = ice_wave + chain
  // Ice crystal with LIGHTNING BRANCHES from each point, hybrid
  generateTexture(scene, 'icon_frost_storm', 16, 16, (ctx) => {
    // Ice crystal body (pale blue)
    ctx.fillStyle = '#77bbee';
    ctx.fillRect(6, 3, 4, 10);
    ctx.fillRect(3, 6, 10, 4);
    // Crystal outer points (white-blue)
    ctx.fillStyle = '#aaddff';
    ctx.fillRect(7, 0, 2, 4);
    ctx.fillRect(7, 12, 2, 4);
    ctx.fillRect(0, 7, 4, 2);
    ctx.fillRect(12, 7, 4, 2);
    // Crystal inner bright (white)
    ctx.fillStyle = '#ddeeff';
    ctx.fillRect(6, 4, 4, 8);
    ctx.fillRect(4, 6, 8, 4);
    // Center crystal (bright white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 6, 2, 4);
    ctx.fillRect(6, 7, 4, 2);
    // Lightning branches from crystal points (cyan)
    ctx.fillStyle = '#33ccff';
    // From top point
    ctx.fillRect(5, 1, 1, 1);
    ctx.fillRect(4, 0, 1, 1);
    ctx.fillRect(10, 1, 1, 1);
    ctx.fillRect(11, 0, 1, 1);
    // From bottom point
    ctx.fillRect(5, 14, 1, 1);
    ctx.fillRect(4, 15, 1, 1);
    ctx.fillRect(10, 14, 1, 1);
    ctx.fillRect(11, 15, 1, 1);
    // From left point
    ctx.fillRect(1, 5, 1, 1);
    ctx.fillRect(0, 4, 1, 1);
    ctx.fillRect(1, 10, 1, 1);
    ctx.fillRect(0, 11, 1, 1);
    // From right point
    ctx.fillRect(14, 5, 1, 1);
    ctx.fillRect(15, 4, 1, 1);
    ctx.fillRect(14, 10, 1, 1);
    ctx.fillRect(15, 11, 1, 1);
    // Lightning branch highlights (white-cyan)
    ctx.fillStyle = '#aaeeff';
    ctx.fillRect(4, 0, 1, 1);
    ctx.fillRect(11, 0, 1, 1);
    ctx.fillRect(0, 4, 1, 1);
    ctx.fillRect(15, 4, 1, 1);
    ctx.fillRect(0, 11, 1, 1);
    ctx.fillRect(15, 11, 1, 1);
    ctx.fillRect(4, 15, 1, 1);
    ctx.fillRect(11, 15, 1, 1);
    // Crystal edge dark lines (blue)
    ctx.fillStyle = '#4499cc';
    ctx.fillRect(7, 3, 2, 1);
    ctx.fillRect(7, 12, 2, 1);
    ctx.fillRect(3, 7, 1, 2);
    ctx.fillRect(12, 7, 1, 2);
  });

  // 20. icon_plague_bomb = poison_snake + splash
  // Toxic explosion (green splatter) with venom drops + skull hint
  generateTexture(scene, 'icon_plague_bomb', 16, 16, (ctx) => {
    // Outer splatter ring (dark green outline)
    ctx.fillStyle = '#225522';
    ctx.fillRect(3, 1, 10, 2);
    ctx.fillRect(1, 3, 2, 2);
    ctx.fillRect(13, 3, 2, 2);
    ctx.fillRect(0, 5, 2, 6);
    ctx.fillRect(14, 5, 2, 6);
    ctx.fillRect(1, 11, 2, 2);
    ctx.fillRect(13, 11, 2, 2);
    ctx.fillRect(3, 13, 10, 2);
    // Inner splatter fill (toxic green)
    ctx.fillStyle = '#44aa33';
    ctx.fillRect(5, 3, 6, 2);
    ctx.fillRect(3, 5, 10, 2);
    ctx.fillRect(2, 7, 12, 2);
    ctx.fillRect(3, 9, 10, 2);
    ctx.fillRect(5, 11, 6, 2);
    // Bright toxic center (yellow-green)
    ctx.fillStyle = '#88dd44';
    ctx.fillRect(5, 5, 6, 6);
    ctx.fillRect(4, 7, 8, 2);
    // Hot center (bright green)
    ctx.fillStyle = '#bbee66';
    ctx.fillRect(6, 6, 4, 4);
    // Skull hint in center (dark)
    ctx.fillStyle = '#113311';
    // Skull head
    ctx.fillRect(6, 5, 4, 4);
    // Eye sockets
    ctx.fillStyle = '#44ff44';
    ctx.fillRect(6, 6, 2, 2);
    ctx.fillRect(8, 6, 2, 2);
    // Skull mouth
    ctx.fillStyle = '#113311';
    ctx.fillRect(7, 8, 2, 1);
    // Crossbones hint (dark)
    ctx.fillRect(5, 9, 6, 1);
    ctx.fillRect(6, 10, 4, 1);
    // Venom drops radiating outward (bright green)
    ctx.fillStyle = '#66ff44';
    ctx.fillRect(0, 2, 2, 2);
    ctx.fillRect(14, 2, 2, 2);
    ctx.fillRect(0, 12, 2, 2);
    ctx.fillRect(14, 12, 2, 2);
    ctx.fillRect(3, 0, 2, 2);
    ctx.fillRect(11, 0, 2, 2);
    ctx.fillRect(3, 14, 2, 2);
    ctx.fillRect(11, 14, 2, 2);
    // Venom drop bright tips (yellow)
    ctx.fillStyle = '#ccff44';
    ctx.fillRect(0, 2, 1, 1);
    ctx.fillRect(14, 2, 1, 1);
    ctx.fillRect(3, 0, 1, 1);
    ctx.fillRect(11, 0, 1, 1);
    // Splatter drips (toxic green)
    ctx.fillStyle = '#55bb33';
    ctx.fillRect(1, 6, 1, 2);
    ctx.fillRect(14, 8, 1, 2);
    ctx.fillRect(7, 14, 2, 1);
  });

  // 21. icon_sun_storm = fireball_orbit + bullet_size
  // MASSIVE sun-like fireball with solar flare rays
  generateTexture(scene, 'icon_sun_storm', 16, 16, (ctx) => {
    // Outermost solar corona (dark orange)
    ctx.fillStyle = '#aa4400';
    ctx.fillRect(5, 0, 6, 2);
    ctx.fillRect(0, 5, 2, 6);
    ctx.fillRect(14, 5, 2, 6);
    ctx.fillRect(5, 14, 6, 2);
    ctx.fillRect(2, 2, 3, 2);
    ctx.fillRect(11, 2, 3, 2);
    ctx.fillRect(2, 12, 3, 2);
    ctx.fillRect(11, 12, 3, 2);
    // Solar flare rays (orange)
    ctx.fillStyle = '#ee6622';
    ctx.fillRect(3, 0, 2, 3);
    ctx.fillRect(11, 0, 2, 3);
    ctx.fillRect(3, 13, 2, 3);
    ctx.fillRect(11, 13, 2, 3);
    ctx.fillRect(0, 3, 3, 2);
    ctx.fillRect(13, 3, 3, 2);
    ctx.fillRect(0, 11, 3, 2);
    ctx.fillRect(13, 11, 3, 2);
    // Main sun body (deep orange)
    ctx.fillStyle = '#dd5511';
    ctx.fillRect(3, 3, 10, 10);
    ctx.fillRect(2, 5, 12, 6);
    ctx.fillRect(5, 2, 6, 12);
    // Sun inner (bright orange)
    ctx.fillStyle = '#ff8833';
    ctx.fillRect(4, 4, 8, 8);
    ctx.fillRect(3, 6, 10, 4);
    // Sun hot layer (orange-gold)
    ctx.fillStyle = '#ffaa44';
    ctx.fillRect(5, 5, 6, 6);
    ctx.fillRect(4, 7, 8, 2);
    // Sun bright layer (pale gold)
    ctx.fillStyle = '#ffcc66';
    ctx.fillRect(6, 6, 4, 4);
    // White-hot core
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
    // Flare ray highlights (bright)
    ctx.fillStyle = '#ffbb44';
    ctx.fillRect(3, 0, 1, 2);
    ctx.fillRect(12, 0, 1, 2);
    ctx.fillRect(3, 14, 1, 2);
    ctx.fillRect(12, 14, 1, 2);
    ctx.fillRect(0, 3, 2, 1);
    ctx.fillRect(14, 3, 2, 1);
    ctx.fillRect(0, 12, 2, 1);
    ctx.fillRect(14, 12, 2, 1);
  });

  // 22. icon_photon_cannon = laser_beam + attack_speed
  // MULTIPLE parallel beams (3) with rapid-fire pulse dots, pink-white/magenta
  generateTexture(scene, 'icon_photon_cannon', 16, 16, (ctx) => {
    // Beam 1 (top) - outer glow (dark magenta)
    ctx.fillStyle = '#771144';
    ctx.fillRect(0, 0, 16, 2);
    // Beam 1 body (magenta-pink)
    ctx.fillStyle = '#cc2288';
    ctx.fillRect(1, 0, 14, 2);
    // Beam 1 bright core
    ctx.fillStyle = '#ff66aa';
    ctx.fillRect(2, 0, 12, 1);
    // Beam 2 (middle) - outer glow
    ctx.fillStyle = '#771144';
    ctx.fillRect(0, 6, 16, 4);
    // Beam 2 body
    ctx.fillStyle = '#cc2288';
    ctx.fillRect(1, 7, 14, 2);
    // Beam 2 bright core
    ctx.fillStyle = '#ff66aa';
    ctx.fillRect(2, 7, 12, 1);
    // Beam 3 (bottom) - outer glow
    ctx.fillStyle = '#771144';
    ctx.fillRect(0, 12, 16, 2);
    // Beam 3 body
    ctx.fillStyle = '#cc2288';
    ctx.fillRect(1, 12, 14, 2);
    // Beam 3 bright core
    ctx.fillStyle = '#ff66aa';
    ctx.fillRect(2, 12, 12, 1);
    // White-hot core lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, 0, 10, 1);
    ctx.fillRect(3, 7, 10, 1);
    ctx.fillRect(3, 12, 10, 1);
    // Rapid-fire pulse dots (bright pink-white)
    ctx.fillStyle = '#ffaacc';
    ctx.fillRect(2, 3, 2, 2);
    ctx.fillRect(6, 4, 2, 1);
    ctx.fillRect(10, 3, 2, 2);
    ctx.fillRect(4, 10, 2, 1);
    ctx.fillRect(8, 11, 2, 1);
    ctx.fillRect(12, 10, 2, 1);
    // Pulse bright centers
    ctx.fillStyle = '#ffddff';
    ctx.fillRect(2, 3, 1, 1);
    ctx.fillRect(10, 3, 1, 1);
    // Muzzle emission glow (pink)
    ctx.fillStyle = '#ff88bb';
    ctx.fillRect(0, 1, 2, 1);
    ctx.fillRect(0, 8, 2, 1);
    ctx.fillRect(0, 13, 2, 1);
    // Tip flare
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 0, 2, 1);
    ctx.fillRect(14, 7, 2, 1);
    ctx.fillRect(14, 12, 2, 1);
    // Separating space glow (magenta)
    ctx.fillStyle = '#aa2266';
    ctx.fillRect(5, 5, 1, 1);
    ctx.fillRect(10, 5, 1, 1);
    ctx.fillRect(7, 11, 1, 1);
  });

  // 23. icon_soul_reaper = death_scythe + splash
  // Scythe with SOUL VORTEX + purple splash waves
  generateTexture(scene, 'icon_soul_reaper', 16, 16, (ctx) => {
    // Splash waves radiating out (dark purple outline)
    ctx.fillStyle = '#331166';
    ctx.fillRect(1, 1, 14, 2);
    ctx.fillRect(0, 3, 2, 2);
    ctx.fillRect(14, 3, 2, 2);
    ctx.fillRect(0, 11, 2, 2);
    ctx.fillRect(14, 11, 2, 2);
    ctx.fillRect(1, 13, 14, 2);
    // Splash waves fill (purple)
    ctx.fillStyle = '#6622aa';
    ctx.fillRect(3, 2, 10, 1);
    ctx.fillRect(1, 4, 2, 1);
    ctx.fillRect(13, 4, 2, 1);
    ctx.fillRect(1, 11, 2, 1);
    ctx.fillRect(13, 11, 2, 1);
    ctx.fillRect(3, 13, 10, 1);
    // Scythe handle (dark purple-gray)
    ctx.fillStyle = '#332244';
    ctx.fillRect(10, 7, 2, 8);
    ctx.fillRect(12, 8, 2, 6);
    // Handle highlight
    ctx.fillStyle = '#443355';
    ctx.fillRect(11, 7, 1, 8);
    // Blade curve (deep purple)
    ctx.fillStyle = '#7722aa';
    ctx.fillRect(1, 2, 8, 2);
    ctx.fillRect(3, 4, 7, 2);
    ctx.fillRect(5, 6, 6, 2);
    ctx.fillRect(8, 8, 4, 2);
    // Blade edge highlight (light purple)
    ctx.fillStyle = '#9944cc';
    ctx.fillRect(1, 2, 8, 1);
    ctx.fillRect(3, 4, 1, 1);
    ctx.fillRect(5, 6, 1, 1);
    // Sharp edge (dark)
    ctx.fillStyle = '#110022';
    ctx.fillRect(1, 3, 2, 1);
    ctx.fillRect(3, 5, 2, 1);
    ctx.fillRect(5, 7, 2, 1);
    // Soul vortex around blade (swirling purple energy)
    ctx.fillStyle = '#aa55ee';
    ctx.fillRect(2, 1, 3, 1);
    ctx.fillRect(8, 3, 3, 1);
    ctx.fillRect(1, 5, 2, 1);
    ctx.fillRect(10, 5, 2, 1);
    ctx.fillRect(3, 8, 2, 1);
    ctx.fillRect(9, 9, 2, 1);
    // Vortex bright spots (ghost white)
    ctx.fillStyle = '#ddbbff';
    ctx.fillRect(3, 1, 1, 1);
    ctx.fillRect(9, 3, 1, 1);
    ctx.fillRect(2, 5, 1, 1);
    // Vortex center glow (bright)
    ctx.fillStyle = '#eeccff';
    ctx.fillRect(5, 3, 2, 2);
    // Blade tip (bright purple)
    ctx.fillStyle = '#dd88ff';
    ctx.fillRect(1, 2, 2, 2);
    // Splash wave bright accents
    ctx.fillStyle = '#bb77ee';
    ctx.fillRect(7, 1, 2, 1);
    ctx.fillRect(7, 14, 2, 1);
    ctx.fillRect(0, 7, 1, 2);
    ctx.fillRect(15, 7, 1, 2);
    // Ghost-white accent sparkles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 4, 1, 1);
    ctx.fillRect(4, 6, 1, 1);
  });

  // ===================================================================
  // FUSION AUGMENT/DEFENSE ICONS
  // ===================================================================

  // 42. icon_wind_runner = swiftness + heal_cloak — boot with green cross glow
  generateTexture(scene, 'icon_wind_runner', 16, 16, (ctx) => {
    // Boot shape (yellow-green)
    ctx.fillStyle = '#88aa22';
    ctx.fillRect(4, 0, 6, 4);
    ctx.fillRect(3, 4, 6, 3);
    ctx.fillRect(2, 7, 10, 3);
    ctx.fillRect(8, 10, 6, 2);
    ctx.fillRect(10, 10, 4, 3);
    // Boot highlight (light green-yellow)
    ctx.fillStyle = '#bbdd44';
    ctx.fillRect(5, 1, 4, 3);
    ctx.fillRect(4, 4, 4, 3);
    ctx.fillRect(3, 7, 8, 2);
    // Green cross on boot (heal symbol)
    ctx.fillStyle = '#44ff66';
    ctx.fillRect(5, 2, 2, 3);
    ctx.fillRect(4, 3, 4, 1);
    // Speed wind lines (pale green)
    ctx.fillStyle = '#aaddaa';
    ctx.fillRect(0, 2, 2, 1);
    ctx.fillRect(0, 5, 2, 1);
    ctx.fillRect(0, 8, 2, 1);
    // Sole dark
    ctx.fillStyle = '#556611';
    ctx.fillRect(2, 9, 10, 1);
    ctx.fillRect(10, 12, 4, 1);
    // Bright accent
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 3, 1, 1);
  });

  // 43. icon_shield_bash = shield_orbit + reflect_mirror — shield with impact star
  generateTexture(scene, 'icon_shield_bash', 16, 16, (ctx) => {
    // Shield body (blue-purple)
    ctx.fillStyle = '#4433bb';
    ctx.fillRect(3, 1, 10, 2);
    ctx.fillRect(2, 3, 12, 2);
    ctx.fillRect(1, 5, 14, 4);
    ctx.fillRect(2, 9, 12, 2);
    ctx.fillRect(3, 11, 10, 2);
    ctx.fillRect(4, 13, 8, 1);
    ctx.fillRect(5, 14, 6, 1);
    // Shield highlight
    ctx.fillStyle = '#6655dd';
    ctx.fillRect(4, 2, 8, 2);
    ctx.fillRect(3, 4, 10, 2);
    ctx.fillRect(2, 6, 5, 3);
    // Impact star at center (bright)
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(7, 4, 2, 4);
    ctx.fillRect(5, 6, 6, 2);
    ctx.fillRect(6, 5, 4, 4);
    // Star core (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 6, 2, 2);
    // Shield border (dark)
    ctx.fillStyle = '#221188';
    ctx.fillRect(3, 1, 10, 1);
    ctx.fillRect(1, 5, 1, 4);
    ctx.fillRect(14, 5, 1, 4);
    // Reflect gleam
    ctx.fillStyle = '#aabbff';
    ctx.fillRect(12, 3, 1, 1);
    ctx.fillRect(4, 4, 1, 1);
  });

  // 44. icon_void_walker = ghost_step + speed — dark ghost with speed trails
  generateTexture(scene, 'icon_void_walker', 16, 16, (ctx) => {
    // Ghost body (dark blue-purple)
    ctx.fillStyle = '#4433aa';
    ctx.fillRect(4, 1, 8, 6);
    ctx.fillRect(3, 2, 10, 4);
    ctx.fillRect(2, 4, 12, 3);
    ctx.fillRect(2, 7, 12, 5);
    ctx.fillRect(2, 12, 3, 2);
    ctx.fillRect(6, 12, 4, 2);
    ctx.fillRect(11, 12, 3, 2);
    // Ghost highlight
    ctx.fillStyle = '#6655cc';
    ctx.fillRect(5, 2, 6, 4);
    ctx.fillRect(3, 5, 10, 4);
    // Eyes (bright purple)
    ctx.fillStyle = '#bb88ff';
    ctx.fillRect(5, 4, 2, 3);
    ctx.fillRect(9, 4, 2, 3);
    // Eye cores (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(5, 5, 1, 1);
    ctx.fillRect(9, 5, 1, 1);
    // Speed trails behind ghost
    ctx.fillStyle = '#8877dd';
    ctx.fillRect(0, 3, 2, 1);
    ctx.fillRect(0, 6, 2, 1);
    ctx.fillRect(0, 9, 2, 1);
    ctx.fillRect(0, 12, 2, 1);
    // Void wisps
    ctx.fillStyle = '#9988ee';
    ctx.fillRect(4, 13, 1, 1);
    ctx.fillRect(8, 13, 1, 1);
    // Dark outline accent
    ctx.fillStyle = '#221166';
    ctx.fillRect(4, 1, 8, 1);
    ctx.fillRect(2, 7, 1, 5);
    ctx.fillRect(13, 7, 1, 5);
  });

  // 45. icon_black_hole = repulse + magnet — purple vortex pulling inward
  generateTexture(scene, 'icon_black_hole', 16, 16, (ctx) => {
    // Outer spiral arms (dark purple)
    ctx.fillStyle = '#5522aa';
    ctx.fillRect(1, 0, 3, 2);
    ctx.fillRect(0, 2, 2, 3);
    ctx.fillRect(12, 0, 3, 2);
    ctx.fillRect(14, 2, 2, 3);
    ctx.fillRect(0, 11, 2, 3);
    ctx.fillRect(1, 13, 3, 2);
    ctx.fillRect(14, 11, 2, 3);
    ctx.fillRect(12, 13, 3, 2);
    // Mid spiral (purple)
    ctx.fillStyle = '#7744cc';
    ctx.fillRect(3, 2, 3, 2);
    ctx.fillRect(2, 4, 2, 3);
    ctx.fillRect(10, 2, 3, 2);
    ctx.fillRect(12, 4, 2, 3);
    ctx.fillRect(2, 9, 2, 3);
    ctx.fillRect(3, 12, 3, 2);
    ctx.fillRect(12, 9, 2, 3);
    ctx.fillRect(10, 12, 3, 2);
    // Inner vortex ring (bright purple)
    ctx.fillStyle = '#9966ee';
    ctx.fillRect(5, 5, 6, 2);
    ctx.fillRect(4, 6, 2, 4);
    ctx.fillRect(10, 6, 2, 4);
    ctx.fillRect(5, 9, 6, 2);
    // Vortex center (dark)
    ctx.fillStyle = '#110033';
    ctx.fillRect(6, 7, 4, 2);
    // Pull-in arrows (bright)
    ctx.fillStyle = '#bbaaff';
    ctx.fillRect(7, 1, 2, 2);
    ctx.fillRect(7, 13, 2, 2);
    ctx.fillRect(1, 7, 2, 2);
    ctx.fillRect(13, 7, 2, 2);
    // Center point (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
    // Attraction dots
    ctx.fillStyle = '#ddbbff';
    ctx.fillRect(3, 1, 1, 1);
    ctx.fillRect(12, 1, 1, 1);
    ctx.fillRect(3, 14, 1, 1);
    ctx.fillRect(12, 14, 1, 1);
  });

  // 46. icon_absolute_defense = shield + armor + reflect — layered prismatic shield
  generateTexture(scene, 'icon_absolute_defense', 16, 16, (ctx) => {
    // Outer shield layer (blue)
    ctx.fillStyle = '#2244cc';
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
    // Mid armor layer (silver)
    ctx.fillStyle = '#8899bb';
    ctx.fillRect(5, 3, 6, 2);
    ctx.fillRect(3, 5, 3, 2);
    ctx.fillRect(10, 5, 3, 2);
    ctx.fillRect(3, 9, 3, 2);
    ctx.fillRect(10, 9, 3, 2);
    ctx.fillRect(5, 11, 6, 2);
    // Inner reflect surface (gold)
    ctx.fillStyle = '#ddaa33';
    ctx.fillRect(6, 5, 4, 2);
    ctx.fillRect(5, 6, 2, 4);
    ctx.fillRect(9, 6, 2, 4);
    ctx.fillRect(6, 9, 4, 2);
    // Center emblem (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillRect(7, 5, 2, 6);
    ctx.fillRect(5, 7, 6, 2);
    // Reflect shine line
    ctx.fillStyle = '#ffeecc';
    ctx.fillRect(6, 6, 2, 1);
    // Layer separation lines (dark)
    ctx.fillStyle = '#112244';
    ctx.fillRect(5, 3, 1, 1);
    ctx.fillRect(10, 3, 1, 1);
    ctx.fillRect(5, 12, 1, 1);
    ctx.fillRect(10, 12, 1, 1);
    // Bright shield tips
    ctx.fillStyle = '#6688ff';
    ctx.fillRect(7, 0, 2, 1);
    ctx.fillRect(7, 15, 2, 1);
    ctx.fillRect(0, 7, 1, 2);
    ctx.fillRect(15, 7, 1, 2);
  });

  // 47. icon_angel_embrace = holy_guard + ghost_step + heal — angel wings with cross
  generateTexture(scene, 'icon_angel_embrace', 16, 16, (ctx) => {
    // Left wing (white-gold)
    ctx.fillStyle = '#ddcc66';
    ctx.fillRect(1, 3, 3, 2);
    ctx.fillRect(0, 5, 4, 2);
    ctx.fillRect(0, 7, 5, 2);
    ctx.fillRect(1, 9, 4, 2);
    ctx.fillRect(2, 11, 3, 2);
    // Right wing (white-gold)
    ctx.fillRect(12, 3, 3, 2);
    ctx.fillRect(12, 5, 4, 2);
    ctx.fillRect(11, 7, 5, 2);
    ctx.fillRect(11, 9, 4, 2);
    ctx.fillRect(11, 11, 3, 2);
    // Wing highlight (bright gold)
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(1, 3, 2, 2);
    ctx.fillRect(0, 5, 3, 2);
    ctx.fillRect(0, 7, 4, 2);
    ctx.fillRect(13, 3, 2, 2);
    ctx.fillRect(13, 5, 3, 2);
    ctx.fillRect(12, 7, 4, 2);
    // Central cross (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 2, 2, 8);
    ctx.fillRect(5, 5, 6, 2);
    // Cross glow (pale gold)
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(7, 3, 2, 6);
    ctx.fillRect(6, 5, 4, 2);
    // Halo above cross (gold ring)
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(6, 0, 4, 1);
    ctx.fillRect(5, 1, 1, 1);
    ctx.fillRect(10, 1, 1, 1);
    ctx.fillRect(6, 2, 4, 1);
    // Wing tips bright
    ctx.fillStyle = '#ffffaa';
    ctx.fillRect(0, 7, 2, 1);
    ctx.fillRect(14, 7, 2, 1);
    // Divine rays (pale)
    ctx.fillStyle = '#eeeecc';
    ctx.fillRect(5, 13, 2, 1);
    ctx.fillRect(9, 13, 2, 1);
    ctx.fillRect(7, 14, 2, 1);
    // Bright center
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 5, 2, 2);
  });

  // 48. icon_nuclear_core = power + splash — nuclear trefoil with explosion
  generateTexture(scene, 'icon_nuclear_core', 16, 16, (ctx) => {
    // Trefoil — three rounded sectors (orange-red)
    ctx.fillStyle = '#dd4400';
    // Top sector
    ctx.fillRect(5, 1, 6, 2);
    ctx.fillRect(4, 3, 3, 2);
    ctx.fillRect(9, 3, 3, 2);
    // Bottom-left sector
    ctx.fillRect(1, 8, 3, 2);
    ctx.fillRect(2, 10, 3, 2);
    ctx.fillRect(4, 11, 3, 2);
    // Bottom-right sector
    ctx.fillRect(12, 8, 3, 2);
    ctx.fillRect(11, 10, 3, 2);
    ctx.fillRect(9, 11, 3, 2);
    // Sector highlights (bright orange)
    ctx.fillStyle = '#ff7722';
    ctx.fillRect(6, 1, 4, 2);
    ctx.fillRect(4, 3, 2, 2);
    ctx.fillRect(2, 10, 2, 2);
    ctx.fillRect(12, 10, 2, 2);
    // Center circle (yellow warning)
    ctx.fillStyle = '#ffcc22';
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillRect(5, 7, 6, 2);
    // Center bright (white)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(7, 7, 2, 2);
    // Explosion ring around trefoil
    ctx.fillStyle = '#ff9944';
    ctx.fillRect(3, 0, 2, 1);
    ctx.fillRect(11, 0, 2, 1);
    ctx.fillRect(0, 4, 1, 2);
    ctx.fillRect(15, 4, 1, 2);
    ctx.fillRect(0, 10, 1, 2);
    ctx.fillRect(15, 10, 1, 2);
    ctx.fillRect(3, 15, 2, 1);
    ctx.fillRect(11, 15, 2, 1);
    // Warning dots (bright yellow)
    ctx.fillStyle = '#ffee44';
    ctx.fillRect(4, 5, 1, 1);
    ctx.fillRect(11, 5, 1, 1);
    ctx.fillRect(7, 12, 2, 1);
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
