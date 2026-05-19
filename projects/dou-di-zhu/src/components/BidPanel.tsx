import { useGame } from '../state/GameContext';
import type { BidValue } from '../types';
import styles from './BidPanel.module.css';

export function BidPanel() {
  const { state, dispatch } = useGame();
  if (state.phase !== 'bidding') return null;

  const isMyTurn = state.bidTurn === 0;
  const minBid = (state.currentBid + 1) as BidValue;

  return (
    <div className={styles.panel}>
      <div className={styles.title}>叫地主</div>
      <div className={styles.subtitle}>
        当前最高叫分：{state.currentBid} 分
      </div>
      {isMyTurn ? (
        <div className={styles.buttons}>
          <button
            className={styles.btn}
            onClick={() => dispatch({ type: 'BID', bid: 0 })}
          >
            不叫
          </button>
          {([1, 2, 3] as BidValue[]).filter(b => b >= minBid).map(b => (
            <button
              key={b}
              className={`${styles.btn} ${b === 3 ? styles.primary : ''}`}
              onClick={() => dispatch({ type: 'BID', bid: b })}
            >
              {b} 分
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.waiting}>
          等待 {state.players[state.bidTurn].name} 决策…
        </div>
      )}
    </div>
  );
}
