import type { Card, Rank, Suit } from '../types';

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];

/** rank → value 映射 */
const RANK_VALUE: Record<Rank, number> = {
  '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 16,
  'BJ': 17, 'RJ': 18,
};

const NUMBER_RANKS: Rank[] = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

export function rankToValue(rank: Rank): number {
  return RANK_VALUE[rank];
}

/** 构建 54 张完整牌组（未洗牌） */
export function buildDeck(): Card[] {
  const cards: Card[] = [];
  for (const rank of NUMBER_RANKS) {
    for (const suit of SUITS) {
      cards.push({
        id: `${suit}${rank}`,
        suit,
        rank,
        value: RANK_VALUE[rank],
      });
    }
  }
  cards.push({ id: 'JOKER-BJ', suit: 'JOKER', rank: 'BJ', value: 17 });
  cards.push({ id: 'JOKER-RJ', suit: 'JOKER', rank: 'RJ', value: 18 });
  return cards;
}

/** Fisher–Yates 洗牌（不修改入参） */
export function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * 发牌：每家 17 张，剩余 3 张为底牌。
 * 返回 [hand0, hand1, hand2, bottom]，每份均按 value 升序排列。
 */
export function deal(rng: () => number = Math.random): [Card[], Card[], Card[], Card[]] {
  const deck = shuffle(buildDeck(), rng);
  const h0 = sortHand(deck.slice(0, 17));
  const h1 = sortHand(deck.slice(17, 34));
  const h2 = sortHand(deck.slice(34, 51));
  const bottom = sortHand(deck.slice(51, 54));
  return [h0, h1, h2, bottom];
}

/** 升序排序：value 升序，相同 value 时按花色稳定 */
export function sortHand(cards: Card[]): Card[] {
  return cards.slice().sort((a, b) => {
    if (a.value !== b.value) return a.value - b.value;
    return a.id.localeCompare(b.id);
  });
}

/** 从手牌中移除给定的牌（按 id） */
export function removeCards(hand: Card[], cards: Card[]): Card[] {
  const ids = new Set(cards.map(c => c.id));
  return hand.filter(c => !ids.has(c.id));
}
