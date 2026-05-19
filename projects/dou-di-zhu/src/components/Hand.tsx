import { useMemo } from 'react';
import type { Card } from '../types';
import { CardView } from './CardView';
import styles from './Hand.module.css';

interface Props {
  cards: Card[];
  selectedIds: Set<string>;
  onToggle: (card: Card) => void;
  /** 在小屏幕场景下使用更紧凑的卡牌 */
  compact?: boolean;
}

export function Hand({ cards, selectedIds, onToggle, compact = false }: Props) {
  const items = useMemo(() => cards, [cards]);

  return (
    <div className={styles.hand} role="list" aria-label="玩家手牌">
      {items.map((card) => (
        <div className={styles.slot} key={card.id} role="listitem">
          <CardView
            card={card}
            selected={selectedIds.has(card.id)}
            selectable
            small={compact}
            onClick={() => onToggle(card)}
          />
        </div>
      ))}
    </div>
  );
}
