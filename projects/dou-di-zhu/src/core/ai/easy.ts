import type { Card, GameState, Seat } from '../../types';
import { enumerateAll, enumerateBeats } from '../enumerate';

/**
 * 简单难度 AI。
 *
 * 特征：
 * - 不考虑队友配合，每次只看眼前一手
 * - 首出选最小 single / pair / triple，不主动拆顺子/连对
 * - 跟出时选最小可压制；除非剩 ≤ 2 张否则不出炸弹/王炸
 * - 叫分阈值更低（更愿当地主，但容易输）
 */
export function decideBidEasy(hand: Card[]): 0 | 1 | 2 | 3 {
  // 简单 AI 倾向叫 1 分，强牌叫 2 分，不会叫 3
  const counts = new Map<number, number>();
  for (const c of hand) counts.set(c.value, (counts.get(c.value) || 0) + 1);
  let big = 0;
  if ((counts.get(17) || 0) + (counts.get(18) || 0) >= 1) big += 2;
  for (const [v, c] of counts.entries()) {
    if (c === 4) big += 3;
    if (v === 16) big += c;
  }
  if (big >= 4) return 2;
  if (big >= 1) return 1;
  return 0;
}

export function decidePlayEasy(state: GameState, seat: Seat): Card[] | null {
  const hand = state.hands[seat];
  const isFirst = !state.lastPlay || state.lastPlay.by === seat;

  if (isFirst) {
    const all = enumerateAll(hand);
    // 优先单/对/三（不带），从小到大
    const simple = all.filter(p =>
      p.type.kind === 'single' || p.type.kind === 'pair' || p.type.kind === 'triple',
    );
    const pool = simple.length ? simple : all.filter(p => p.type.kind !== 'bomb' && p.type.kind !== 'rocket');
    const fallback = pool.length ? pool : all;
    fallback.sort((a, b) => a.type.key - b.type.key);
    return fallback[0].cards;
  }

  const beats = enumerateBeats(hand, state.lastPlay!.type);
  const nonBomb = beats.filter(b => b.type.kind !== 'bomb' && b.type.kind !== 'rocket');
  if (nonBomb.length > 0) {
    nonBomb.sort((a, b) => a.type.key - b.type.key);
    return nonBomb[0].cards;
  }
  // 残局才用炸弹
  if (hand.length <= 2 && beats.length > 0) return beats[0].cards;
  return null;
}
