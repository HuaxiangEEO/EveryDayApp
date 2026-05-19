import type { Card, GameResult, Move, Seat } from '../types';
import type { Endgame } from '../core/endgames';

/**
 * 多局存储与统计。
 *
 * 存储设计：
 * - `dou-di-zhu:games`              已结束的对局列表（最多 50 条）
 * - `dou-di-zhu:stats`              累计统计（增量更新）
 *
 * 一局对局以"复盘所需最小信息"形式保存：
 *   { id, ts, initialHands, bottom, landlord, basePoint, history, result }
 */

export interface SavedGame {
  id: string;
  ts: number;
  initialHands: [Card[], Card[], Card[]];
  bottom: Card[];
  landlord: Seat;
  basePoint: number;
  history: Move[];
  result: GameResult;
}

export interface Stats {
  totalGames: number;
  wins: number;
  losses: number;
  asLandlordGames: number;
  asLandlordWins: number;
  asFarmerGames: number;
  asFarmerWins: number;
  bombs: number;
  rockets: number;
  springs: number;
  antiSprings: number;
}

const KEY_GAMES = 'dou-di-zhu:games';
const KEY_STATS = 'dou-di-zhu:stats';
const KEY_CUSTOM_ENDGAMES = 'dou-di-zhu:custom-endgames';
const MAX_GAMES = 50;
const MAX_CUSTOM_ENDGAMES = 30;

export const EMPTY_STATS: Stats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  asLandlordGames: 0,
  asLandlordWins: 0,
  asFarmerGames: 0,
  asFarmerWins: 0,
  bombs: 0,
  rockets: 0,
  springs: 0,
  antiSprings: 0,
};

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(KEY_STATS);
    if (!raw) return { ...EMPTY_STATS };
    return { ...EMPTY_STATS, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_STATS };
  }
}

export function saveStats(s: Stats): void {
  try {
    localStorage.setItem(KEY_STATS, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

export function resetStats(): void {
  try {
    localStorage.removeItem(KEY_STATS);
  } catch {
    /* noop */
  }
}

export function listSavedGames(): SavedGame[] {
  try {
    const raw = localStorage.getItem(KEY_GAMES);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SavedGame[];
    return Array.isArray(arr) ? arr.sort((a, b) => b.ts - a.ts) : [];
  } catch {
    return [];
  }
}

export function deleteSavedGame(id: string): void {
  const games = listSavedGames().filter(g => g.id !== id);
  try {
    localStorage.setItem(KEY_GAMES, JSON.stringify(games));
  } catch {
    /* noop */
  }
}

export function clearSavedGames(): void {
  try {
    localStorage.removeItem(KEY_GAMES);
  } catch {
    /* noop */
  }
}

export function appendSavedGame(game: SavedGame): void {
  const games = listSavedGames();
  games.unshift(game);
  if (games.length > MAX_GAMES) games.length = MAX_GAMES;
  try {
    localStorage.setItem(KEY_GAMES, JSON.stringify(games));
  } catch {
    /* noop */
  }
}

/** 累计一局到统计中 */
export function accumulateStats(game: SavedGame, playerSeat: Seat): Stats {
  const stats = loadStats();
  const playerIsLandlord = game.landlord === playerSeat;
  const playerWin =
    (game.result.winnerSide === 'landlord' && playerIsLandlord) ||
    (game.result.winnerSide === 'farmer' && !playerIsLandlord);

  stats.totalGames += 1;
  if (playerWin) stats.wins += 1; else stats.losses += 1;

  if (playerIsLandlord) {
    stats.asLandlordGames += 1;
    if (playerWin) stats.asLandlordWins += 1;
  } else {
    stats.asFarmerGames += 1;
    if (playerWin) stats.asFarmerWins += 1;
  }

  for (const m of game.history) {
    if (m.kind !== 'play') continue;
    if (m.type.kind === 'bomb') stats.bombs += 1;
    if (m.type.kind === 'rocket') stats.rockets += 1;
  }
  if (game.result.spring === 'spring') stats.springs += 1;
  if (game.result.spring === 'anti-spring') stats.antiSprings += 1;

  saveStats(stats);
  return stats;
}

/* ------------------------- 自定义残局 ------------------------- */

export function listCustomEndgames(): Endgame[] {
  try {
    const raw = localStorage.getItem(KEY_CUSTOM_ENDGAMES);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Endgame[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveCustomEndgame(eg: Endgame): void {
  const list = listCustomEndgames().filter(e => e.id !== eg.id);
  list.unshift(eg);
  if (list.length > MAX_CUSTOM_ENDGAMES) list.length = MAX_CUSTOM_ENDGAMES;
  try {
    localStorage.setItem(KEY_CUSTOM_ENDGAMES, JSON.stringify(list));
  } catch {
    /* noop */
  }
}

export function deleteCustomEndgame(id: string): void {
  const list = listCustomEndgames().filter(e => e.id !== id);
  try {
    localStorage.setItem(KEY_CUSTOM_ENDGAMES, JSON.stringify(list));
  } catch {
    /* noop */
  }
}
