export type FacingDirection =
  | 'down'
  | 'down_right'
  | 'right'
  | 'up_right'
  | 'up'
  | 'up_left'
  | 'left'
  | 'down_left';

export type PlayerMotionState = 'idle' | 'walk1' | 'walk2';

const DIRECTIONS: FacingDirection[] = [
  'right',
  'down_right',
  'down',
  'down_left',
  'left',
  'up_left',
  'up',
  'up_right',
];

export function getDirectionFromVector(
  dx: number,
  dy: number,
  fallback: FacingDirection = 'down'
): FacingDirection {
  if (dx === 0 && dy === 0) return fallback;

  const angle = Math.atan2(dy, dx);
  const octant = Math.round(angle / (Math.PI / 4));
  const index = (octant + 8) % 8;
  return DIRECTIONS[index];
}

export function getPlayerTextureKey(
  facing: FacingDirection,
  state: PlayerMotionState
): string {
  return `player_${facing}_${state}`;
}

export function getEnemyTextureKey(
  enemyKey: string,
  facing: FacingDirection,
  state: PlayerMotionState
): string {
  return `${enemyKey}_${facing}_${state}`;
}
