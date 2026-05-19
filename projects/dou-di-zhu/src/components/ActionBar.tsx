import { useMemo, useRef } from 'react';
import type { Card } from '../types';
import { useGame } from '../state/GameContext';
import { identifyType } from '../core/cardType';
import { canBeat } from '../core/compare';
import { kindLabel } from '../utils/format';
import { rankCandidates } from '../core/ai/hard';
import styles from './ActionBar.module.css';

interface Props {
  selected: Card[];
  onPlaySuccess: () => void;
  onHint: (cards: Card[]) => void;
}

export function ActionBar({ selected, onPlaySuccess, onHint }: Props) {
  const { state, dispatch } = useGame();
  const isMyTurn = state.phase === 'playing' && state.currentTurn === 0;

  const isFirstHand = !state.lastPlay || state.lastPlay.by === 0;

  const hintCacheRef = useRef<{ key: string; list: Card[][]; idx: number }>({
    key: '',
    list: [],
    idx: 0,
  });

  // 校验当前选择的牌是否合法
  const validation = useMemo(() => {
    if (!isMyTurn) return { ok: false, message: '' };
    if (selected.length === 0) return { ok: false, message: '请选择要出的牌' };
    const t = identifyType(selected);
    if (!t) return { ok: false, message: '不是合法牌型' };
    if (!isFirstHand && state.lastPlay) {
      if (!canBeat(state.lastPlay.type, t)) {
        return { ok: false, message: `无法压制 ${kindLabel(state.lastPlay.type.kind)}` };
      }
    }
    return { ok: true, message: kindLabel(t.kind) };
  }, [selected, isMyTurn, isFirstHand, state.lastPlay]);

  const handlePlay = () => {
    if (!validation.ok) return;
    dispatch({ type: 'PLAY', cards: selected });
    onPlaySuccess();
  };

  const handlePass = () => {
    dispatch({ type: 'PASS' });
    onPlaySuccess();
  };

  const handleHint = () => {
    const cacheKey = `${state.history.length}|${state.lastPlay ? state.lastPlay.by + ':' + state.lastPlay.type.key : 'lead'}`;
    let cache = hintCacheRef.current;
    if (cache.key !== cacheKey) {
      const ranked = rankCandidates(state, 0);
      const top = ranked.slice(0, Math.min(8, ranked.length)).map(c => c.cards);
      cache = { key: cacheKey, list: top, idx: 0 };
      hintCacheRef.current = cache;
    }
    if (cache.list.length === 0) return;
    const cards = cache.list[cache.idx % cache.list.length];
    cache.idx = (cache.idx + 1) % cache.list.length;
    onHint(cards);
  };

  if (!isMyTurn) {
    return (
      <div className={styles.bar}>
        <span className={styles.hint}>
          {state.phase === 'playing' ? `等待 ${state.players[state.currentTurn].name} 出牌…` : ''}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      <button
        className={`${styles.btn} ${styles.primary}`}
        disabled={!validation.ok}
        onClick={handlePlay}
        title={validation.message}
      >
        出牌
      </button>
      <button
        className={`${styles.btn} ${styles.danger}`}
        disabled={isFirstHand}
        onClick={handlePass}
      >
        不要
      </button>
      <button className={styles.btn} onClick={handleHint} title="再次点击循环下一个推荐">
        提示
      </button>
      <span className={`${styles.hint} ${validation.ok ? '' : styles.error}`}>
        {validation.message}
      </span>
    </div>
  );
}
