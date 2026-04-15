import { LEADERBOARD_KEY, LEADERBOARD_MAX } from '../constants';

export interface LeaderboardEntry {
  name: string;
  score: number;
  kills: number;
  wave: number;
  date: string;
}

const FAKE_ENTRIES: LeaderboardEntry[] = [
  { name: '地牢之王', score: 15800, kills: 312, wave: 18, date: '2026-04-09' },
  { name: '暗影猎手', score: 12350, kills: 248, wave: 15, date: '2026-04-09' },
  { name: '像素勇者', score: 9800, kills: 195, wave: 13, date: '2026-04-08' },
  { name: '毒液大师', score: 8400, kills: 172, wave: 12, date: '2026-04-08' },
  { name: '雷电法师', score: 7200, kills: 156, wave: 11, date: '2026-04-08' },
  { name: '暴走哥布林', score: 6100, kills: 134, wave: 10, date: '2026-04-07' },
  { name: '盾卫骑士', score: 5500, kills: 118, wave: 9, date: '2026-04-07' },
  { name: '冰霜女王', score: 4800, kills: 98, wave: 8, date: '2026-04-07' },
  { name: '火焰战士', score: 3900, kills: 82, wave: 7, date: '2026-04-06' },
  { name: '新手冒险者', score: 2100, kills: 45, wave: 5, date: '2026-04-06' },
  { name: '弹幕狂人', score: 1850, kills: 38, wave: 4, date: '2026-04-05' },
  { name: '史莱姆杀手', score: 1200, kills: 28, wave: 3, date: '2026-04-05' },
];

const INITIALIZED_KEY = LEADERBOARD_KEY + '_init_v2';

function initializeIfNeeded() {
  if (localStorage.getItem(INITIALIZED_KEY)) return;

  const existing = getLeaderboard();
  const merged = [...FAKE_ENTRIES, ...existing];
  merged.sort((a, b) => b.score - a.score);
  const trimmed = merged.slice(0, LEADERBOARD_MAX);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  localStorage.setItem(INITIALIZED_KEY, '1');
}

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    initializeIfNeeded();
    const data = localStorage.getItem(LEADERBOARD_KEY);
    if (!data) return FAKE_ENTRIES;
    return JSON.parse(data) as LeaderboardEntry[];
  } catch {
    return FAKE_ENTRIES;
  }
}

export function addScore(entry: LeaderboardEntry): number {
  initializeIfNeeded();
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, LEADERBOARD_MAX);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  return trimmed.findIndex(e => e.name === entry.name && e.score === entry.score) + 1;
}

export function clearLeaderboard() {
  localStorage.removeItem(LEADERBOARD_KEY);
  localStorage.removeItem(INITIALIZED_KEY);
}
