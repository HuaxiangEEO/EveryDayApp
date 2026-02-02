import { Position, BoardState, Piece, positionToKey } from '../types/chess';

/**
 * 检查位置是否在棋盘范围内
 */
function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row <= 9 && pos.col >= 0 && pos.col <= 8;
}

/**
 * 检查位置是否有棋子
 */
function hasPiece(board: BoardState, pos: Position): boolean {
  return board.has(positionToKey(pos));
}

/**
 * 获取位置上的棋子
 */
function getPiece(board: BoardState, pos: Position): Piece | undefined {
  return board.get(positionToKey(pos));
}

/**
 * 检查是否可以移动到目标位置（不考虑规则，只检查是否有己方棋子）
 */
function canMoveTo(board: BoardState, target: Position, currentPlayer: 'red' | 'black'): boolean {
  if (!isValidPosition(target)) return false;
  const piece = getPiece(board, target);
  return !piece || piece.color !== currentPlayer;
}

/**
 * 将/帅的走法
 */
function getKingMoves(board: BoardState, pos: Position, color: 'red' | 'black'): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: 0 }, // 上
    { row: 1, col: 0 },  // 下
    { row: 0, col: -1 }, // 左
    { row: 0, col: 1 },  // 右
  ];

  // 将/帅只能在九宫内移动
  const minRow = color === 'red' ? 7 : 0;
  const maxRow = color === 'red' ? 9 : 2;
  const minCol = 3;
  const maxCol = 5;

  directions.forEach(dir => {
    const newPos: Position = { row: pos.row + dir.row, col: pos.col + dir.col };
    if (
      newPos.row >= minRow && newPos.row <= maxRow &&
      newPos.col >= minCol && newPos.col <= maxCol &&
      canMoveTo(board, newPos, color)
    ) {
      moves.push(newPos);
    }
  });

  return moves;
}

/**
 * 士/仕的走法
 */
function getAdvisorMoves(board: BoardState, pos: Position, color: 'red' | 'black'): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: -1 }, // 左上
    { row: -1, col: 1 },  // 右上
    { row: 1, col: -1 },  // 左下
    { row: 1, col: 1 },   // 右下
  ];

  const minRow = color === 'red' ? 7 : 0;
  const maxRow = color === 'red' ? 9 : 2;
  const minCol = 3;
  const maxCol = 5;

  directions.forEach(dir => {
    const newPos: Position = { row: pos.row + dir.row, col: pos.col + dir.col };
    if (
      newPos.row >= minRow && newPos.row <= maxRow &&
      newPos.col >= minCol && newPos.col <= maxCol &&
      canMoveTo(board, newPos, color)
    ) {
      moves.push(newPos);
    }
  });

  return moves;
}

/**
 * 象/相的走法
 */
function getElephantMoves(board: BoardState, pos: Position, color: 'red' | 'black'): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -2, col: -2, block: { row: -1, col: -1 } }, // 左上
    { row: -2, col: 2, block: { row: -1, col: 1 } },  // 右上
    { row: 2, col: -2, block: { row: 1, col: -1 } },   // 左下
    { row: 2, col: 2, block: { row: 1, col: 1 } },    // 右下
  ];

  // 象不能过河
  const maxRow = color === 'red' ? 9 : 4;

  directions.forEach(dir => {
    const blockPos: Position = { row: pos.row + dir.block.row, col: pos.col + dir.block.col };
    const newPos: Position = { row: pos.row + dir.row, col: pos.col + dir.col };
    
    // 检查塞象眼
    if (hasPiece(board, blockPos)) return;
    
    if (
      newPos.row >= 0 && newPos.row <= maxRow &&
      isValidPosition(newPos) &&
      canMoveTo(board, newPos, color)
    ) {
      moves.push(newPos);
    }
  });

  return moves;
}

/**
 * 马的走法
 */
function getHorseMoves(board: BoardState, pos: Position, color: 'red' | 'black'): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -2, col: -1, block: { row: -1, col: 0 } }, // 上左
    { row: -2, col: 1, block: { row: -1, col: 0 } },  // 上右
    { row: -1, col: -2, block: { row: 0, col: -1 } }, // 左上
    { row: -1, col: 2, block: { row: 0, col: 1 } },  // 右上
    { row: 1, col: -2, block: { row: 0, col: -1 } }, // 左下
    { row: 1, col: 2, block: { row: 0, col: 1 } },   // 右下
    { row: 2, col: -1, block: { row: 1, col: 0 } },  // 下左
    { row: 2, col: 1, block: { row: 1, col: 0 } },   // 下右
  ];

  directions.forEach(dir => {
    const blockPos: Position = { row: pos.row + dir.block.row, col: pos.col + dir.block.col };
    const newPos: Position = { row: pos.row + dir.row, col: pos.col + dir.col };
    
    // 检查蹩马腿
    if (hasPiece(board, blockPos)) return;
    
    if (isValidPosition(newPos) && canMoveTo(board, newPos, color)) {
      moves.push(newPos);
    }
  });

  return moves;
}

/**
 * 车的走法
 */
function getRookMoves(board: BoardState, pos: Position, color: 'red' | 'black'): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: 0 }, // 上
    { row: 1, col: 0 },  // 下
    { row: 0, col: -1 }, // 左
    { row: 0, col: 1 },  // 右
  ];

  directions.forEach(dir => {
    for (let i = 1; i < 10; i++) {
      const newPos: Position = { row: pos.row + dir.row * i, col: pos.col + dir.col * i };
      if (!isValidPosition(newPos)) break;
      
      const piece = getPiece(board, newPos);
      if (piece) {
        if (piece.color !== color) {
          moves.push(newPos); // 可以吃对方棋子
        }
        break; // 遇到任何棋子都停止
      }
      moves.push(newPos);
    }
  });

  return moves;
}

/**
 * 炮的走法
 */
function getCannonMoves(board: BoardState, pos: Position, color: 'red' | 'black'): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: 0 }, // 上
    { row: 1, col: 0 },  // 下
    { row: 0, col: -1 }, // 左
    { row: 0, col: 1 },  // 右
  ];

  directions.forEach(dir => {
    let pieceCount = 0;
    for (let i = 1; i < 10; i++) {
      const newPos: Position = { row: pos.row + dir.row * i, col: pos.col + dir.col * i };
      if (!isValidPosition(newPos)) break;
      
      const piece = getPiece(board, newPos);
      if (piece) {
        pieceCount++;
        // 如果已经有一个棋子，且是第二个棋子（对方棋子），可以吃
        if (pieceCount === 2 && piece.color !== color) {
          moves.push(newPos);
        }
        // 如果有棋子，停止继续前进（除非是第二个棋子可以吃）
        if (pieceCount >= 2) break;
      } else {
        // 没有棋子时，如果还没有跨过棋子，可以移动
        if (pieceCount === 0) {
          moves.push(newPos);
        }
      }
    }
  });

  return moves;
}

/**
 * 兵/卒的走法
 */
function getPawnMoves(board: BoardState, pos: Position, color: 'red' | 'black'): Position[] {
  const moves: Position[] = [];
  
  // 红方（下方）向上移动，黑方（上方）向下移动
  const forwardDir = color === 'red' ? -1 : 1;
  const riverRow = color === 'red' ? 4 : 5; // 过河线
  
  // 向前移动
  const forwardPos: Position = { row: pos.row + forwardDir, col: pos.col };
  if (isValidPosition(forwardPos) && canMoveTo(board, forwardPos, color)) {
    moves.push(forwardPos);
  }
  
  // 如果已过河，可以左右移动
  if ((color === 'red' && pos.row <= riverRow) || (color === 'black' && pos.row >= riverRow)) {
    const leftPos: Position = { row: pos.row, col: pos.col - 1 };
    const rightPos: Position = { row: pos.row, col: pos.col + 1 };
    
    if (isValidPosition(leftPos) && canMoveTo(board, leftPos, color)) {
      moves.push(leftPos);
    }
    if (isValidPosition(rightPos) && canMoveTo(board, rightPos, color)) {
      moves.push(rightPos);
    }
  }

  return moves;
}

/**
 * 获取棋子的所有有效移动位置
 */
export function getValidMoves(board: BoardState, pos: Position, piece: Piece): Position[] {
  switch (piece.type) {
    case 'king':
      return getKingMoves(board, pos, piece.color);
    case 'advisor':
      return getAdvisorMoves(board, pos, piece.color);
    case 'elephant':
      return getElephantMoves(board, pos, piece.color);
    case 'horse':
      return getHorseMoves(board, pos, piece.color);
    case 'rook':
      return getRookMoves(board, pos, piece.color);
    case 'cannon':
      return getCannonMoves(board, pos, piece.color);
    case 'pawn':
      return getPawnMoves(board, pos, piece.color);
    default:
      return [];
  }
}
