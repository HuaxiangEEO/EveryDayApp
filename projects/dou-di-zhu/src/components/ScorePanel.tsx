import { useGame } from '../state/GameContext';
import styles from './ScorePanel.module.css';

const SPRING_LABEL = {
  spring: '春天',
  'anti-spring': '反春',
  none: '无',
} as const;

export function ScorePanel() {
  const { state, dispatch } = useGame();
  if (state.phase !== 'settled' || !state.result) return null;

  const r = state.result;
  const win = r.finalScore > 0;
  const playerSide = state.players[0].role === 'landlord' ? '地主' : '农民';

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={`${styles.title} ${win ? '' : styles.lose}`}>
          {win ? '胜 利' : '败 北'}
        </div>
        <div className={styles.subtitle}>
          你（{playerSide}）{win ? '赢得' : '失去'}本局
        </div>

        <div className={styles.row}>
          <span>胜方</span>
          <span>{r.winnerSide === 'landlord' ? '地主' : '农民'}</span>
        </div>
        <div className={styles.row}>
          <span>底分</span>
          <span>{r.basePoint}</span>
        </div>
        <div className={styles.row}>
          <span>倍数</span>
          <span>×{r.multiplier}</span>
        </div>
        <div className={styles.row}>
          <span>春天</span>
          <span>{SPRING_LABEL[r.spring]}</span>
        </div>
        <div className={styles.row}>
          <span>玩家得分</span>
          <span>{r.finalScore > 0 ? `+${r.finalScore}` : r.finalScore}</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.btn} onClick={() => dispatch({ type: 'START_GAME' })}>
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
}
