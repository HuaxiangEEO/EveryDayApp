import type { Card, Rank, Seat, Suit } from '../types';
import { sortHand } from './deck';

/**
 * 预设残局：玩家承担"翻盘"任务，需要在不利局面下找到最优出牌路径。
 *
 * 残局以"每家剩余的 (suit, rank) 列表"形式表示，跳过发牌、叫分阶段，
 * 直接进入 playing。地主明确指定。
 */

export interface Endgame {
  id: string;
  title: string;
  description: string;
  /** 玩家身份；其余两家自动设为对立方 */
  playerRole: 'landlord' | 'farmer';
  /** 三家的剩余手牌 */
  hands: [Spec[], Spec[], Spec[]];
  landlord: Seat;
  /** 谁先出（默认 landlord） */
  startTurn?: Seat;
  basePoint: number;
}

interface Spec {
  suit: Suit;
  rank: Rank;
}

const VALUE: Record<Rank, number> = {
  '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 16, 'BJ': 17, 'RJ': 18,
};

let counter = 0;
function specToCard(s: Spec): Card {
  counter += 1;
  return {
    id: `${s.suit}${s.rank}-${counter}`,
    suit: s.suit,
    rank: s.rank,
    value: VALUE[s.rank],
  };
}

export function buildHands(endgame: Endgame): [Card[], Card[], Card[]] {
  return [
    sortHand(endgame.hands[0].map(specToCard)),
    sortHand(endgame.hands[1].map(specToCard)),
    sortHand(endgame.hands[2].map(specToCard)),
  ];
}

/* ------------------------- 预设残局集 ------------------------- */

export const ENDGAMES: Endgame[] = [
  {
    id: 'farmer-rocket',
    title: '王炸翻盘',
    description: '你（农民）手中藏着王炸，地主仅剩一手大牌——把握节奏抓住时机！',
    playerRole: 'farmer',
    hands: [
      [
        { suit: 'JOKER', rank: 'BJ' },
        { suit: 'JOKER', rank: 'RJ' },
        { suit: '♠', rank: '5' },
        { suit: '♥', rank: '5' },
        { suit: '♣', rank: '7' },
      ],
      [
        { suit: '♠', rank: '2' },
        { suit: '♥', rank: '2' },
        { suit: '♦', rank: 'A' },
      ],
      [
        { suit: '♣', rank: '8' },
        { suit: '♦', rank: '9' },
        { suit: '♠', rank: '10' },
      ],
    ],
    landlord: 1,
    startTurn: 1,
    basePoint: 2,
  },
  {
    id: 'landlord-bomb',
    title: '地主炸弹收尾',
    description: '你（地主）有一手炸弹和顺子，规划好顺序，一举走完！',
    playerRole: 'landlord',
    hands: [
      [
        { suit: '♠', rank: '7' }, { suit: '♥', rank: '7' },
        { suit: '♦', rank: '7' }, { suit: '♣', rank: '7' },
        { suit: '♠', rank: '3' },
        { suit: '♥', rank: '4' },
        { suit: '♦', rank: '5' },
        { suit: '♣', rank: '6' },
        { suit: '♠', rank: '8' },
      ],
      [
        { suit: '♠', rank: 'K' }, { suit: '♥', rank: 'K' },
        { suit: '♦', rank: 'A' },
        { suit: '♣', rank: '10' },
        { suit: '♠', rank: 'J' },
      ],
      [
        { suit: '♣', rank: '2' },
        { suit: '♦', rank: 'Q' },
        { suit: '♠', rank: '9' },
        { suit: '♥', rank: '6' },
      ],
    ],
    landlord: 0,
    startTurn: 0,
    basePoint: 3,
  },
  {
    id: 'farmer-coop',
    title: '农民协作',
    description: '你（农民）需要配合左家先把地主压制住，再走净自己的牌。',
    playerRole: 'farmer',
    hands: [
      [
        { suit: '♠', rank: 'A' }, { suit: '♥', rank: 'A' },
        { suit: '♣', rank: '6' }, { suit: '♦', rank: '6' },
        { suit: '♠', rank: '3' },
      ],
      [
        { suit: '♠', rank: '2' },
        { suit: '♥', rank: 'K' },
        { suit: '♦', rank: '10' },
        { suit: '♣', rank: '9' },
      ],
      [
        { suit: 'JOKER', rank: 'RJ' },
        { suit: '♠', rank: 'Q' },
        { suit: '♥', rank: 'J' },
        { suit: '♦', rank: '8' },
      ],
    ],
    landlord: 1,
    startTurn: 1,
    basePoint: 2,
  },
];
