import { BoardState, Position, Piece, positionToKey } from '../types/chess';
import { getValidMoves } from './moveRules';

/**
 * 检查位置是否有棋子
 */
function hasPiece(board: BoardState, pos: Position): boolean {
  return board.has(positionToKey(pos));
}

/**
 * 检查是否将死
 * 将死的条件：被将军 + 无法通过以下方式解除：
 * 1. 将/帅移动到安全位置
 * 2. 吃掉正在将军的棋子
 * 3. 挡住将军路线（车、炮、兵）
 */
export function isCheckmate(board: BoardState, color: 'red' | 'black'): boolean {
  // 首先检查是否被将军
  if (!isInCheck(board, color)) {
    return false; // 没有被将军，不是将死
  }

  // 找到将/帅的位置
  let kingPosition: Position | null = null;
  board.forEach((piece, key) => {
    if (piece.type === 'king' && piece.color === color) {
      kingPosition = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
    }
  });

  if (!kingPosition) return true; // 将/帅被吃

  const kingPiece = board.get(positionToKey(kingPosition));
  if (!kingPiece) return true;

  // 方法1：检查将/帅是否可以移动到安全位置
  const kingMoves = getValidMoves(board, kingPosition, kingPiece);
  for (const move of kingMoves) {
    // 模拟移动将/帅
    const testBoard = new Map(board);
    testBoard.set(positionToKey(move), kingPiece);
    testBoard.delete(positionToKey(kingPosition));
    
    // 检查移动后是否还在被将军
    if (!isInCheck(testBoard, color)) {
      return false; // 有安全位置可以移动，不是将死
    }
  }

  // 方法2和3：检查是否可以通过其他棋子解除将军
  const opponentColor = color === 'red' ? 'black' : 'red';
  
  // 找到所有正在将军的棋子
  const checkingPieces: Array<{ position: Position; piece: Piece }> = [];
  for (const [key, piece] of board.entries()) {
    if (piece.color === opponentColor) {
      const pos: Position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
      const moves = getValidMoves(board, pos, piece);
      if (moves.some(move => move.row === kingPosition!.row && move.col === kingPosition!.col)) {
        checkingPieces.push({ position: pos, piece });
      }
    }
  }

  if (checkingPieces.length === 0) {
    return false; // 没有找到正在将军的棋子，不应该发生
  }

  // 如果有多个棋子同时将军，检查是否可以同时解除
  if (checkingPieces.length > 1) {
    // 多子将军，需要检查是否所有将军都可以解除
    // 尝试所有可能的走法，看是否能解除所有将军
    for (const [key, piece] of board.entries()) {
      if (piece.color === color) {
        const pos: Position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
        const moves = getValidMoves(board, pos, piece);
        
        for (const move of moves) {
          const testBoard = new Map(board);
          testBoard.set(positionToKey(move), piece);
          testBoard.delete(positionToKey(pos));
          
          // 检查移动后是否还在被将军
          if (!isInCheck(testBoard, color)) {
            return false; // 可以解除所有将军，不是将死
          }
        }
      }
    }
    return true; // 无法解除所有将军，是将死
  }

  // 如果只有一个棋子将军，检查是否可以解除
  const checkingPiece = checkingPieces[0];
  
  // 方法2：检查是否可以吃掉正在将军的棋子
  for (const [key, piece] of board.entries()) {
    if (piece.color === color) {
      const pos: Position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
      const moves = getValidMoves(board, pos, piece);
      if (moves.some(move => 
        move.row === checkingPiece.position.row && 
        move.col === checkingPiece.position.col
      )) {
        // 模拟吃掉正在将军的棋子
        const testBoard = new Map(board);
        testBoard.set(positionToKey(checkingPiece.position), piece);
        testBoard.delete(positionToKey(pos));
        
        // 检查吃掉后是否还在被将军
        if (!isInCheck(testBoard, color)) {
          return false; // 可以吃掉并解除将军，不是将死
        }
      }
    }
  }

  // 方法3：检查是否可以挡住将军路线（只对车、炮、兵有效）
  if (checkingPiece.piece.type === 'rook' || checkingPiece.piece.type === 'cannon' || checkingPiece.piece.type === 'pawn') {
    const blockingPositions: Position[] = [];
    const from = checkingPiece.position;
    const to = kingPosition!;
    
    // 对于炮，需要找到"山"的位置（炮和将/帅之间的棋子）
    if (checkingPiece.piece.type === 'cannon') {
      // 炮的攻击：炮 -> 山 -> 将/帅
      let screenPiece: Position | null = null;
      
      if (from.row === to.row) {
        // 同一行
        const minCol = Math.min(from.col, to.col);
        const maxCol = Math.max(from.col, to.col);
        let pieceCount = 0;
        for (let col = minCol + 1; col < maxCol; col++) {
          const pos: Position = { row: from.row, col };
          if (hasPiece(board, pos)) {
            pieceCount++;
            if (pieceCount === 1) {
              screenPiece = pos; // 第一个棋子是"山"
            }
          }
        }
      } else if (from.col === to.col) {
        // 同一列
        const minRow = Math.min(from.row, to.row);
        const maxRow = Math.max(from.row, to.row);
        let pieceCount = 0;
        for (let row = minRow + 1; row < maxRow; row++) {
          const pos: Position = { row, col: from.col };
          if (hasPiece(board, pos)) {
            pieceCount++;
            if (pieceCount === 1) {
              screenPiece = pos; // 第一个棋子是"山"
            }
          }
        }
      }
      
      // 如果找到了"山"，计算"山"和将/帅之间的位置（可以挡住的位置）
      if (screenPiece) {
        if (screenPiece.row === to.row) {
          const minCol = Math.min(screenPiece.col, to.col);
          const maxCol = Math.max(screenPiece.col, to.col);
          for (let col = minCol + 1; col < maxCol; col++) {
            blockingPositions.push({ row: screenPiece.row, col });
          }
        } else if (screenPiece.col === to.col) {
          const minRow = Math.min(screenPiece.row, to.row);
          const maxRow = Math.max(screenPiece.row, to.row);
          for (let row = minRow + 1; row < maxRow; row++) {
            blockingPositions.push({ row, col: screenPiece.col });
          }
        }
      }
    } else {
      // 对于车和兵，计算从攻击棋子到将/帅之间的所有位置
      if (from.row === to.row) {
        const minCol = Math.min(from.col, to.col);
        const maxCol = Math.max(from.col, to.col);
        for (let col = minCol + 1; col < maxCol; col++) {
          blockingPositions.push({ row: from.row, col });
        }
      } else if (from.col === to.col) {
        const minRow = Math.min(from.row, to.row);
        const maxRow = Math.max(from.row, to.row);
        for (let row = minRow + 1; row < maxRow; row++) {
          blockingPositions.push({ row, col: from.col });
        }
      }
    }

    // 检查是否可以挡住
    for (const blockPos of blockingPositions) {
      for (const [key, piece] of board.entries()) {
        if (piece.color === color) {
          const pos: Position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
          const moves = getValidMoves(board, pos, piece);
          if (moves.some(move => 
            move.row === blockPos.row && 
            move.col === blockPos.col
          )) {
            // 模拟挡住
            const testBoard = new Map(board);
            testBoard.set(positionToKey(blockPos), piece);
            testBoard.delete(positionToKey(pos));
            
            // 检查挡住后是否还在被将军
            if (!isInCheck(testBoard, color)) {
              return false; // 可以挡住并解除将军，不是将死
            }
          }
        }
      }
    }
  }

  // 所有解除方法都无效，是将死
  return true;
}

/**
 * 检查是否被将军
 */
export function isInCheck(board: BoardState, color: 'red' | 'black'): boolean {
  // 找到己方的将/帅
  let kingPosition: Position | null = null;
  board.forEach((piece, key) => {
    if (piece.type === 'king' && piece.color === color) {
      kingPosition = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
    }
  });

  if (!kingPosition) return true;

  // 检查对方所有棋子是否能攻击到将/帅
  const opponentColor = color === 'red' ? 'black' : 'red';
  for (const [key, piece] of board.entries()) {
    if (piece.color === opponentColor) {
      const pos: Position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
      const moves = getValidMoves(board, pos, piece);
      if (moves.some(move => move.row === kingPosition!.row && move.col === kingPosition!.col)) {
        return true;
      }
    }
  }

  return false;
}
