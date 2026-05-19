import { useEffect, useRef } from 'react';
import { useGame } from '../state/GameContext';
import { useSettings } from '../state/SettingsContext';
import { decideBid, decidePlay } from '../core/ai';

const AI_DELAY_MS = 700;

/**
 * 在 bidding/playing 阶段，若当前轮次是 AI，则延迟一段时间后自动决策。
 * AI 行为由 settings.difficulty 决定。
 */
export function useAITurn() {
  const { state, dispatch } = useGame();
  const { settings } = useSettings();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }

    if (state.phase === 'bidding') {
      const seat = state.bidTurn;
      const player = state.players[seat];
      if (player.isAI) {
        timer.current = window.setTimeout(() => {
          const bid = decideBid(settings.difficulty, state.hands[seat], state.currentBid);
          dispatch({ type: 'BID', bid });
        }, AI_DELAY_MS);
      }
    }

    if (state.phase === 'playing') {
      const seat = state.currentTurn;
      const player = state.players[seat];
      if (player.isAI) {
        timer.current = window.setTimeout(() => {
          const cards = decidePlay(settings.difficulty, state, seat);
          if (cards && cards.length > 0) {
            dispatch({ type: 'PLAY', cards });
          } else {
            dispatch({ type: 'PASS' });
          }
        }, AI_DELAY_MS);
      }
    }

    return () => {
      if (timer.current) {
        window.clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [state, dispatch, settings.difficulty]);
}
