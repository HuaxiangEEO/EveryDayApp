import type { Card, CardType, GameState, Seat } from '../../types';
import { enumerateAll, enumerateBeats, type PlayCandidate } from '../enumerate';

/**
 * 普通难度 AI 决策。
 *
 * 核心思想：
 * 1) 首出（lastPlay 为 null）：选"剩牌评估最好"的一手
 *    - 评估：剩余牌的"出净所需手数"越少越优
 *    - 优先出长牌型（顺子/连对/飞机），不主动拆 2/王/炸弹
 * 2) 跟出（lastPlay 不为 null）：
 *    - 队友（农民同盟）刚出大牌时，倾向不要
 *    - 否则选刚好压过的最小一手
 *    - 残局（手牌 ≤ 4）允许动用炸弹/王炸
 */

/** AI 是否"叫分"，返回 0/1/2/3 */
export function decideBid(hand: Card[], currentBid: number): 0 | 1 | 2 | 3 {
  const score = evaluateHandStrength(hand);
  // 阈值：经验值，可调
  let want: 0 | 1 | 2 | 3 = 0;
  if (score >= 11) want = 3;
  else if (score >= 8) want = 2;
  else if (score >= 5) want = 1;

  if (want > currentBid) return want;
  return 0;
}

/** 手牌强度评估（用于叫分；越大越强） */
export function evaluateHandStrength(hand: Card[]): number {
  let s = 0;
  const counts = new Map<number, number>();
  for (const c of hand) counts.set(c.value, (counts.get(c.value) || 0) + 1);

  if ((counts.get(17) || 0) >= 1) s += 3;
  if ((counts.get(18) || 0) >= 1) s += 4;
  if ((counts.get(17) || 0) >= 1 && (counts.get(18) || 0) >= 1) s += 4; // 王炸额外

  for (const [v, c] of counts.entries()) {
    if (c === 4) s += 6;
    if (v === 16) s += c === 1 ? 1.5 : c * 1.5;
    if (v === 14 && c >= 1) s += 1; // A 单
  }
  return s;
}

/**
 * 决定一次出牌：返回要出的牌；返回 null 表示不要（pass）。
 * 注意：首出时不允许返回 null。
 */
export function decidePlay(state: GameState, seat: Seat): Card[] | null {
  const hand = state.hands[seat];
  const lastPlay = state.lastPlay;
  const isFirst = lastPlay === null || lastPlay.by === seat;

  if (isFirst) {
    return chooseLead(hand);
  }
  return chooseFollow(hand, state, seat, lastPlay!.type, lastPlay!.by);
}

/** 首出选择 */
function chooseLead(hand: Card[]): Card[] {
  const all = enumerateAll(hand);
  // 过滤：不主动出炸弹/王炸（除非手牌只剩它）
  const usable = all.filter(p => {
    if (hand.length <= p.cards.length) return true; // 一把出完
    return p.type.kind !== 'bomb' && p.type.kind !== 'rocket';
  });
  const pool = usable.length ? usable : all;

  // 计分：优先长牌型 / 优先小牌
  const scored = pool.map(p => ({
    p,
    score: scoreLead(p, hand),
  }));
  scored.sort((a, b) => b.score - a.score);

  // 残局优化：如果手牌很少，挑能直接走完的
  if (hand.length <= 6) {
    const finisher = scored.find(s => s.p.cards.length === hand.length);
    if (finisher) return finisher.p.cards;
  }

  return scored[0].p.cards;
}

/** 跟出选择 */
function chooseFollow(
  hand: Card[],
  state: GameState,
  seat: Seat,
  prev: CardType,
  prevBy: Seat,
): Card[] | null {
  const beats = enumerateBeats(hand, prev);

  // 队友判断：地主之外的两家是同盟
  const landlord = state.landlord;
  const isMyTeammate = landlord !== null && seat !== landlord && prevBy !== landlord;

  // 队友刚刚出了能赢的大牌，且自己不是必须接手的情境，则不要
  if (isMyTeammate) {
    // 上家手牌很少（≤ 2）时帮忙顶一下
    const teammateLeft = state.hands[prevBy].length;
    const isPrevBig = prev.key >= 14 || prev.kind === 'bomb' || prev.kind === 'rocket';
    if (isPrevBig && teammateLeft > 2) return null;
  }

  // 非队友：尽量拆最小一手压过
  const nonBomb = beats.filter(b => b.type.kind !== 'bomb' && b.type.kind !== 'rocket');
  if (nonBomb.length > 0) {
    // 取 key 最小的一手；为减少拆牌损失，优先拆零散单/对
    nonBomb.sort((a, b) => scoreFollow(a) - scoreFollow(b));
    return nonBomb[0].cards;
  }

  // 残局或对手即将赢：动用炸弹/王炸
  const oppMin = minOpponentLeft(state, seat);
  const myLeft = hand.length;
  const desperate = oppMin <= 2 || myLeft <= 4;
  if (desperate && beats.length > 0) {
    return beats[0].cards;
  }

  // 农民地位 + 上家是地主出大牌 → 也允许炸
  if (landlord !== null && seat !== landlord && prevBy === landlord) {
    if (prev.key >= 14 && beats.length > 0) {
      return beats[0].cards;
    }
  }

  return null;
}

/** 首出评分：值越大越优先 */
function scoreLead(p: PlayCandidate, hand: Card[]): number {
  const k = p.type.kind;
  let s = 0;
  // 优先长组合，可一次甩多张
  s += p.cards.length * 2;
  // 优先小牌（避免浪费大牌）
  s -= p.type.key;
  // 顺子/连对/飞机优先
  if (k === 'straight' || k === 'pair-straight' || k === 'plane' || k === 'plane-single' || k === 'plane-pair') s += 8;
  // 三带一 / 三带二 优于裸三
  if (k === 'triple-single' || k === 'triple-pair') s += 4;
  // 不要主动拆 2/王
  if (p.type.key >= 16) s -= 10;
  if (k === 'bomb') s -= 30;
  if (k === 'rocket') s -= 50;
  // 牌少时尽量减少剩余手数
  if (hand.length <= 8) s += 3;
  return s;
}

/** 跟出评分：值越小越优先（更廉价） */
function scoreFollow(p: PlayCandidate): number {
  // 单/对 优先；尽量小 key
  let s = p.type.key;
  if (p.type.kind === 'single') s -= 5;
  if (p.type.kind === 'pair') s -= 3;
  return s;
}

function minOpponentLeft(state: GameState, mySeat: Seat): number {
  let m = Infinity;
  for (let i = 0; i < 3; i++) if (i !== mySeat) m = Math.min(m, state.hands[i].length);
  return m;
}
