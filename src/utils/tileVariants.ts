const FLOOR_VARIANTS = [
  'floor_base',
  'floor_cracked',
  'floor_dark',
  'floor_chipped',
  'floor_moss',
  'floor_rubble',
] as const;

const WALL_VARIANTS = [
  'wall_base',
  'wall_cracked',
  'wall_dark',
  'wall_chipped',
] as const;

function stableNoise(col: number, row: number, salt: number): number {
  let value = col * 374761393 + row * 668265263 + salt * 2147483647;
  value = (value ^ (value >> 13)) * 1274126177;
  return Math.abs(value ^ (value >> 16));
}

export function getFloorTextureKey(col: number, row: number): string {
  const value = stableNoise(col, row, 11) % 100;
  if (value < 52) return FLOOR_VARIANTS[0];
  if (value < 66) return FLOOR_VARIANTS[1];
  if (value < 78) return FLOOR_VARIANTS[2];
  if (value < 88) return FLOOR_VARIANTS[3];
  if (value < 95) return FLOOR_VARIANTS[4];
  return FLOOR_VARIANTS[5];
}

export function getWallTextureKey(col: number, row: number, isBorder: boolean): string {
  if (isBorder) return 'wall_border';
  const value = stableNoise(col, row, 23) % WALL_VARIANTS.length;
  return WALL_VARIANTS[value];
}
