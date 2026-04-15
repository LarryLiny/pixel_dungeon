// Game world constants
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 32;
export const MAP_COLS = 60;
export const MAP_ROWS = 45;
export const MAP_WIDTH = MAP_COLS * TILE_SIZE;
export const MAP_HEIGHT = MAP_ROWS * TILE_SIZE;

// Player constants
export const PLAYER_SPEED = 160;
export const PLAYER_MAX_HP = 100;
export const PLAYER_SIZE = 14;

// Bullet constants
export const BULLET_SPEED = 350;
export const BULLET_SIZE = 4;
export const SHOOT_INTERVAL = 400; // ms
export const BULLET_DAMAGE = 10;
export const BULLET_RANGE = 400;

// Enemy constants
export const ENEMY_SPAWN_INTERVAL = 2000; // ms
export const MAX_ENEMIES = 25;
export const MAX_BULLETS = 80;
export const MAX_PICKUPS = 15;

// Pickup constants
export const PICKUP_SIZE = 12;
export const PICKUP_SPAWN_INTERVAL = 8000; // ms
export const PICKUP_MAGNET_BASE = 40;

// Wave constants
export const WAVE_DURATION = 30000; // ms
export const BOSS_EVERY_N_WAVES = 5;

// Skill constants
export const MAX_SKILL_SLOTS = 5;
export const MAX_SKILL_LEVEL = 9;
export const SKILL_DROP_CHANCE = 0.25; // 25% chance on enemy kill
export const POTION_DROP_CHANCE = 0.10; // 10% chance on enemy kill

// Leaderboard
export const LEADERBOARD_KEY = 'dungeon_roguelike_scores';
export const LEADERBOARD_MAX = 20;
