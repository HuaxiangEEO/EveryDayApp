import { useState } from 'react';
import {
  clearSavedGames,
  deleteSavedGame,
  listSavedGames,
  type SavedGame,
} from '../utils/storage';
import styles from './SavedGamesList.module.css';

interface Props {
  onPick: (game: SavedGame) => void;
  /** 父组件可以通过该 key 强制刷新列表 */
  refreshKey?: number;
}

const SEAT_LABEL = ['我', '右家', '左家'] as const;

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function SavedGamesList({ onPick, refreshKey }: Props) {
  const [, force] = useState(0);
  const games = listSavedGames();

  if (games.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>暂无保存的对局</div>
      </div>
    );
  }

  void refreshKey; // 仅作 prop 触发渲染依赖

  return (
    <div className={styles.wrap}>
      {games.map(g => {
        const playerWin =
          (g.result.winnerSide === 'landlord' && g.landlord === 0) ||
          (g.result.winnerSide === 'farmer' && g.landlord !== 0);
        return (
          <div className={styles.item} key={g.id} onClick={() => onPick(g)}>
            <div className={styles.left}>
              <div className={`${styles.headline} ${playerWin ? styles.win : styles.lose}`}>
                {playerWin ? '胜利' : '失败'} · 玩家
                {g.result.finalScore > 0 ? '+' : ''}
                {g.result.finalScore}
              </div>
              <div className={styles.sub}>
                {formatTime(g.ts)} · 地主：{SEAT_LABEL[g.landlord]} · 底分 {g.basePoint} · ×{g.result.multiplier} · 共 {g.history.length} 步
              </div>
            </div>
            <div className={styles.right}>
              <button
                className={styles.delete}
                title="删除"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSavedGame(g.id);
                  force(n => n + 1);
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
      <div className={styles.tools}>
        <button
          className={styles.dangerBtn}
          onClick={() => {
            if (confirm('确定清空所有保存的对局？')) {
              clearSavedGames();
              force(n => n + 1);
            }
          }}
        >
          清空全部
        </button>
      </div>
    </div>
  );
}
