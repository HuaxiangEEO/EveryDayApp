/**
 * 斗地主核心类型定义
 *
 * 设计要点：
 * - 牌的大小用 value 表示：3..15(=A), 16(=2), 17(=小王), 18(=大王)
 * - 花色仅用于显示，不参与比较；王单独标记 suit='JOKER'
 * - CardType 描述一手出牌的牌型，比较时按 (kind, key, len) 维度
 */

export type Suit = '♠' | '♥' | '♦' | '♣' | 'JOKER';

export type Rank =
  | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K' | 'A' | '2'
  | 'BJ' | 'RJ';

export interface Card {
  /** 唯一 id，便于 React key 与去重 */
  id: string;
  suit: Suit;
  rank: Rank;
  /** 大小：3=3,4=4,...,10=10,J=11,Q=12,K=13,A=14,2=16,小王=17,大王=18 */
  value: number;
}

/** 玩家座位：0=人类玩家，1=右手 AI，2=左手 AI（顺时针） */
export type Seat = 0 | 1 | 2;

/** 玩家身份 */
export type Role = 'landlord' | 'farmer';

export interface Player {
  seat: Seat;
  name: string;
  isAI: boolean;
  role: Role | null;
}

/** 牌型 kind */
export type CardKind =
  | 'single'         // 单
  | 'pair'           // 对
  | 'triple'         // 三张
  | 'triple-single'  // 三带一
  | 'triple-pair'    // 三带一对
  | 'straight'       // 顺子（≥5）
  | 'pair-straight'  // 连对（≥3 对）
  | 'plane'          // 飞机（≥2 个连续三张，纯飞机）
  | 'plane-single'   // 飞机带单
  | 'plane-pair'     // 飞机带对
  | 'four-two-single'// 四带二（两张单）
  | 'four-two-pair'  // 四带二（两对）
  | 'bomb'           // 炸弹
  | 'rocket';        // 王炸

export interface CardType {
  kind: CardKind;
  /** 主牌大小：单/对/三/炸 取该牌大小；顺子/连对/飞机 取最小那张 */
  key: number;
  /** 长度：顺子=张数，连对=对数，飞机=三张组数；其余为 1 */
  len: number;
}

/** 出牌动作 */
export type Move =
  | { kind: 'play'; by: Seat; cards: Card[]; type: CardType }
  | { kind: 'pass'; by: Seat };

/** 叫分 */
export type BidValue = 0 | 1 | 2 | 3;
export interface BidRecord {
  by: Seat;
  bid: BidValue;
}

export type Phase = 'dealing' | 'bidding' | 'playing' | 'settled';

export interface GameSettings {
  /** AI 思考延时（ms） */
  aiDelayMs: number;
}

export interface GameResult {
  winnerSide: 'landlord' | 'farmer';
  basePoint: number;
  multiplier: number;
  /** 春天 / 反春 */
  spring: 'spring' | 'anti-spring' | 'none';
  /** 玩家最终得分（地主胜=正，负则相反） */
  finalScore: number;
}

export interface GameState {
  phase: Phase;
  players: [Player, Player, Player];
  hands: [Card[], Card[], Card[]];
  /** 叫分阶段结束后（含底牌并入）的初始手牌，用于复盘重放 */
  initialHands: [Card[], Card[], Card[]] | null;
  bottom: Card[];
  /** 地主座位 */
  landlord: Seat | null;
  /** 当前轮到谁出牌 */
  currentTurn: Seat;
  /** 上一手有效出牌（被超过则清空） */
  lastPlay: { by: Seat; cards: Card[]; type: CardType } | null;
  /** 连续 pass 次数 */
  passes: number;
  /** 倍数（底分倍率） */
  multiplier: number;
  /** 底分 */
  basePoint: number;
  /** 历史动作（用于复盘 / 春天判定） */
  history: Move[];
  /** 叫分日志 */
  bidLog: BidRecord[];
  /** 当前最高叫分 */
  currentBid: BidValue;
  /** 当前轮到叫分的座位 */
  bidTurn: Seat;
  /** 第一个叫分的座位（决定结束轮次） */
  bidStart: Seat;
  result: GameResult | null;
}
