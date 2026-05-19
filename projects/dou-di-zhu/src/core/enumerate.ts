import type { Card, CardType } from '../types';
import { countByValue } from './cardType';

/**
 * 枚举一手手牌中的所有合法出法。
 *
 * 实现要点：
 * - 主体牌（三张/四张）会预先标记为"已用"，带牌从剩余卡中取
 * - 出于性能考虑，带牌只生成"带最小若干张"的代表组合，避免组合爆炸
 *   这对 AI 决策足够（AI 只关心是否存在某种压制方式）。
 */

export interface PlayCandidate {
  cards: Card[];
  type: CardType;
}

/** 按 value 分组：value -> Card[]（同 value 内按 id 升序稳定） */
function bucketize(hand: Card[]): Map<number, Card[]> {
  const m = new Map<number, Card[]>();
  for (const c of hand) {
    if (!m.has(c.value)) m.set(c.value, []);
    m.get(c.value)!.push(c);
  }
  for (const v of m.keys()) m.get(v)!.sort((a, b) => a.id.localeCompare(b.id));
  return m;
}

/** 从 buckets 中取 v 点 n 张，跳过 used；返回空数组表示数量不足 */
function take(buckets: Map<number, Card[]>, v: number, n: number, used: Set<string>): Card[] {
  const arr = buckets.get(v);
  if (!arr) return [];
  const out: Card[] = [];
  for (const c of arr) {
    if (used.has(c.id)) continue;
    out.push(c);
    if (out.length === n) return out;
  }
  return [];
}

/** 取 v 点 n 张（不考虑 used） */
function pick(buckets: Map<number, Card[]>, v: number, n: number): Card[] {
  const arr = buckets.get(v);
  if (!arr || arr.length < n) return [];
  return arr.slice(0, n);
}

/** 枚举所有牌型的所有合法出法 */
export function enumerateAll(hand: Card[]): PlayCandidate[] {
  const out: PlayCandidate[] = [];
  const buckets = bucketize(hand);
  const counts = countByValue(hand);
  const values = Array.from(counts.keys()).sort((a, b) => a - b);

  // 单
  for (const v of values) {
    out.push({ cards: pick(buckets, v, 1), type: { kind: 'single', key: v, len: 1 } });
  }
  // 对
  for (const v of values) {
    if ((counts.get(v) || 0) >= 2 && v < 17) {
      out.push({ cards: pick(buckets, v, 2), type: { kind: 'pair', key: v, len: 1 } });
    }
  }
  // 三 / 三带一 / 三带二
  for (const v of values) {
    if ((counts.get(v) || 0) >= 3) {
      const tri = pick(buckets, v, 3);
      out.push({ cards: tri, type: { kind: 'triple', key: v, len: 1 } });
      const used = new Set(tri.map(c => c.id));

      // 三带一：从其他 value 取 1 张（优先小）
      for (const v2 of values) {
        if (v2 === v) continue;
        const k = take(buckets, v2, 1, used);
        if (k.length === 1) {
          out.push({
            cards: [...tri, ...k],
            type: { kind: 'triple-single', key: v, len: 1 },
          });
          break; // 仅产生一个代表组合
        }
      }
      // 三带二
      for (const v2 of values) {
        if (v2 === v || v2 >= 17) continue;
        const k = take(buckets, v2, 2, used);
        if (k.length === 2) {
          out.push({
            cards: [...tri, ...k],
            type: { kind: 'triple-pair', key: v, len: 1 },
          });
          break;
        }
      }
    }
  }

  // 顺子（5..12 连续，全部 < 16）
  for (let len = 5; len <= 12; len++) {
    outer: for (let start = 3; start + len - 1 <= 14; start++) {
      const seq: number[] = [];
      for (let v = start; v < start + len; v++) {
        if ((counts.get(v) || 0) < 1) continue outer;
        seq.push(v);
      }
      const cards = seq.flatMap(v => pick(buckets, v, 1));
      out.push({ cards, type: { kind: 'straight', key: start, len } });
    }
  }

  // 连对（≥3 对，全部 < 16）
  for (let len = 3; len <= 10; len++) {
    outer: for (let start = 3; start + len - 1 <= 14; start++) {
      const seq: number[] = [];
      for (let v = start; v < start + len; v++) {
        if ((counts.get(v) || 0) < 2) continue outer;
        seq.push(v);
      }
      const cards = seq.flatMap(v => pick(buckets, v, 2));
      out.push({ cards, type: { kind: 'pair-straight', key: start, len } });
    }
  }

  // 飞机（连续 ≥2 个三张，全部 < 16），含带牌
  for (let n = 2; n <= 6; n++) {
    outer: for (let start = 3; start + n - 1 <= 14; start++) {
      const triValues: number[] = [];
      for (let v = start; v < start + n; v++) {
        if ((counts.get(v) || 0) < 3) continue outer;
        triValues.push(v);
      }
      const triCards = triValues.flatMap(v => pick(buckets, v, 3));
      out.push({ cards: triCards, type: { kind: 'plane', key: start, len: n } });

      const used = new Set(triCards.map(c => c.id));

      // 带 n 张单
      const singles: Card[] = [];
      for (const v2 of values) {
        const k = take(buckets, v2, 1, used);
        if (k.length === 1) {
          singles.push(...k);
          k.forEach(c => used.add(c.id));
          if (singles.length === n) break;
        }
      }
      if (singles.length === n) {
        out.push({
          cards: [...triCards, ...singles],
          type: { kind: 'plane-single', key: start, len: n },
        });
      }

      // 带 n 对（用新的 used 避免被单牌占用）
      const pairUsed = new Set(triCards.map(c => c.id));
      const pairs: Card[] = [];
      for (const v2 of values) {
        if (v2 >= 17) continue;
        const k = take(buckets, v2, 2, pairUsed);
        if (k.length === 2) {
          pairs.push(...k);
          k.forEach(c => pairUsed.add(c.id));
          if (pairs.length === 2 * n) break;
        }
      }
      if (pairs.length === 2 * n) {
        out.push({
          cards: [...triCards, ...pairs],
          type: { kind: 'plane-pair', key: start, len: n },
        });
      }
    }
  }

  // 四带二（单 / 对）+ 炸弹
  for (const v of values) {
    if ((counts.get(v) || 0) === 4) {
      const four = pick(buckets, v, 4);
      const used = new Set(four.map(c => c.id));

      // 四带二（单）：取两张不同 value 的单
      const singles: Card[] = [];
      for (const v2 of values) {
        if (v2 === v) continue;
        const k = take(buckets, v2, 1, used);
        if (k.length === 1) {
          singles.push(...k);
          k.forEach(c => used.add(c.id));
          if (singles.length === 2) break;
        }
      }
      if (singles.length === 2) {
        out.push({
          cards: [...four, ...singles],
          type: { kind: 'four-two-single', key: v, len: 1 },
        });
      }

      // 四带二（对）
      const pairUsed = new Set(four.map(c => c.id));
      const pairs: Card[] = [];
      for (const v2 of values) {
        if (v2 === v || v2 >= 17) continue;
        const k = take(buckets, v2, 2, pairUsed);
        if (k.length === 2) {
          pairs.push(...k);
          k.forEach(c => pairUsed.add(c.id));
          if (pairs.length === 4) break;
        }
      }
      if (pairs.length === 4) {
        out.push({
          cards: [...four, ...pairs],
          type: { kind: 'four-two-pair', key: v, len: 1 },
        });
      }

      // 炸弹本身
      out.push({ cards: four, type: { kind: 'bomb', key: v, len: 1 } });
    }
  }

  // 王炸
  if ((counts.get(17) || 0) >= 1 && (counts.get(18) || 0) >= 1) {
    const bj = pick(buckets, 17, 1);
    const rj = pick(buckets, 18, 1);
    out.push({ cards: [...bj, ...rj], type: { kind: 'rocket', key: 18, len: 1 } });
  }

  return out;
}

/** 枚举可压制 prev 的所有出法（含同型更大、炸弹、王炸） */
export function enumerateBeats(hand: Card[], prev: CardType): PlayCandidate[] {
  const all = enumerateAll(hand);
  return all.filter(p => {
    if (p.type.kind === 'rocket') return true;
    if (p.type.kind === 'bomb') {
      if (prev.kind !== 'bomb') return true;
      return p.type.key > prev.key;
    }
    if (prev.kind === 'rocket') return false;
    if (prev.kind === 'bomb') return false;
    return p.type.kind === prev.kind && p.type.len === prev.len && p.type.key > prev.key;
  });
}
