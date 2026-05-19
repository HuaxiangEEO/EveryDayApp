import type { Card, Player, Seat } from '../types';
import { CardView } from './CardView';
import styles from './PlayerSeat.module.css';

interface Props {
  player: Player;
  cardCount: number;
  active: boolean;
  /** 上一手出的牌（仅在 lastPlay.by===player.seat 时显示） */
  lastPlayCards?: Card[];
  /** 在 bidding 阶段显示的叫分（已叫过则展示 0/1/2/3 或"不叫"） */
  bid?: number | null;
  /** 在 playing 阶段：若该家刚刚 pass，显示 "不要" */
  passed?: boolean;
  /** 显示在最右上角的角色标签 */
  emoji?: string;
}

export function PlayerSeat({
  player,
  cardCount,
  active,
  lastPlayCards,
  bid,
  passed,
  emoji,
}: Props) {
  const isLandlord = player.role === 'landlord';
  return (
    <div className={[styles.seat, active && styles.active].filter(Boolean).join(' ')}>
      <div className={[styles.avatar, isLandlord && styles.landlord].filter(Boolean).join(' ')}>
        {emoji || (player.isAI ? '🤖' : '🧑')}
      </div>
      <div className={styles.name}>
        <span>{player.name}</span>
        {player.role && (
          <span className={[styles.role, isLandlord && styles.landlord].filter(Boolean).join(' ')}>
            {isLandlord ? '地主' : '农民'}
          </span>
        )}
      </div>
      <div className={styles.cardCount}>剩 {cardCount} 张</div>
      {bid !== undefined && bid !== null && (
        <div className={[styles.bid, bid === 0 && styles.pass].filter(Boolean).join(' ')}>
          {bid === 0 ? '不叫' : `叫 ${bid} 分`}
        </div>
      )}
      {passed && <div className={styles.passed}>不 要</div>}
      {lastPlayCards && lastPlayCards.length > 0 && (
        <div className={styles.lastPlay}>
          {lastPlayCards.map(c => (
            <CardView key={c.id} card={c} small />
          ))}
        </div>
      )}
    </div>
  );
}

export type { Seat };
