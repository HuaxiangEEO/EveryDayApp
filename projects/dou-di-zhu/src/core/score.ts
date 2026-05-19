import type { GameResult, GameState, Move, Seat } from '../types';

/**
 * 春天判定：
 * - 春天：地主只出过 1 次（即首手），农民没出过任何牌。地主获胜时倍数 ×2
 * - 反春：农民有人出过牌，但地主只出过 1 次牌。农民获胜时倍数 ×2
 *
 * 实现：以 history 中"出牌动作"的次数判断。
 */
export function judgeSpring(state: GameState, winnerSide: 'landlord' | 'farmer'): 'spring' | 'anti-spring' | 'none' {
  const landlord = state.landlord;
  if (landlord === null) return 'none';

  let landlordPlays = 0;
  let farmerPlays = 0;
  for (const m of state.history) {
    if (m.kind !== 'play') continue;
    if (m.by === landlord) landlordPlays += 1;
    else farmerPlays += 1;
  }

  if (winnerSide === 'landlord' && farmerPlays === 0) return 'spring';
  if (winnerSide === 'farmer' && landlordPlays === 1) return 'anti-spring';
  return 'none';
}

/** 计算炸弹/王炸对倍数的贡献：每个炸弹 ×2、王炸 ×2 */
export function bombMultiplier(history: Move[]): number {
  let m = 1;
  for (const move of history) {
    if (move.kind !== 'play') continue;
    const k = move.type.kind;
    if (k === 'bomb' || k === 'rocket') m *= 2;
  }
  return m;
}

/**
 * 结算：根据胜方、底分、炸弹、春天计算最终倍数与玩家得分（玩家=Seat 0）
 */
export function settle(state: GameState, winnerSide: 'landlord' | 'farmer'): GameResult {
  const spring = judgeSpring(state, winnerSide);
  let multiplier = state.multiplier * bombMultiplier(state.history);
  if (spring !== 'none') multiplier *= 2;

  // 玩家视角分数（地主胜，地主得 base × mul × 2；农民胜，农民每人得 base × mul）
  // 这里"玩家最终得分"取相对正负，胜负显示用。
  const playerSeat: Seat = 0;
  const isPlayerLandlord = state.landlord === playerSeat;
  const isPlayerWin = winnerSide === 'landlord' ? isPlayerLandlord : !isPlayerLandlord;
  const magnitude = state.basePoint * multiplier * (winnerSide === 'landlord' ? 2 : 1);
  const finalScore = isPlayerWin ? magnitude : -magnitude;

  return {
    winnerSide,
    basePoint: state.basePoint,
    multiplier,
    spring,
    finalScore,
  };
}
