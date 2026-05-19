import { useState } from 'react';
import { loadStats, resetStats } from '../utils/storage';
import styles from './StatsView.module.css';

function pct(num: number, den: number): string {
  if (den === 0) return '—';
  return `${((num / den) * 100).toFixed(1)}%`;
}

export function StatsView() {
  const [, force] = useState(0);
  const s = loadStats();

  return (
    <div className={styles.wrap}>
      <Tile num={s.totalGames} label="总局数" />
      <Tile num={pct(s.wins, s.totalGames)} label={`胜率（${s.wins} 胜 ${s.losses} 负）`} />
      <Tile num={pct(s.asLandlordWins, s.asLandlordGames)} label={`地主胜率（${s.asLandlordGames} 局）`} />
      <Tile num={pct(s.asFarmerWins, s.asFarmerGames)} label={`农民胜率（${s.asFarmerGames} 局）`} />
      <Tile num={s.bombs} label="炸弹总数（含 AI）" />
      <Tile num={s.rockets} label="王炸总数" />
      <Tile num={s.springs} label="春天次数" />
      <Tile num={s.antiSprings} label="反春次数" />
      <div className={styles.actions}>
        <button
          className={styles.dangerBtn}
          onClick={() => {
            if (confirm('确定重置统计？此操作不可恢复。')) {
              resetStats();
              force(n => n + 1);
            }
          }}
        >
          重置统计
        </button>
      </div>
    </div>
  );
}

function Tile({ num, label }: { num: number | string; label: string }) {
  return (
    <div className={styles.tile}>
      <div className={styles.num}>{num}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
