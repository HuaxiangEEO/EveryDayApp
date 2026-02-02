/**
 * 中国象棋类型定义
 */

// 棋子颜色
export type PieceColor = 'red' | 'black';

// 棋子类型
export type PieceType = 
  | 'king'      // 将/帅
  | 'advisor'   // 士/仕
  | 'elephant'  // 象/相
  | 'horse'     // 马
  | 'rook'      // 车
  | 'cannon'    // 炮
  | 'pawn';     // 兵/卒

// 棋子信息
export interface Piece {
  type: PieceType;
  color: PieceColor;
  id: string; // 唯一标识
}

// 棋盘位置（0-8列，0-9行）
export interface Position {
  row: number; // 0-9
  col: number; // 0-8
}

// 棋盘状态：位置 -> 棋子
export type BoardState = Map<string, Piece>;

// 走棋记录
export interface MoveRecord {
  step: number;              // 步数（从1开始）
  from: Position;            // 起始位置
  to: Position;              // 目标位置
  piece: Piece;              // 移动的棋子
  capturedPiece: Piece | null;  // 被吃的棋子（如果有）
  player: PieceColor;        // 走棋方
  timestamp: number;         // 走棋时间戳
}

// 游戏状态
export interface GameState {
  board: BoardState;
  currentPlayer: PieceColor;
  selectedPosition: Position | null;
  gameOver: boolean;
  winner: PieceColor | null;
  moves: MoveRecord[];       // 走棋记录
  currentStep: number;       // 当前步数（用于复盘，0表示初始状态）
  startTime?: number;         // 游戏开始时间（可选）
  savedGameId?: string;       // 已保存的棋局ID（如果已保存）
}

// 初始棋盘布局
export const INITIAL_BOARD_LAYOUT: Array<{ position: Position; piece: Piece }> = [
  // 黑方（上方）初始布局
  { position: { row: 0, col: 0 }, piece: { type: 'rook', color: 'black', id: 'black-rook-1' } },
  { position: { row: 0, col: 1 }, piece: { type: 'horse', color: 'black', id: 'black-horse-1' } },
  { position: { row: 0, col: 2 }, piece: { type: 'elephant', color: 'black', id: 'black-elephant-1' } },
  { position: { row: 0, col: 3 }, piece: { type: 'advisor', color: 'black', id: 'black-advisor-1' } },
  { position: { row: 0, col: 4 }, piece: { type: 'king', color: 'black', id: 'black-king' } },
  { position: { row: 0, col: 5 }, piece: { type: 'advisor', color: 'black', id: 'black-advisor-2' } },
  { position: { row: 0, col: 6 }, piece: { type: 'elephant', color: 'black', id: 'black-elephant-2' } },
  { position: { row: 0, col: 7 }, piece: { type: 'horse', color: 'black', id: 'black-horse-2' } },
  { position: { row: 0, col: 8 }, piece: { type: 'rook', color: 'black', id: 'black-rook-2' } },
  
  { position: { row: 2, col: 1 }, piece: { type: 'cannon', color: 'black', id: 'black-cannon-1' } },
  { position: { row: 2, col: 7 }, piece: { type: 'cannon', color: 'black', id: 'black-cannon-2' } },
  
  { position: { row: 3, col: 0 }, piece: { type: 'pawn', color: 'black', id: 'black-pawn-1' } },
  { position: { row: 3, col: 2 }, piece: { type: 'pawn', color: 'black', id: 'black-pawn-2' } },
  { position: { row: 3, col: 4 }, piece: { type: 'pawn', color: 'black', id: 'black-pawn-3' } },
  { position: { row: 3, col: 6 }, piece: { type: 'pawn', color: 'black', id: 'black-pawn-4' } },
  { position: { row: 3, col: 8 }, piece: { type: 'pawn', color: 'black', id: 'black-pawn-5' } },
  
  // 红方（下方）初始布局
  { position: { row: 9, col: 0 }, piece: { type: 'rook', color: 'red', id: 'red-rook-1' } },
  { position: { row: 9, col: 1 }, piece: { type: 'horse', color: 'red', id: 'red-horse-1' } },
  { position: { row: 9, col: 2 }, piece: { type: 'elephant', color: 'red', id: 'red-elephant-1' } },
  { position: { row: 9, col: 3 }, piece: { type: 'advisor', color: 'red', id: 'red-advisor-1' } },
  { position: { row: 9, col: 4 }, piece: { type: 'king', color: 'red', id: 'red-king' } },
  { position: { row: 9, col: 5 }, piece: { type: 'advisor', color: 'red', id: 'red-advisor-2' } },
  { position: { row: 9, col: 6 }, piece: { type: 'elephant', color: 'red', id: 'red-elephant-2' } },
  { position: { row: 9, col: 7 }, piece: { type: 'horse', color: 'red', id: 'red-horse-2' } },
  { position: { row: 9, col: 8 }, piece: { type: 'rook', color: 'red', id: 'red-rook-2' } },
  
  { position: { row: 7, col: 1 }, piece: { type: 'cannon', color: 'red', id: 'red-cannon-1' } },
  { position: { row: 7, col: 7 }, piece: { type: 'cannon', color: 'red', id: 'red-cannon-2' } },
  
  { position: { row: 6, col: 0 }, piece: { type: 'pawn', color: 'red', id: 'red-pawn-1' } },
  { position: { row: 6, col: 2 }, piece: { type: 'pawn', color: 'red', id: 'red-pawn-2' } },
  { position: { row: 6, col: 4 }, piece: { type: 'pawn', color: 'red', id: 'red-pawn-3' } },
  { position: { row: 6, col: 6 }, piece: { type: 'pawn', color: 'red', id: 'red-pawn-4' } },
  { position: { row: 6, col: 8 }, piece: { type: 'pawn', color: 'red', id: 'red-pawn-5' } },
];

/**
 * 位置转字符串键
 */
export function positionToKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

/**
 * 字符串键转位置
 */
export function keyToPosition(key: string): Position {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

/**
 * 初始化棋盘状态
 */
export function createInitialBoard(): BoardState {
  const board = new Map<string, Piece>();
  INITIAL_BOARD_LAYOUT.forEach(({ position, piece }) => {
    board.set(positionToKey(position), piece);
  });
  return board;
}
