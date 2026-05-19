import type { Card, CardType } from '../types';

/**
 * 识别给定一组牌（任意顺序）的牌型；不合法则返回 null。
 *
 * 注意：
 * - 顺子/连对/飞机均不能含 2(value=16) 与王(17/18)
 * - 飞机带牌：纯三张组数 N，则总长可为 3N(纯) / 4N(带单) / 5N(带对)
 * - 四带二：4 + 2 张单 / 4 + 2 张对
 */
export function identifyType(cards: Card[]): CardType | null {
  if (!cards || cards.length === 0) return null;
  const counts = countByValue(cards);
  const total = cards.length;

  // 王炸
  if (total === 2) {
    const vs = cards.map(c => c.value).sort((a, b) => a - b);
    if (vs[0] === 17 && vs[1] === 18) return { kind: 'rocket', key: 18, len: 1 };
  }

  // 单
  if (total === 1) return { kind: 'single', key: cards[0].value, len: 1 };

  // 同 value 张数
  const groups = groupByCount(counts);

  // 对
  if (total === 2 && groups[2].length === 1) {
    return { kind: 'pair', key: groups[2][0], len: 1 };
  }

  // 炸弹
  if (total === 4 && groups[4].length === 1) {
    return { kind: 'bomb', key: groups[4][0], len: 1 };
  }

  // 三张 / 三带一 / 三带二
  if (groups[3].length === 1 && groups[4].length === 0) {
    const tripleVal = groups[3][0];
    if (total === 3) return { kind: 'triple', key: tripleVal, len: 1 };
    if (total === 4 && groups[1].length === 1) {
      return { kind: 'triple-single', key: tripleVal, len: 1 };
    }
    if (total === 5 && groups[2].length === 1) {
      return { kind: 'triple-pair', key: tripleVal, len: 1 };
    }
  }

  // 顺子
  if (total >= 5 && groups[1].length === total) {
    if (isConsecutive(groups[1])) {
      return { kind: 'straight', key: Math.min(...groups[1]), len: total };
    }
  }

  // 连对
  if (total >= 6 && total % 2 === 0 && groups[2].length === total / 2 && groups[1].length === 0 && groups[3].length === 0 && groups[4].length === 0) {
    if (isConsecutive(groups[2])) {
      return { kind: 'pair-straight', key: Math.min(...groups[2]), len: total / 2 };
    }
  }

  // 飞机（纯/带单/带对）
  if (groups[3].length >= 2 && isConsecutive(groups[3]) && noTwoOrJoker(groups[3])) {
    const n = groups[3].length;
    const minTriple = Math.min(...groups[3]);
    // 纯飞机
    if (total === 3 * n) {
      return { kind: 'plane', key: minTriple, len: n };
    }
    // 飞机带单：n 张单（不能含与三张相同的牌；炸弹拆开来当单牌也允许，但更严格地不允许含王炸/4 的整体作为带牌）
    if (total === 4 * n && groups[1].length + groups[2].length * 2 === n) {
      // 允许带 1 + 2 拆？标准玩法只允许全单 -> n 张单；这里要求严格 n 个单。
      if (groups[1].length === n && groups[4].length === 0) {
        return { kind: 'plane-single', key: minTriple, len: n };
      }
    }
    // 飞机带对：n 对
    if (total === 5 * n && groups[2].length === n && groups[1].length === 0 && groups[4].length === 0) {
      return { kind: 'plane-pair', key: minTriple, len: n };
    }
  }

  // 四带二（单）：1×4 + 2×1
  if (total === 6 && groups[4].length === 1 && groups[1].length === 2 && groups[2].length === 0 && groups[3].length === 0) {
    return { kind: 'four-two-single', key: groups[4][0], len: 1 };
  }
  // 四带二（对）：1×4 + 2×2
  if (total === 8 && groups[4].length === 1 && groups[2].length === 2 && groups[1].length === 0 && groups[3].length === 0) {
    return { kind: 'four-two-pair', key: groups[4][0], len: 1 };
  }

  return null;
}

/** value -> count */
export function countByValue(cards: Card[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const c of cards) m.set(c.value, (m.get(c.value) || 0) + 1);
  return m;
}

/** 按计数分组：{1:[v..],2:[v..],3:[v..],4:[v..]} */
function groupByCount(counts: Map<number, number>): Record<1 | 2 | 3 | 4, number[]> {
  const out: Record<1 | 2 | 3 | 4, number[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const [v, c] of counts.entries()) {
    if (c >= 1 && c <= 4) out[c as 1 | 2 | 3 | 4].push(v);
  }
  for (const k of [1, 2, 3, 4] as const) out[k].sort((a, b) => a - b);
  return out;
}

/** 数列是否连续递增 1，且全部 < 16（不能含 2/王） */
function isConsecutive(values: number[]): boolean {
  if (values.length === 0) return false;
  const sorted = values.slice().sort((a, b) => a - b);
  if (sorted[sorted.length - 1] >= 16) return false;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1] + 1) return false;
  }
  return true;
}

function noTwoOrJoker(values: number[]): boolean {
  return values.every(v => v < 16);
}
