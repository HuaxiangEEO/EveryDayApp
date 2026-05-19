import { useMemo } from 'react';
import { useGame } from '../state/GameContext';
import styles from './RecordPanel.module.css';

const RANK_VALUE_LIST: Array<{ value: number; label: string; total: number }> = [
  { value: 3, label: '3', total: 4 },
  { value: 4, label: '4', total: 4 },
  { value: 5, label: '5', total: 4 },
  { value: 6, label: '6', total: 4 },
  { value: 7, label: '7', total: 4 },
  { value: 8, label: '8', total: 4 },
  { value: 9, label: '9', total: 4 },
  { value: 10, label: '10', total: 4 },
  { value: 11, label: 'J', total: 4 },
  { value: 12, label: 'Q', total: 4 },
  { value: 13, label: 'K', total: 4 },
  { value: 14, label: 'A', total: 4 },
  { value: 16, label: '2', total: 4 },
  { value: 17, label: '小', total: 1 },
  { value: 18, label: '大', total: 1 },
];

/**
 * 记牌器：显示各点数"剩余"张数（包含玩家手牌、对手手牌、底牌）。
 * 已经被打出的牌不计入剩余。
 */
export function RecordPanel() {
  const { state } = useGame();

  const remaining = useMemo(() => {
    const map = new Map<number, number>();
    for (const item of RANK_VALUE_LIST) map.set(item.value, item.total);
    for (const m of state.history) {
      if (m.kind !== 'play') continue;
      for (const c of m.cards) {
        map.set(c.value, (map.get(c.value) || 0) - 1);
      }
    }
    return map;
  }, [state.history]);

  return (
    <div className={styles.panel} aria-label="记牌器">
      <span className={styles.label}>余</span>
      {RANK_VALUE_LIST.map(item => {
        const left = remaining.get(item.value) ?? item.total;
        const cls = [
          styles.cell,
          left === 0 && styles.gone,
          left > 0 && left <= 1 && item.total > 1 && styles.danger,
          left === item.total && styles.zero,
        ].filter(Boolean).join(' ');
        return (
          <div className={cls} key={item.value} title={`点数 ${item.label} 还剩 ${left} 张`}>
            <span className={styles.rank}>{item.label}</span>
            <span className={styles.count}>{left}</span>
          </div>
        );
      })}
    </div>
  );
}
