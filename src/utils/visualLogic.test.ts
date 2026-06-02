import { getDirectionFromVector, getEnemyTextureKey, getPlayerTextureKey } from './direction';
import { getFloorTextureKey, getWallTextureKey } from './tileVariants';
import { getProjectileTextureKey, getOrbTextureKey, getProjectileVisual, getOrbVisual } from './weaponVisuals';
import { getItemVisualType } from './itemVisuals';
import { GAME_OVER_ACTIONS } from '../scenes/GameOverScene';

const assertEqual = <T>(actual: T, expected: T, label: string) => {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
};

assertEqual(getDirectionFromVector(0, 0, 'up'), 'up', 'idle keeps previous facing');
assertEqual(getDirectionFromVector(0, 1, 'left'), 'down', 'down vector maps down');
assertEqual(getDirectionFromVector(1, 0, 'left'), 'right', 'right vector maps right');
assertEqual(getDirectionFromVector(1, -1, 'down'), 'up_right', 'diagonal vector maps up_right');
assertEqual(getPlayerTextureKey('down', 'idle'), 'player_down_idle', 'player idle texture key');
assertEqual(getPlayerTextureKey('left', 'walk1'), 'player_left_walk1', 'player walk texture key');
assertEqual(getEnemyTextureKey('slime', 'up_left', 'walk2'), 'slime_up_left_walk2', 'enemy walk texture key');
assertEqual(getFloorTextureKey(0, 0), getFloorTextureKey(0, 0), 'floor key is stable');
assertEqual(getWallTextureKey(3, 4, true), 'wall_border', 'border walls use border texture');
assertEqual(getProjectileTextureKey('basic_shot'), 'bullet_basic', 'basic projectile texture key');
assertEqual(getProjectileTextureKey('freeze_shotgun'), 'bullet_frost_shard', 'freeze projectile texture key');
assertEqual(getProjectileTextureKey('soul_reaper'), 'bullet_soul_reaper', 'soul projectile texture key');
assertEqual(getOrbTextureKey('sun_storm'), 'orb_sun_storm', 'sun storm orb texture key');
assertEqual(getProjectileVisual('plague_bomb').texture, 'bullet_plague_pod', 'plague bomb uses refined projectile');
assertEqual(getProjectileVisual('death_wheel').bodySize, 12, 'death wheel uses larger collision body');
assertEqual(getOrbVisual('hellfire').texture, 'orb_hellfire', 'hellfire uses refined passive orb');
assertEqual(getOrbVisual('sun_storm').orbitRadius, 70, 'sun storm keeps wide passive orbit');
assertEqual(getItemVisualType('poison_snake').label, '范围攻击', 'poison snake is presented as an area skill');
assertEqual(getItemVisualType('fireball_orbit').label, '环绕被动', 'fireball orbit is presented as passive orbit');
assertEqual(getItemVisualType('power').label, '属性强化', 'power is presented as an augment');
assertEqual(GAME_OVER_ACTIONS.length, 3, 'game over exposes three clear next actions');
assertEqual(GAME_OVER_ACTIONS[0].label, '提交分数', 'primary game over action submits score');
assertEqual(GAME_OVER_ACTIONS[2].target, 'MenuScene', 'game over allows returning to menu');

console.log('visual logic checks passed');
