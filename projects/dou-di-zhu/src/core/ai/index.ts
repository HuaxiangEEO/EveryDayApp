import type { Card, GameState, Seat } from '../../types';
import { decideBidEasy, decidePlayEasy } from './easy';
import { decideBid as decideBidNormalRaw, decidePlay as decidePlayNormal } from './normal';
import { decideBidHard, decidePlayHard } from './hard';

export type Difficulty = 'easy' | 'normal' | 'hard';

export function decideBid(
  difficulty: Difficulty,
  hand: Card[],
  currentBid: number,
): 0 | 1 | 2 | 3 {
  switch (difficulty) {
    case 'easy': {
      const want = decideBidEasy(hand);
      return want > currentBid ? want : 0;
    }
    case 'hard': {
      const want = decideBidHard(hand);
      return want > currentBid ? want : 0;
    }
    case 'normal':
    default:
      return decideBidNormalRaw(hand, currentBid);
  }
}

export function decidePlay(
  difficulty: Difficulty,
  state: GameState,
  seat: Seat,
): Card[] | null {
  switch (difficulty) {
    case 'easy':
      return decidePlayEasy(state, seat);
    case 'hard':
      return decidePlayHard(state, seat);
    case 'normal':
    default:
      return decidePlayNormal(state, seat);
  }
}
