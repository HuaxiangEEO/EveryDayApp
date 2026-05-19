import type { CardType } from '../types';

/**
 * 判断 next 是否能压制 prev（同牌型 + 更大；或炸弹 / 王炸压制）
 *
 * 规则：
 * - 王炸压一切
 * - 炸弹压非炸弹；炸弹之间比 key
 * - 其他牌型必须 kind 一致 且 len 一致 且 key 更大
 */
export function canBeat(prev: CardType, next: CardType): boolean {
  if (next.kind === 'rocket') return true;
  if (prev.kind === 'rocket') return false;

  if (next.kind === 'bomb') {
    if (prev.kind !== 'bomb') return true;
    return next.key > prev.key;
  }
  if (prev.kind === 'bomb') return false;

  if (prev.kind !== next.kind) return false;
  if (prev.len !== next.len) return false;
  return next.key > prev.key;
}
