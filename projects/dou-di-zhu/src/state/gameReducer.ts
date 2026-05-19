import type { BidValue, Card, GameResult, GameState, Seat } from '../types';
import { deal, removeCards, sortHand } from '../core/deck';
import { identifyType } from '../core/cardType';
import { canBeat } from '../core/compare';
import { settle } from '../core/score';
import { buildHands, type Endgame } from '../core/endgames';

/* --------------------------- 初始化 / Action --------------------------- */

export function createInitialState(): GameState {
  return {
    phase: 'dealing',
    players: [
      { seat: 0, name: '我', isAI: false, role: null },
      { seat: 1, name: '右家', isAI: true, role: null },
      { seat: 2, name: '左家', isAI: true, role: null },
    ],
    hands: [[], [], []],
    initialHands: null,
    bottom: [],
    landlord: null,
    currentTurn: 0,
    lastPlay: null,
    passes: 0,
    multiplier: 1,
    basePoint: 1,
    history: [],
    bidLog: [],
    currentBid: 0,
    bidTurn: 0,
    bidStart: 0,
    result: null,
  };
}

export type Action =
  | { type: 'START_GAME' }
  | { type: 'START_ENDGAME'; endgame: Endgame }
  | { type: 'BID'; bid: BidValue }
  | { type: 'PLAY'; cards: Card[] }
  | { type: 'PASS' };

/* ----------------------------- reducer 主体 ----------------------------- */

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return startGame();
    case 'START_ENDGAME':
      return startEndgame(action.endgame);
    case 'BID':
      return handleBid(state, action.bid);
    case 'PLAY':
      return handlePlay(state, action.cards);
    case 'PASS':
      return handlePass(state);
    default:
      return state;
  }
}

function startEndgame(eg: Endgame): GameState {
  const hands = buildHands(eg);
  const players = createInitialState().players.map(p => ({
    ...p,
    role: (p.seat === eg.landlord ? 'landlord' : 'farmer') as 'landlord' | 'farmer',
  })) as GameState['players'];
  return {
    ...createInitialState(),
    phase: 'playing',
    players,
    hands,
    initialHands: [hands[0].slice(), hands[1].slice(), hands[2].slice()],
    bottom: [],
    landlord: eg.landlord,
    currentTurn: eg.startTurn ?? eg.landlord,
    basePoint: eg.basePoint,
    multiplier: 1,
    history: [],
    bidLog: [],
    currentBid: eg.basePoint as BidValue,
    bidTurn: eg.landlord,
    bidStart: eg.landlord,
    lastPlay: null,
    passes: 0,
    result: null,
  };
}

/* ------------------------------ 阶段处理 ------------------------------- */

function startGame(): GameState {
  const [h0, h1, h2, bottom] = deal();
  // 叫分起始座位：随机 0/1/2，让 AI 也能成为起手
  const start = (Math.floor(Math.random() * 3) as Seat);
  return {
    ...createInitialState(),
    phase: 'bidding',
    hands: [h0, h1, h2],
    initialHands: null,
    bottom,
    bidStart: start,
    bidTurn: start,
  };
}

function handleBid(state: GameState, bid: BidValue): GameState {
  if (state.phase !== 'bidding') return state;

  const seat = state.bidTurn;
  // 叫分必须 > currentBid，或为 0（不叫）
  let actualBid: BidValue = bid;
  if (bid !== 0 && bid <= state.currentBid) actualBid = 0;

  const newLog = [...state.bidLog, { by: seat, bid: actualBid }];
  const newCurrentBid = (Math.max(state.currentBid, actualBid) as BidValue);

  // 叫到 3 立即结束
  if (actualBid === 3) {
    return finishBidding({ ...state, bidLog: newLog, currentBid: 3 }, seat);
  }

  // 三家都已叫过
  if (newLog.length >= 3) {
    if (newCurrentBid === 0) {
      // 全部 0 分 → 流局重发
      return startGame();
    }
    // 取最高叫分者；并列取最先达到该分数的人
    let landlord: Seat = state.bidStart;
    let best: BidValue = 0;
    for (const r of newLog) {
      if (r.bid > best) {
        best = r.bid;
        landlord = r.by;
      }
    }
    return finishBidding({ ...state, bidLog: newLog, currentBid: newCurrentBid }, landlord);
  }

  // 轮到下一家
  return {
    ...state,
    bidLog: newLog,
    currentBid: newCurrentBid,
    bidTurn: nextSeat(seat),
  };
}

function finishBidding(state: GameState, landlord: Seat): GameState {
  const newHands = [
    state.hands[0].slice(),
    state.hands[1].slice(),
    state.hands[2].slice(),
  ] as [Card[], Card[], Card[]];
  newHands[landlord] = sortHand([...newHands[landlord], ...state.bottom]);

  const players = state.players.map(p => ({
    ...p,
    role: (p.seat === landlord ? 'landlord' : 'farmer') as 'landlord' | 'farmer',
  })) as GameState['players'];

  return {
    ...state,
    phase: 'playing',
    hands: newHands,
    initialHands: [
      newHands[0].slice(),
      newHands[1].slice(),
      newHands[2].slice(),
    ],
    players,
    landlord,
    basePoint: state.currentBid,
    multiplier: 1,
    currentTurn: landlord,
    lastPlay: null,
    passes: 0,
    history: [],
  };
}

function handlePlay(state: GameState, cards: Card[]): GameState {
  if (state.phase !== 'playing') return state;
  const seat = state.currentTurn;
  const hand = state.hands[seat];

  // 校验所有牌都在手中
  const ids = new Set(hand.map(c => c.id));
  if (!cards.every(c => ids.has(c.id))) return state;
  if (cards.length === 0) return state;

  const type = identifyType(cards);
  if (!type) return state;

  // 跟牌时必须能压制
  if (state.lastPlay && state.lastPlay.by !== seat) {
    if (!canBeat(state.lastPlay.type, type)) return state;
  }

  const newHand = removeCards(hand, cards);
  const newHands = [...state.hands] as [Card[], Card[], Card[]];
  newHands[seat] = newHand;

  const newHistory = [...state.history, { kind: 'play' as const, by: seat, cards, type }];

  // 胜负判定
  if (newHand.length === 0) {
    const winnerSide = state.players[seat].role || 'landlord';
    const result: GameResult = settle(
      { ...state, hands: newHands, history: newHistory },
      winnerSide,
    );
    return {
      ...state,
      phase: 'settled',
      hands: newHands,
      lastPlay: { by: seat, cards, type },
      passes: 0,
      history: newHistory,
      result,
    };
  }

  return {
    ...state,
    hands: newHands,
    lastPlay: { by: seat, cards, type },
    passes: 0,
    currentTurn: nextSeat(seat),
    history: newHistory,
  };
}

function handlePass(state: GameState): GameState {
  if (state.phase !== 'playing') return state;
  const seat = state.currentTurn;
  // 如果当前是首出，则不能 pass
  if (!state.lastPlay || state.lastPlay.by === seat) return state;

  const newPasses = state.passes + 1;
  const newHistory = [...state.history, { kind: 'pass' as const, by: seat }];
  const next = nextSeat(seat);

  // 两家都 pass，则 lastPlay 清空，下一家可自由出
  if (newPasses >= 2) {
    return {
      ...state,
      lastPlay: null,
      passes: 0,
      currentTurn: next,
      history: newHistory,
    };
  }

  return {
    ...state,
    passes: newPasses,
    currentTurn: next,
    history: newHistory,
  };
}

function nextSeat(seat: Seat): Seat {
  return ((seat + 1) % 3) as Seat;
}
