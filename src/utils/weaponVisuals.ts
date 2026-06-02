export interface ProjectileVisual {
  texture: string;
  scale: number;
  bodySize: number;
}

export interface OrbVisual {
  texture: string;
  scale: number;
  pulse: number;
  bodySize: number;
  orbitRadius: number;
  orbitSpeed: number;
  damageMul: number;
}

const PROJECTILE_VISUALS: Record<string, ProjectileVisual> = {
  basic_shot: { texture: 'bullet_basic', scale: 1.2, bodySize: 8 },
  shotgun: { texture: 'bullet_shotgun_pellet', scale: 1.25, bodySize: 8 },
  freeze_shotgun: { texture: 'bullet_frost_shard', scale: 1.25, bodySize: 8 },
  fragment_bomb: { texture: 'bullet_fragment_shell', scale: 1.35, bodySize: 9 },
  boomerang: { texture: 'bullet_boomerang_blade', scale: 1.45, bodySize: 10 },
  death_wheel: { texture: 'bullet_death_wheel', scale: 1.7, bodySize: 12 },
  poison_snake: { texture: 'bullet_venom_fang', scale: 1.45, bodySize: 9 },
  plague_bomb: { texture: 'bullet_plague_pod', scale: 1.55, bodySize: 10 },
  death_scythe: { texture: 'bullet_death_scythe', scale: 2.25, bodySize: 13 },
  soul_reaper: { texture: 'bullet_soul_reaper', scale: 2.45, bodySize: 14 },
  mega_blaster: { texture: 'bullet_mega_blaster', scale: 2.1, bodySize: 13 },
};

const DEFAULT_PROJECTILE_VISUAL: ProjectileVisual = PROJECTILE_VISUALS.basic_shot;

const ORB_VISUALS: Record<string, OrbVisual> = {
  fireball_orbit: {
    texture: 'orb_fireball',
    scale: 1.25,
    pulse: 0.05,
    bodySize: 13,
    orbitRadius: 50,
    orbitSpeed: 0.8,
    damageMul: 0.5,
  },
  hellfire: {
    texture: 'orb_hellfire',
    scale: 1.25,
    pulse: 0.08,
    bodySize: 14,
    orbitRadius: 54,
    orbitSpeed: 1,
    damageMul: 0.6,
  },
  tracking_fireball: {
    texture: 'orb_tracking_fire',
    scale: 1.25,
    pulse: 0.06,
    bodySize: 13,
    orbitRadius: 52,
    orbitSpeed: 0.85,
    damageMul: 0.55,
  },
  sun_storm: {
    texture: 'orb_sun_storm',
    scale: 1.55,
    pulse: 0.1,
    bodySize: 16,
    orbitRadius: 70,
    orbitSpeed: 0.8,
    damageMul: 0.8,
  },
  shield_orbit: {
    texture: 'orb_guardian_shield',
    scale: 1.35,
    pulse: 0.05,
    bodySize: 14,
    orbitRadius: 40,
    orbitSpeed: 0.9,
    damageMul: 0.45,
  },
  shield_bash: {
    texture: 'orb_guardian_shield',
    scale: 1.45,
    pulse: 0.06,
    bodySize: 15,
    orbitRadius: 42,
    orbitSpeed: 1,
    damageMul: 0.55,
  },
};

const DEFAULT_ORB_VISUAL: OrbVisual = ORB_VISUALS.fireball_orbit;

export function getProjectileTextureKey(weaponType: string): string {
  return getProjectileVisual(weaponType).texture;
}

export function getOrbTextureKey(weaponType: string): string {
  return getOrbVisual(weaponType).texture;
}

export function getProjectileVisual(weaponType: string): ProjectileVisual {
  return PROJECTILE_VISUALS[weaponType] || DEFAULT_PROJECTILE_VISUAL;
}

export function getOrbVisual(weaponType: string): OrbVisual {
  return ORB_VISUALS[weaponType] || DEFAULT_ORB_VISUAL;
}
