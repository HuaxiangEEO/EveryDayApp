import { BoardState, Position, Piece, positionToKey } from '../types/chess';
import { getValidMoves } from './moveRules';
import { isInCheck, isCheckmate } from './gameLogic';

/**
 * 棋子价值评估
 */
const PIECE_VALUES: Record<Piece['type'], number> = {
  king: 10000,    // 将/帅价值最高
  advisor: 20,    // 士/仕
  elephant: 20,   // 象/相
  horse: 40,      // 马
  rook: 90,       // 车
  cannon: 45,     // 炮
  pawn: 10,       // 兵/卒
};

/**
 * 位置价值表（鼓励棋子向前推进）
 */
function getPositionValue(pos: Position, color: 'red' | 'black'): number {
  // 红方（下方）向前是row减小，黑方（上方）向前是row增大
  const forwardValue = color === 'red' ? (9 - pos.row) * 2 : pos.row * 2;
  // 中心位置更有价值
  const centerValue = Math.abs(pos.col - 4) <= 1 ? 3 : 0;
  return forwardValue + centerValue;
}

/**
 * 评估棋盘状态（对黑方有利为正）
 */
function evaluateBoard(board: BoardState): number {
  let score = 0;
  
  board.forEach((piece, key) => {
    const pos: Position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
    const pieceValue = PIECE_VALUES[piece.type];
    const positionValue = getPositionValue(pos, piece.color);
    const totalValue = pieceValue + positionValue;
    
    if (piece.color === 'black') {
      score += totalValue;
    } else {
      score -= totalValue;
    }
  });
  
  return score;
}

/**
 * 评估走法（改进版）
 */
function evaluateMove(
  board: BoardState,
  from: Position,
  to: Position,
  piece: Piece
): number {
  let score = 0;
  
  // 检查是否能吃子
  const targetPiece = board.get(positionToKey(to));
  if (targetPiece) {
    // 吃子价值 = 目标棋子价值 - 己方棋子价值（考虑交换）
    const exchangeValue = PIECE_VALUES[targetPiece.type] - PIECE_VALUES[piece.type];
    score += exchangeValue * 15; // 吃子优先
    
    // 如果吃的是将/帅，给很高分数
    if (targetPiece.type === 'king') {
      score += 1000000;
    }
  }
  
  // 模拟移动
  const newBoard = new Map(board);
  newBoard.set(positionToKey(to), piece);
  newBoard.delete(positionToKey(from));
  
  // 检查移动后是否会被将军（避免送子）
  if (isInCheck(newBoard, piece.color)) {
    score -= 2000; // 避免被将军
  }
  
  // 检查移动后是否能将军对方
  const opponentColor = piece.color === 'red' ? 'black' : 'red';
  if (isInCheck(newBoard, opponentColor)) {
    score += 1000; // 能将军对方
    
    // 如果能将死对方，给极高分数
    if (isCheckmate(newBoard, opponentColor)) {
      score += 50000;
    }
  }
  
  // 位置价值变化
  const fromValue = getPositionValue(from, piece.color);
  const toValue = getPositionValue(to, piece.color);
  score += (toValue - fromValue) * 2; // 向前推进加分
  
  // 棋子协调性
  // 车、马、炮配合加分
  if (piece.type === 'rook' || piece.type === 'horse' || piece.type === 'cannon') {
    // 检查是否有其他己方棋子在同一区域
    let nearbyAllies = 0;
    board.forEach((otherPiece, key) => {
      if (otherPiece.color === piece.color && otherPiece.type !== 'king') {
        const otherPos: Position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
        const distance = Math.abs(otherPos.row - to.row) + Math.abs(otherPos.col - to.col);
        if (distance <= 3) {
          nearbyAllies++;
        }
      }
    });
    score += nearbyAllies * 5; // 棋子配合加分
  }
  
  // 保护重要棋子
  if (piece.type === 'king' || piece.type === 'advisor' || piece.type === 'elephant') {
    // 检查移动后是否暴露重要棋子
    const kingPos = piece.type === 'king' ? to : null;
    if (kingPos) {
      // 检查将/帅周围是否有保护
      let protection = 0;
      const directions = [
        { row: -1, col: 0 }, { row: 1, col: 0 },
        { row: 0, col: -1 }, { row: 0, col: 1 },
      ];
      directions.forEach(dir => {
        const checkPos: Position = { row: kingPos.row + dir.row, col: kingPos.col + dir.col };
        const checkPiece = newBoard.get(positionToKey(checkPos));
        if (checkPiece && checkPiece.color === piece.color) {
          protection++;
        }
      });
      score += protection * 10;
    }
  }
  
  // 控制关键位置
  // 控制中心、过河位置等
  if ((to.row === 4 || to.row === 5) && (to.col >= 3 && to.col <= 5)) {
    score += 10; // 控制中心
  }
  
  // 过河加分（对于兵/卒）
  if (piece.type === 'pawn') {
    const riverRow = piece.color === 'red' ? 4 : 5;
    if ((piece.color === 'red' && to.row <= riverRow) || 
        (piece.color === 'black' && to.row >= riverRow)) {
      score += 15; // 过河加分
    }
  }
  
  return score;
}

/**
 * Minimax算法（简化版，2层搜索）
 */
function minimax(
  board: BoardState,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): number {
  // 如果达到最大深度或游戏结束，返回评估值
  if (depth === 0) {
    return evaluateBoard(board);
  }
  
  // 检查是否将死
  const blackCheckmate = isCheckmate(board, 'black');
  const redCheckmate = isCheckmate(board, 'red');
  
  if (blackCheckmate) return -100000; // 黑方被将死
  if (redCheckmate) return 100000;    // 红方被将死
  
  const currentColor = isMaximizing ? 'black' : 'red';
  let bestScore = isMaximizing ? -Infinity : Infinity;
  
  // 生成所有可能的走法
  const moves: Array<{ from: Position; to: Position; piece: Piece }> = [];
  for (const [key, piece] of board.entries()) {
    if (piece.color === currentColor) {
      const from: Position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
      const validMoves = getValidMoves(board, from, piece);
      validMoves.forEach(to => {
        moves.push({ from, to, piece });
      });
    }
  }
  
  // 按评估值排序，优先搜索好的走法（alpha-beta剪枝优化）
  moves.sort((a, b) => {
    const scoreA = evaluateMove(board, a.from, a.to, a.piece);
    const scoreB = evaluateMove(board, b.from, b.to, b.piece);
    return isMaximizing ? scoreB - scoreA : scoreA - scoreB;
  });
  
  // 限制搜索的走法数量（提高性能）
  const maxMoves = Math.min(moves.length, 15);
  
  for (let i = 0; i < maxMoves; i++) {
    const move = moves[i];
    
    // 模拟移动
    const newBoard = new Map(board);
    newBoard.set(positionToKey(move.to), move.piece);
    newBoard.delete(positionToKey(move.from));
    
    // 递归搜索
    const score = minimax(newBoard, depth - 1, !isMaximizing, alpha, beta);
    
    if (isMaximizing) {
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);
    } else {
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, score);
    }
    
    // Alpha-Beta剪枝
    if (beta <= alpha) {
      break;
    }
  }
  
  return bestScore;
}

/**
 * AI选择最佳走法（使用Minimax算法）
 */
export function aiChooseMove(board: BoardState): { from: Position; to: Position } | null {
  const moves: Array<{ from: Position; to: Position; score: number }> = [];
  
  // 遍历所有黑方棋子
  for (const [key, piece] of board.entries()) {
    if (piece.color !== 'black') continue;
    
    const from: Position = {
      row: parseInt(key.split(',')[0]),
      col: parseInt(key.split(',')[1]),
    };
    
    // 获取该棋子的所有合法走法
    const validMoves = getValidMoves(board, from, piece);
    
    // 评估每个走法
    validMoves.forEach(to => {
      // 基础评估
      const baseScore = evaluateMove(board, from, to, piece);
      
      // 使用Minimax搜索（2层）
      const testBoard = new Map(board);
      testBoard.set(positionToKey(to), piece);
      testBoard.delete(positionToKey(from));
      
      const minimaxScore = minimax(testBoard, 2, false, -Infinity, Infinity);
      
      // 综合评分：基础评估 + Minimax评估（加权）
      const finalScore = baseScore * 0.7 + minimaxScore * 0.3;
      
      moves.push({ from, to, score: finalScore });
    });
  }
  
  if (moves.length === 0) return null;
  
  // 按分数排序
  moves.sort((a, b) => b.score - a.score);
  
  // 选择前3个最佳走法中的一个（增加随机性，避免过于机械）
  const topMoves = moves.slice(0, Math.min(3, moves.length));
  const chosenMove = topMoves[Math.floor(Math.random() * topMoves.length)];
  
  return {
    from: chosenMove.from,
    to: chosenMove.to,
  };
}
