import { useMemo, useState } from 'react';
import type { SavedGame } from '../utils/storage';
import { buildFrame } from '../utils/replay';
import { CardView } from './CardView';
import { kindLabel } from '../utils/format';
import styles from './ReplayView.module.css';

interface Props {
  game: SavedGame;
}

const SEAT_LABEL = ['我', '右家', '左家'] as const;
const ROLE_LABEL = (seat: 0 | 1 | 2, landlord: 0 | 1 | 2) =>
  seat === landlord ? '地主' : '农民';

export function ReplayView({ game }: Props) {
  const [step, setStep] = useState<number>(0);
  const total = game.history.length;

  const frame = useMemo(
    () => buildFrame(game.initialHands, game.history, game.landlord, step),
    [game, step],
  );

  const lastMove = frame.lastMove;

  const moveDesc = (() => {
    if (!lastMove) return '初始局面';
    const name = SEAT_LABEL[lastMove.by];
    const role = ROLE_LABEL(lastMove.by, game.landlord);
    if (lastMove.kind === 'pass') return `${name}（${role}）：不要`;
    return `${name}（${role}）：${kindLabel(lastMove.type.kind)} · ${lastMove.cards.length} 张`;
  })();

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        胜方：{game.result.winnerSide === 'landlord' ? '地主' : '农民'} · 底分 {game.result.basePoint} · 倍数 ×{game.result.multiplier} ·
        {game.result.spring === 'spring' ? ' 春天' : game.result.spring === 'anti-spring' ? ' 反春' : ''}
        {' '}玩家得分 {game.result.finalScore > 0 ? '+' : ''}{game.result.finalScore}
      </div>

      {[0, 1, 2].map(seat => (
        <div className={styles.row} key={seat}>
          <span className={styles.label}>
            {SEAT_LABEL[seat as 0 | 1 | 2]}
            （{ROLE_LABEL(seat as 0 | 1 | 2, game.landlord)}）
          </span>
          <div
            className={`${styles.cards} ${frame.hands[seat].length === 0 ? styles.empty : ''}`}
          >
            {frame.hands[seat].length === 0
              ? '已出完'
              : frame.hands[seat].map(c => <CardView key={c.id} card={c} small />)}
          </div>
        </div>
      ))}

      <div className={styles.row}>
        <span className={styles.label}>当前出</span>
        <div className={`${styles.cards} ${!frame.lastPlayMove ? styles.empty : ''}`}>
          {frame.lastPlayMove
            ? frame.lastPlayMove.cards.map(c => <CardView key={c.id} card={c} small />)
            : '无'}
        </div>
      </div>

      <div className={styles.moveLog}>
        <span className={styles.seatTag}>第 {step}/{total} 步</span>
        {moveDesc}
      </div>

      <div className={styles.actionBar}>
        <button className={styles.btn} onClick={() => setStep(0)} disabled={step === 0}>开头</button>
        <button className={styles.btn} onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>上一步</button>
        <input
          type="range"
          min={0}
          max={total}
          value={step}
          className={styles.range}
          onChange={e => setStep(Number(e.target.value))}
        />
        <span className={styles.stepLabel}>{step}/{total}</span>
        <button className={styles.btn} onClick={() => setStep(s => Math.min(total, s + 1))} disabled={step === total}>下一步</button>
        <button className={styles.btn} onClick={() => setStep(total)} disabled={step === total}>末尾</button>
      </div>
    </div>
  );
}
