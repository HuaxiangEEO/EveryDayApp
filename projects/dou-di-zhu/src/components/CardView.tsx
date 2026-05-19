import type { Card } from '../types';
import styles from './CardView.module.css';
import { rankLabel } from '../utils/format';

interface Props {
  card?: Card;
  selected?: boolean;
  disabled?: boolean;
  selectable?: boolean;
  small?: boolean;
  onClick?: () => void;
  /** 牌背朝上（不显示牌面） */
  faceDown?: boolean;
}

export function CardView({
  card,
  selected = false,
  disabled = false,
  selectable = false,
  small = false,
  onClick,
  faceDown = false,
}: Props) {
  const classes = [
    styles.card,
    selected && styles.selected,
    disabled && styles.disabled,
    selectable && !disabled && styles.selectable,
    small && styles.small,
    faceDown && styles.back,
  ].filter(Boolean).join(' ');

  if (faceDown || !card) {
    return <div className={classes} />;
  }

  const isJoker = card.suit === 'JOKER';
  const isRed = card.suit === '♥' || card.suit === '♦' || card.rank === 'RJ';
  const colorCls = isRed ? styles.red : styles.black;

  return (
    <div
      className={classes}
      onClick={() => !disabled && onClick?.()}
      role="button"
      aria-label={`${card.suit === 'JOKER' ? '' : card.suit}${rankLabel(card)}`}
    >
      {isJoker ? (
        <>
          <div className={`${styles.corner} ${styles.top} ${colorCls}`}>
            <span className={styles.joker}>{card.rank === 'RJ' ? 'RED' : 'BLK'}</span>
          </div>
          <div className={`${styles.center} ${colorCls}`}>{card.rank === 'RJ' ? '王' : '王'}</div>
          <div className={`${styles.corner} ${styles.bottom} ${colorCls}`}>
            <span className={styles.joker}>{card.rank === 'RJ' ? 'RED' : 'BLK'}</span>
          </div>
        </>
      ) : (
        <>
          <div className={`${styles.corner} ${styles.top} ${colorCls}`}>
            <span className={styles.rank}>{rankLabel(card)}</span>
            <span className={styles.suit}>{card.suit}</span>
          </div>
          <div className={`${styles.center} ${colorCls}`}>{card.suit}</div>
          <div className={`${styles.corner} ${styles.bottom} ${colorCls}`}>
            <span className={styles.rank}>{rankLabel(card)}</span>
            <span className={styles.suit}>{card.suit}</span>
          </div>
        </>
      )}
    </div>
  );
}
