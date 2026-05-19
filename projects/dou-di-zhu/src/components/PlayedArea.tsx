import type { Card, CardType } from '../types';
import { CardView } from './CardView';
import { kindLabel } from '../utils/format';
import styles from './PlayedArea.module.css';

interface Props {
  /** 当前桌面有效出牌 */
  lastPlay: { cards: Card[]; type: CardType; bySeatName: string } | null;
  /** 底牌（叫分阶段亮出，定地主后并入手牌则不再展示） */
  bottom?: Card[];
  /** 是否显示底牌 */
  showBottom?: boolean;
}

export function PlayedArea({ lastPlay, bottom, showBottom }: Props) {
  // 用 cards 的 id 列表做动画 key：cards 变化时整组容器重挂触发动画
  const animKey = lastPlay ? lastPlay.cards.map(c => c.id).join('|') : 'empty';
  return (
    <div className={styles.area}>
      {lastPlay ? (
        <>
          <div className={styles.label}>{lastPlay.bySeatName} 出</div>
          <div className={styles.cards} key={animKey}>
            {lastPlay.cards.map((c, i) => (
              <div
                key={c.id}
                className={styles.cardWrap}
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <CardView card={c} />
              </div>
            ))}
          </div>
          <div className={styles.kindBadge} key={`badge-${animKey}`}>{kindLabel(lastPlay.type.kind)}</div>
        </>
      ) : (
        <div className={styles.empty}>等待出牌…</div>
      )}
      {showBottom && bottom && bottom.length > 0 && (
        <>
          <div className={styles.bottomLabel}>底牌</div>
          <div className={styles.bottom}>
            {bottom.map(c => (
              <CardView key={c.id} card={c} small />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
