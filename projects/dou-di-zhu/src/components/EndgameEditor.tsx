import { useMemo, useState } from 'react';
import type { Rank, Seat, Suit } from '../types';
import type { Endgame } from '../core/endgames';
import { saveCustomEndgame } from '../utils/storage';
import styles from './EndgameEditor.module.css';

interface Props {
  onSaved: (eg: Endgame) => void;
  onCancel: () => void;
}

type CellOwner = -1 | 0 | 1 | 2;

interface CardCell {
  suit: Suit;
  rank: Rank;
  /** 同 rank 同花色可能多张？规则上一副牌每个 (suit, rank) 唯一，所以是 0/1 */
  owner: CellOwner;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];

function buildAllCards(): CardCell[] {
  const cells: CardCell[] = [];
  for (const r of RANKS) {
    for (const s of SUITS) {
      cells.push({ suit: s, rank: r, owner: -1 });
    }
  }
  cells.push({ suit: 'JOKER', rank: 'BJ', owner: -1 });
  cells.push({ suit: 'JOKER', rank: 'RJ', owner: -1 });
  return cells;
}

const OWNER_LABEL: Record<CellOwner, string> = {
  '-1': '·',
  '0': '我',
  '1': '右',
  '2': '左',
};

const OWNER_CYCLE: Record<CellOwner, CellOwner> = {
  '-1': 0,
  '0': 1,
  '1': 2,
  '2': -1,
};

const OWNER_CLASS: Record<CellOwner, string> = {
  '-1': '',
  '0': styles.ownerMe,
  '1': styles.ownerRight,
  '2': styles.ownerLeft,
};

export function EndgameEditor({ onSaved, onCancel }: Props) {
  const [cells, setCells] = useState<CardCell[]>(buildAllCards);
  const [title, setTitle] = useState('我的残局');
  const [description, setDescription] = useState('自定义残局');
  const [landlord, setLandlord] = useState<Seat>(0);
  const [startTurn, setStartTurn] = useState<Seat>(0);
  const [basePoint, setBasePoint] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const c: [number, number, number] = [0, 0, 0];
    for (const cell of cells) {
      if (cell.owner === 0) c[0]++;
      else if (cell.owner === 1) c[1]++;
      else if (cell.owner === 2) c[2]++;
    }
    return c;
  }, [cells]);

  const total = stats[0] + stats[1] + stats[2];

  const cycle = (i: number) => {
    setCells(prev => {
      const next = prev.slice();
      next[i] = { ...next[i], owner: OWNER_CYCLE[next[i].owner] };
      return next;
    });
  };

  const reset = () => setCells(buildAllCards());

  const handleSave = () => {
    setError(null);
    if (total < 6) {
      setError('请至少分配 6 张牌（每家 ≥1）');
      return;
    }
    if (stats[0] === 0 || stats[1] === 0 || stats[2] === 0) {
      setError('每家都需要至少一张牌');
      return;
    }
    const hands: [{ suit: Suit; rank: Rank }[], { suit: Suit; rank: Rank }[], { suit: Suit; rank: Rank }[]] = [[], [], []];
    for (const cell of cells) {
      if (cell.owner === 0) hands[0].push({ suit: cell.suit, rank: cell.rank });
      else if (cell.owner === 1) hands[1].push({ suit: cell.suit, rank: cell.rank });
      else if (cell.owner === 2) hands[2].push({ suit: cell.suit, rank: cell.rank });
    }
    const eg: Endgame = {
      id: 'custom-' + Date.now().toString(36),
      title: title.trim() || '我的残局',
      description: description.trim() || '自定义残局',
      playerRole: landlord === 0 ? 'landlord' : 'farmer',
      hands,
      landlord,
      startTurn,
      basePoint,
    };
    saveCustomEndgame(eg);
    onSaved(eg);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.field}>
          <span className={styles.label}>标题</span>
          <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} maxLength={20} />
        </div>
        <div className={styles.field}>
          <span className={styles.label}>描述</span>
          <input className={styles.input} value={description} onChange={e => setDescription(e.target.value)} maxLength={60} />
        </div>
      </div>

      <div className={styles.options}>
        <div className={styles.field}>
          <span className={styles.label}>地主</span>
          <div className={styles.btnGroup}>
            {([0, 1, 2] as Seat[]).map(s => (
              <button key={s} className={`${styles.optBtn} ${landlord === s ? styles.optActive : ''}`} onClick={() => setLandlord(s)}>
                {OWNER_LABEL[s as CellOwner]}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>先出</span>
          <div className={styles.btnGroup}>
            {([0, 1, 2] as Seat[]).map(s => (
              <button key={s} className={`${styles.optBtn} ${startTurn === s ? styles.optActive : ''}`} onClick={() => setStartTurn(s)}>
                {OWNER_LABEL[s as CellOwner]}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>底分</span>
          <div className={styles.btnGroup}>
            {[1, 2, 3].map(b => (
              <button key={b} className={`${styles.optBtn} ${basePoint === b ? styles.optActive : ''}`} onClick={() => setBasePoint(b)}>
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.legend}>
        点击牌以循环 <span className={styles.dot} /> → <span className={`${styles.dot} ${styles.ownerMe}`} />我 → <span className={`${styles.dot} ${styles.ownerRight}`} />右 → <span className={`${styles.dot} ${styles.ownerLeft}`} />左
        <span className={styles.counter}>共 {total} 张｜我 {stats[0]} · 右 {stats[1]} · 左 {stats[2]}</span>
      </div>

      <div className={styles.grid}>
        {cells.map((c, i) => {
          const isJoker = c.suit === 'JOKER';
          const labelTop = isJoker ? (c.rank === 'BJ' ? '小王' : '大王') : `${c.suit}${c.rank}`;
          const isRed = c.suit === '♥' || c.suit === '♦' || c.rank === 'RJ';
          return (
            <button
              key={`${c.suit}-${c.rank}`}
              className={`${styles.cell} ${OWNER_CLASS[c.owner]} ${isRed ? styles.red : ''}`}
              onClick={() => cycle(i)}
            >
              <span className={styles.cellLabel}>{labelTop}</span>
              <span className={styles.cellOwner}>{OWNER_LABEL[c.owner]}</span>
            </button>
          );
        })}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <button className={styles.btn} onClick={reset}>清空</button>
        <button className={styles.btn} onClick={onCancel}>取消</button>
        <button className={`${styles.btn} ${styles.primary}`} onClick={handleSave}>保存并开始</button>
      </div>
    </div>
  );
}
