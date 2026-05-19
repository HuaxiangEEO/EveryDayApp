import type { Card, GameResult, Move, Seat } from '../types';
import { removeCards } from '../core/deck';

/**
 * 根据初始手牌 + 完整 history，重放出"第 step 步执行后"的中间状态。
 * 用于复盘视图渲染：手牌剩余、谁刚出牌、当前桌面 lastPlay。
 */
export interface ReplayFrame {
  hands: [Card[], Card[], Card[]];
  /** 第 step-1 步动作（即"刚刚发生的"），可能为空（step=0 时） */
  lastMove: Move | null;
  /** 当前桌面有效出牌（被两次 pass 后清空） */
  lastPlayMove: Extract<Move, { kind: 'play' }> | null;
  /** 下一步轮到谁（即 step 步还未执行的执行者） */
  currentTurn: Seat;
  /** 是否已结束 */
  ended: boolean;
}

export function buildFrame(
  initialHands: [Card[], Card[], Card[]],
  history: Move[],
  landlord: Seat,
  step: number,
): ReplayFrame {
  const hands: [Card[], Card[], Card[]] = [
    initialHands[0].slice(),
    initialHands[1].slice(),
    initialHands[2].slice(),
  ];
  let currentTurn: Seat = landlord;
  let lastPlayMove: Extract<Move, { kind: 'play' }> | null = null;
  let passes = 0;

  for (let i = 0; i < step && i < history.length; i++) {
    const m = history[i];
    if (m.kind === 'play') {
      hands[m.by] = removeCards(hands[m.by], m.cards);
      lastPlayMove = m;
      passes = 0;
    } else {
      passes += 1;
      if (passes >= 2) {
        lastPlayMove = null;
        passes = 0;
      }
    }
    currentTurn = ((m.by + 1) % 3) as Seat;
  }

  const ended = hands.some(h => h.length === 0);
  const lastMove = step > 0 ? history[step - 1] : null;
  return { hands, lastMove, lastPlayMove, currentTurn, ended };
}

export interface ReplaySummary {
  totalSteps: number;
  result: GameResult;
}
