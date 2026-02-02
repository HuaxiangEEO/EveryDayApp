import { useState, useCallback, useMemo } from 'react';
import { GameState, BoardState, Position, createInitialBoard, positionToKey } from '../types/chess';

/**
 * 复盘状态
 */
export interface ReplayState {
  isReplaying: boolean;      // 是否处于复盘模式
  currentStep: number;       // 当前显示的步数（0表示初始状态）
}

/**
 * 复盘管理 Hook
 */
export function useReplay(gameState: GameState) {
  const [replayState, setReplayState] = useState<ReplayState>({
    isReplaying: false,
    currentStep: gameState.moves.length, // 默认显示最后一步
  });

  /**
   * 根据步数计算对应的棋盘状态
   */
  const getBoardAtStep = useCallback((step: number): BoardState => {
    if (step === 0) {
      // 初始状态
      return createInitialBoard();
    }
    
    if (step >= gameState.moves.length) {
      // 最后一步或超出范围，返回最终状态
      return gameState.board;
    }

    // 从初始状态开始，逐步应用每一步走棋
    const board = createInitialBoard();
    for (let i = 0; i < step; i++) {
      const move = gameState.moves[i];
      if (!move) continue;

      const fromKey = positionToKey(move.from);
      const toKey = positionToKey(move.to);
      const piece = board.get(fromKey);
      
      if (piece) {
        board.set(toKey, piece);
        board.delete(fromKey);
      }
    }
    
    return board;
  }, [gameState.moves, gameState.board]);

  /**
   * 获取当前复盘状态下的棋盘
   */
  const replayBoard = useMemo(() => {
    if (!replayState.isReplaying) {
      return gameState.board; // 非复盘模式，返回当前棋盘
    }
    return getBoardAtStep(replayState.currentStep);
  }, [replayState.isReplaying, replayState.currentStep, gameState.board, getBoardAtStep]);

  /**
   * 获取当前步的走棋记录
   */
  const currentMove = useMemo(() => {
    if (!replayState.isReplaying || replayState.currentStep === 0) {
      return null;
    }
    return gameState.moves[replayState.currentStep - 1] || null;
  }, [replayState.isReplaying, replayState.currentStep, gameState.moves]);

  /**
   * 进入复盘模式
   */
  const startReplay = useCallback(() => {
    setReplayState({
      isReplaying: true,
      currentStep: gameState.moves.length, // 从最后一步开始
    });
  }, [gameState.moves.length]);

  /**
   * 退出复盘模式
   */
  const stopReplay = useCallback(() => {
    setReplayState({
      isReplaying: false,
      currentStep: gameState.moves.length,
    });
  }, [gameState.moves.length]);

  /**
   * 上一步
   */
  const previousStep = useCallback(() => {
    setReplayState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  /**
   * 下一步
   */
  const nextStep = useCallback(() => {
    setReplayState(prev => ({
      ...prev,
      currentStep: Math.min(gameState.moves.length, prev.currentStep + 1),
    }));
  }, [gameState.moves.length]);

  /**
   * 跳转到第一步
   */
  const goToFirst = useCallback(() => {
    setReplayState(prev => ({
      ...prev,
      currentStep: 0,
    }));
  }, []);

  /**
   * 跳转到最后一步
   */
  const goToLast = useCallback(() => {
    setReplayState(prev => ({
      ...prev,
      currentStep: gameState.moves.length,
    }));
  }, [gameState.moves.length]);

  /**
   * 跳转到指定步数
   */
  const goToStep = useCallback((step: number) => {
    setReplayState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(gameState.moves.length, step)),
    }));
  }, [gameState.moves.length]);

  /**
   * 是否可以上一步
   */
  const canGoPrevious = replayState.currentStep > 0;

  /**
   * 是否可以下一步
   */
  const canGoNext = replayState.currentStep < gameState.moves.length;

  return {
    replayState,
    replayBoard,
    currentMove,
    startReplay,
    stopReplay,
    previousStep,
    nextStep,
    goToFirst,
    goToLast,
    goToStep,
    canGoPrevious,
    canGoNext,
    totalSteps: gameState.moves.length,
  };
}
