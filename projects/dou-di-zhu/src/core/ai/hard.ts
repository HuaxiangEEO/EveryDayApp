import type { Card, GameState, Seat } from '../../types';
import { enumerateAll, enumerateBeats, type PlayCandidate } from '../enumerate';
import { removeCards } from '../deck';
import { applyPass, applyPlay, fromGameState, type SimState } from '../simulate';

/**
 * 困难难度 AI：在普通策略基础上引入"出净所需手数"作为价值评估。
 *
 * 思路：
 *   value(hand) = -minHands(hand)  // 出净需要的手数越少越好
 * 出牌时挑选执行后 value 最高的一手；跟出时同理，并加上"是否合作队友"约束。
 *
 * minHands 估算用贪心：先一次性甩"飞机/连对/顺子/三带"再甩单/对，复杂度可控。
 */

export function decideBidHard(hand: Card[]): 0 | 1 | 2 | 3 {
  const handsNeeded = estimateMinHands(hand);
  const big = countBig(hand);
  if (handsNeeded <= 5 && big >= 5) return 3;
  if (handsNeeded <= 6 && big >= 3) return 2;
  if (handsNeeded <= 8) return 1;
  return 0;
}

export function decidePlayHard(state: GameState, seat: Seat): Card[] | null {
  const ranked = rankCandidates(state, seat);
  return ranked.length > 0 ? ranked[0].cards : null;
}

/**
 * 给出当前 seat 在 state 下的候选出法排序（最优在前）。
 *
 * 评估：执行候选 → 模拟下两家用"最小可压制启发"响应一轮 → 比较自己/对手剩余出净手数。
 * 这种"前瞻一步"足以让 hard AI 表现明显优于 normal。
 */
export function rankCandidates(state: GameState, seat: Seat): PlayCandidate[] {
  const hand = state.hands[seat];
  const lastPlay = state.lastPlay;
  const isFirst = !lastPlay || lastPlay.by === seat;
  const landlord = state.landlord;
  const isMyTeammate =
    landlord !== null && lastPlay !== null && seat !== landlord && lastPlay.by !== landlord;

  const rawCandidates = isFirst
    ? enumerateAll(hand).filter(p => hand.length <= p.cards.length || (p.type.kind !== 'bomb' && p.type.kind !== 'rocket'))
    : enumerateBeats(hand, lastPlay!.type);

  if (rawCandidates.length === 0) return [];

  if (!isFirst && isMyTeammate) {
    const teammateLeft = state.hands[lastPlay!.by].length;
    const isPrevBig = lastPlay!.type.key >= 14 || lastPlay!.type.kind === 'bomb' || lastPlay!.type.kind === 'rocket';
    if (isPrevBig && teammateLeft > 2) return [];
  }

  const sim0 = fromGameState(state);
  const scored = rawCandidates.map(p => {
    const remain = removeCards(hand, p.cards);
    const localScore = estimateMinHands(remain);
    const finishBonus = remain.length === 0 ? -100 : 0;
    const bombPenalty = (p.type.kind === 'bomb' || p.type.kind === 'rocket') && hand.length > 4 ? 6 : 0;
    let lookahead = 0;
    if (sim0) {
      const sim1 = applyPlay(sim0, seat, p.cards, p.type);
      lookahead = sim1.finished ? -200 : evaluateAfterOpponentTurn(sim1, seat);
    }
    return {
      p,
      score: localScore + bombPenalty + finishBonus + p.type.key * 0.05 + lookahead * 0.5,
    };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored.map(s => s.p);
}

/**
 * 模拟当前 sim 之后两家依次响应一轮（最小可压制 / 否则 pass），返回评估值：
 *   self 剩余手数 - 对手最小手数（越小越好）
 */
function evaluateAfterOpponentTurn(sim: SimState, self: Seat): number {
  let curr = sim;
  for (let i = 0; i < 2; i++) {
    if (curr.finished) break;
    const turn = curr.currentTurn;
    if (turn === self) break;
    if (curr.lastPlay && curr.lastPlay.by !== turn) {
      const beats = enumerateBeats(curr.hands[turn], curr.lastPlay.type);
      const noBomb = beats.filter(b => b.type.kind !== 'bomb' && b.type.kind !== 'rocket');
      const choice = noBomb.length ? noBomb.sort((a, b) => a.type.key - b.type.key)[0] : null;
      if (choice) {
        curr = applyPlay(curr, turn, choice.cards, choice.type);
        continue;
      }
      curr = applyPass(curr, turn);
    } else {
      // 当前 turn 是首出
      const all = enumerateAll(curr.hands[turn])
        .filter(p => p.type.kind !== 'bomb' && p.type.kind !== 'rocket')
        .sort((a, b) => a.type.key - b.type.key);
      if (all.length === 0) break;
      curr = applyPlay(curr, turn, all[0].cards, all[0].type);
    }
  }
  if (curr.finished && curr.winner !== null) {
    const winnerIsLandlord = curr.winner === curr.landlord;
    const selfIsLandlord = self === curr.landlord;
    return winnerIsLandlord === selfIsLandlord ? -50 : 50;
  }
  const selfHands = estimateMinHands(curr.hands[self]);
  const oppoSeats = ([0, 1, 2] as Seat[]).filter(s => s !== self);
  const selfIsLandlord = self === curr.landlord;
  const oppoHands = selfIsLandlord
    ? Math.min(...oppoSeats.map(s => estimateMinHands(curr.hands[s])))
    : estimateMinHands(curr.hands[curr.landlord]);
  return selfHands - oppoHands;
}

/** 大牌数（王、2、四张） */
function countBig(hand: Card[]): number {
  const counts = new Map<number, number>();
  for (const c of hand) counts.set(c.value, (counts.get(c.value) || 0) + 1);
  let s = 0;
  if ((counts.get(17) || 0) >= 1) s += 1;
  if ((counts.get(18) || 0) >= 1) s += 2;
  for (const [v, c] of counts.entries()) {
    if (c === 4) s += 3;
    if (v === 16) s += c;
  }
  return s;
}

/**
 * 估算出净一手手牌所需的最少手数（贪心）：
 * 1) 优先一次甩飞机带牌、连对、顺子（走最长）
 * 2) 然后剥离 三带二/三带一/三张
 * 3) 最后剩余按对/单各 1 手计
 *
 * 不保证最优，但启发式足以驱动 hard AI 评估。
 */
export function estimateMinHands(hand: Card[]): number {
  const counts = new Map<number, number>();
  for (const c of hand) counts.set(c.value, (counts.get(c.value) || 0) + 1);

  let hands = 0;
  // 王炸
  if ((counts.get(17) || 0) >= 1 && (counts.get(18) || 0) >= 1) {
    counts.set(17, (counts.get(17) || 0) - 1);
    counts.set(18, (counts.get(18) || 0) - 1);
    hands += 1;
  }
  for (const [v] of [...counts]) {
    while ((counts.get(v) || 0) === 4) {
      counts.set(v, 0);
      hands += 1;
    }
  }
  // 顺子（贪心地从最长开始）
  hands += greedySequence(counts, 5, 1, 12);
  // 连对
  hands += greedySequence(counts, 3, 2, 10);
  // 飞机（先取连续三张计数）
  hands += greedyTriplePlane(counts);
  for (const [v] of [...counts]) {
    if ((counts.get(v) || 0) >= 3) {
      counts.set(v, (counts.get(v) || 0) - 3);
      hands += 1;
    }
  }
  for (const [v] of [...counts]) {
    while ((counts.get(v) || 0) >= 2 && v < 17) {
      counts.set(v, (counts.get(v) || 0) - 2);
      hands += 1;
    }
  }
  for (const [, c] of counts) hands += c;
  return hands;
}

/** 通用：在 counts 中寻找连续 ≥ minLen 的同张数序列（每位至少 perValue 张），消耗后 hands+=1 */
function greedySequence(counts: Map<number, number>, minLen: number, perValue: number, maxLen: number): number {
  let hands = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let bestStart = -1;
    let bestLen = 0;
    for (let start = 3; start <= 14; start++) {
      let len = 0;
      for (let v = start; v <= 14 && len < maxLen; v++) {
        if ((counts.get(v) || 0) < perValue) break;
        len += 1;
      }
      if (len >= minLen && len > bestLen) {
        bestStart = start;
        bestLen = len;
      }
    }
    if (bestLen === 0) break;
    for (let v = bestStart; v < bestStart + bestLen; v++) {
      counts.set(v, (counts.get(v) || 0) - perValue);
    }
    hands += 1;
  }
  return hands;
}

/** 飞机：连续 ≥2 个三张 */
function greedyTriplePlane(counts: Map<number, number>): number {
  let hands = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let bestStart = -1;
    let bestLen = 0;
    for (let start = 3; start <= 14; start++) {
      let len = 0;
      for (let v = start; v <= 14; v++) {
        if ((counts.get(v) || 0) < 3) break;
        len += 1;
      }
      if (len >= 2 && len > bestLen) {
        bestStart = start;
        bestLen = len;
      }
    }
    if (bestLen === 0) break;
    for (let v = bestStart; v < bestStart + bestLen; v++) {
      counts.set(v, (counts.get(v) || 0) - 3);
    }
    hands += 1;
  }
  return hands;
}
