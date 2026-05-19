import type { Card, CardType, GameState, Seat } from '../types';
import { removeCards } from './deck';

/**
 * 轻量级状态推进，用于 AI 前瞻模拟。
 *
 * 注意：仅复制需要的字段，不会触发 React 渲染；
 * 也不写 history（hard AI 评估时不需要）。
 */
export interface SimState {
  hands: [Card[], Card[], Card[]];
  currentTurn: Seat;
  lastPlay: { by: Seat; type: CardType } | null;
  passes: number;
  landlord: Seat;
  finished: boolean;
  /** 谁出完了牌 */
  winner: Seat | null;
}

export function fromGameState(s: GameState): SimState | null {
  if (s.landlord === null || s.phase !== 'playing') return null;
  return {
    hands: [s.hands[0].slice(), s.hands[1].slice(), s.hands[2].slice()],
    currentTurn: s.currentTurn,
    lastPlay: s.lastPlay ? { by: s.lastPlay.by, type: s.lastPlay.type } : null,
    passes: s.passes,
    landlord: s.landlord,
    finished: false,
    winner: null,
  };
}

export function applyPlay(sim: SimState, by: Seat, cards: Card[], type: CardType): SimState {
  const hands: [Card[], Card[], Card[]] = [
    sim.hands[0].slice(),
    sim.hands[1].slice(),
    sim.hands[2].slice(),
  ];
  hands[by] = removeCards(hands[by], cards);
  const finished = hands[by].length === 0;
  return {
    ...sim,
    hands,
    currentTurn: ((by + 1) % 3) as Seat,
    lastPlay: { by, type },
    passes: 0,
    finished,
    winner: finished ? by : null,
  };
}

export function applyPass(sim: SimState, by: Seat): SimState {
  const passes = sim.passes + 1;
  if (passes >= 2) {
    return {
      ...sim,
      lastPlay: null,
      passes: 0,
      currentTurn: ((by + 1) % 3) as Seat,
    };
  }
  return {
    ...sim,
    passes,
    currentTurn: ((by + 1) % 3) as Seat,
  };
}

/** 把 SimState 包成 GameState 的最小子集供 normal/hard 决策使用 */
export function toGameStateLike(sim: SimState): Pick<
  GameState,
  'hands' | 'currentTurn' | 'lastPlay' | 'landlord' | 'players'
> {
  return {
    hands: sim.hands,
    currentTurn: sim.currentTurn,
    lastPlay: sim.lastPlay
      ? { by: sim.lastPlay.by, cards: [], type: sim.lastPlay.type }
      : null,
    landlord: sim.landlord,
    players: [
      { seat: 0, name: 'p0', isAI: true, role: sim.landlord === 0 ? 'landlord' : 'farmer' },
      { seat: 1, name: 'p1', isAI: true, role: sim.landlord === 1 ? 'landlord' : 'farmer' },
      { seat: 2, name: 'p2', isAI: true, role: sim.landlord === 2 ? 'landlord' : 'farmer' },
    ],
  };
}
