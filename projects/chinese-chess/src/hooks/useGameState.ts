import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Position, BoardState, Piece, createInitialBoard, positionToKey, MoveRecord } from '../types/chess';
import { getValidMoves as calculateValidMoves } from '../utils/moveRules';
import { isCheckmate } from '../utils/gameLogic';
import { aiChooseMove } from '../utils/ai';
import { loadGame, saveGame, deleteSavedGame } from '../utils/gameStorage';

/**
 * 游戏状态管理 Hook
 */
export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(() => {
    // 尝试加载保存的棋局
    const saved = loadGame();
    if (saved) {
      return saved;
    }
    // 否则创建新棋局
    return {
      board: createInitialBoard(),
      currentPlayer: 'red', // 红方先行
      selectedPosition: null,
      gameOver: false,
      winner: null,
      moves: [],
      currentStep: 0,
      startTime: Date.now(),
      savedGameId: undefined,
    };
  });

  // 使用ref存储最新的makeMove函数，避免闭包问题
  const makeMoveRef = useRef<(from: Position, to: Position) => void>();

  const makeMove = useCallback((from: Position, to: Position) => {
    setGameState(prev => {
      if (prev.gameOver) return prev;
      
      const board = prev.board;
      const selectedPiece = board.get(positionToKey(from));
      if (!selectedPiece) return prev;
      
      // 检查是否可以移动到目标位置
      const validMoves = calculateValidMoves(board, from, selectedPiece);
      const canMove = validMoves.some(
        move => move.row === to.row && move.col === to.col
      );
      
      if (!canMove) return prev;
      
      const newBoard = new Map(board);
      const targetKey = positionToKey(to);
      const selectedKey = positionToKey(from);
      
      // 获取被吃的棋子（如果有）
      const capturedPiece = newBoard.get(targetKey) || null;
      
      // 移动棋子
      newBoard.set(targetKey, selectedPiece);
      newBoard.delete(selectedKey);
      
      // 切换玩家后检查是否将死
      const nextPlayer = prev.currentPlayer === 'red' ? 'black' : 'red';
      const checkmate = isCheckmate(newBoard, nextPlayer);
      
      // 记录走棋
      const newMove: MoveRecord = {
        step: prev.moves.length + 1,
        from,
        to,
        piece: selectedPiece,
        capturedPiece,
        player: prev.currentPlayer,
        timestamp: Date.now(),
      };
      
      const newState = {
        ...prev,
        board: newBoard,
        selectedPosition: null,
        currentPlayer: nextPlayer,
        gameOver: checkmate,
        winner: checkmate ? prev.currentPlayer : null,
        moves: [...prev.moves, newMove],
        currentStep: prev.moves.length + 1,
        // 保留已保存的棋局ID
        savedGameId: prev.savedGameId,
      };
      
      // 游戏结束时自动保存
      if (checkmate) {
        const savedId = saveGame(newState);
        if (savedId) {
          return { ...newState, savedGameId: savedId };
        }
      }
      
      return newState;
    });
  }, []);

  // 更新ref
  makeMoveRef.current = makeMove;

  // AI自动走棋
  useEffect(() => {
    if (gameState.currentPlayer === 'black' && !gameState.gameOver) {
      const timer = setTimeout(() => {
        const aiMove = aiChooseMove(gameState.board);
        if (aiMove && makeMoveRef.current) {
          makeMoveRef.current(aiMove.from, aiMove.to);
        }
      }, 800); // AI思考时间800ms

      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.board, gameState.gameOver, makeMove]);

  const selectPosition = useCallback((position: Position) => {
    setGameState(prev => {
      if (prev.gameOver) return prev;
      
      // 如果是黑方（AI）回合，不允许手动操作
      if (prev.currentPlayer === 'black') return prev;
      
      const board = prev.board;
      const piece = board.get(positionToKey(position));
      
      // 如果点击的是已选中的位置，取消选择
      if (prev.selectedPosition?.row === position.row && 
          prev.selectedPosition?.col === position.col) {
        return { ...prev, selectedPosition: null };
      }
      
      // 如果点击的是己方棋子，选择它
      if (piece && piece.color === prev.currentPlayer) {
        return { ...prev, selectedPosition: position };
      }
      
      // 如果已选中棋子，尝试移动
      if (prev.selectedPosition) {
        makeMove(prev.selectedPosition, position);
      }
      
      return prev;
    });
  }, [makeMove]);

  const getValidMoves = useCallback((position: Position): Position[] => {
    const piece = gameState.board.get(positionToKey(position));
    if (!piece || piece.color !== gameState.currentPlayer) {
      return [];
    }
    return calculateValidMoves(gameState.board, position, piece);
  }, [gameState.board, gameState.currentPlayer]);

  const saveCurrentGame = useCallback((): string | null => {
    const savedId = saveGame(gameState);
    if (savedId) {
      // 更新 gameState 中的 savedGameId
      setGameState(prev => ({ ...prev, savedGameId: savedId }));
    }
    return savedId;
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'red',
      selectedPosition: null,
      gameOver: false,
      winner: null,
      moves: [],
      currentStep: 0,
      startTime: Date.now(),
      savedGameId: undefined, // 新游戏没有保存ID
    });
    // 不再删除所有保存，只重置当前游戏状态
  }, []);

  const loadSavedGameForReplay = useCallback(() => {
    const saved = loadGame();
    if (saved && saved.moves && saved.moves.length > 0) {
      // 更新 gameState 为保存的棋局，用于复盘
      setGameState(saved);
      return true;
    }
    return false;
  }, []);

  const loadGameById = useCallback((gameId: string) => {
    const saved = loadGame(gameId);
    if (saved) {
      setGameState(saved);
      return true;
    }
    return false;
  }, []);

  return {
    gameState,
    selectPosition,
    getValidMoves,
    saveCurrentGame,
    resetGame,
    loadSavedGameForReplay,
    loadGameById,
  };
}
