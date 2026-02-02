/**
 * 调试工具：分析棋局状态
 */
import { BoardState, Position, positionToKey } from './types/chess';
import { isInCheck, isCheckmate } from './gameLogic';
import { getValidMoves } from './moveRules';

/**
 * 分析棋局状态并输出详细信息
 */
export function analyzeBoardState(board: BoardState, currentPlayer: 'red' | 'black') {
  const opponentColor = currentPlayer === 'red' ? 'black' : 'red';
  
  console.log('=== 棋局分析 ===');
  console.log(`当前玩家: ${currentPlayer}`);
  console.log(`对方玩家: ${opponentColor}`);
  
  // 找到双方的将/帅
  let currentKing: Position | null = null;
  let opponentKing: Position | null = null;
  
  board.forEach((piece, key) => {
    if (piece.type === 'king') {
      const pos: Position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
      if (piece.color === currentPlayer) {
        currentKing = pos;
      } else {
        opponentKing = pos;
      }
    }
  });
  
  console.log(`当前玩家将/帅位置:`, currentKing);
  console.log(`对方将/帅位置:`, opponentKing);
  
  // 检查是否被将军
  const currentInCheck = isInCheck(board, currentPlayer);
  const opponentInCheck = isInCheck(board, opponentColor);
  
  console.log(`当前玩家是否被将军: ${currentInCheck}`);
  console.log(`对方是否被将军: ${opponentInCheck}`);
  
  // 检查是否将死
  const currentCheckmate = isCheckmate(board, currentPlayer);
  const opponentCheckmate = isCheckmate(board, opponentColor);
  
  console.log(`当前玩家是否将死: ${currentCheckmate}`);
  console.log(`对方是否将死: ${opponentCheckmate}`);
  
  // 如果对方被将军，找出所有正在将军的棋子
  if (opponentInCheck && opponentKing) {
    console.log('\n=== 正在将军的棋子 ===');
    board.forEach((piece, key) => {
      if (piece.color === currentPlayer) {
        const pos: Position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
        const moves = getValidMoves(board, pos, piece);
        if (moves.some(move => move.row === opponentKing!.row && move.col === opponentKing!.col)) {
          console.log(`${piece.type}(${piece.color}) at (${pos.row}, ${pos.col}) 正在将军`);
        }
      }
    });
  }
  
  // 如果对方被将死，分析为什么无法解除
  if (opponentCheckmate && opponentKing) {
    console.log('\n=== 将死分析 ===');
    const opponentKingPiece = board.get(positionToKey(opponentKing));
    if (opponentKingPiece) {
      const kingMoves = getValidMoves(board, opponentKing, opponentKingPiece);
      console.log(`将/帅可以移动的位置: ${kingMoves.length}个`);
      kingMoves.forEach(move => {
        const testBoard = new Map(board);
        testBoard.set(positionToKey(move), opponentKingPiece);
        testBoard.delete(positionToKey(opponentKing));
        const stillInCheck = isInCheck(testBoard, opponentColor);
        console.log(`  移动到 (${move.row}, ${move.col}): ${stillInCheck ? '仍被将军' : '安全'}`);
      });
    }
  }
  
  return {
    currentInCheck,
    opponentInCheck,
    currentCheckmate,
    opponentCheckmate,
  };
}
