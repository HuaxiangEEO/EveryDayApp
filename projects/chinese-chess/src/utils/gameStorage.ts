/**
 * 棋局保存和加载工具
 * 使用localStorage持久化棋局数据
 * 支持多个棋局保存，按时间戳命名
 */

import { GameState, BoardState, Position, Piece, PieceColor, positionToKey, keyToPosition } from '../types/chess';

const SAVE_KEY_PREFIX = 'chinese-chess-game-';
const SAVE_LIST_KEY = 'chinese-chess-saved-games-list';

// 保存的棋局信息
export interface SavedGameInfo {
  id: string;           // 唯一标识（时间戳）
  timestamp: number;    // 保存时间戳
  gameOver: boolean;    // 是否结束
  winner: string | null; // 获胜方
  totalMoves: number;   // 总步数
  startTime?: number;   // 开始时间
}

// 保存的棋局数据（包含完整信息）
interface SavedGameData {
  id: string;
  board: Array<{ key: string; piece: Piece }>;
  currentPlayer: PieceColor;
  selectedPosition: Position | null;
  gameOver: boolean;
  winner: PieceColor | null;
  moves: any[];
  currentStep: number;
  startTime: number;
  timestamp: number;
}

/**
 * 将棋盘状态转换为可序列化的格式
 */
function serializeBoard(board: BoardState): Array<{ key: string; piece: Piece }> {
  const result: Array<{ key: string; piece: Piece }> = [];
  board.forEach((piece, key) => {
    result.push({ key, piece });
  });
  return result;
}

/**
 * 将序列化的棋盘状态恢复为BoardState
 */
function deserializeBoard(data: Array<{ key: string; piece: Piece }>): BoardState {
  const board = new Map<string, Piece>();
  data.forEach(({ key, piece }) => {
    board.set(key, piece);
  });
  return board;
}

/**
 * 保存棋局
 * 如果 gameState.savedGameId 存在，则更新已有保存；否则创建新保存
 */
export function saveGame(gameState: GameState): string | null {
  try {
    const timestamp = Date.now();
    let gameId: string;
    let isUpdate = false;
    
    // 如果已有保存ID，更新该保存；否则创建新保存
    if (gameState.savedGameId) {
      gameId = gameState.savedGameId;
      isUpdate = true;
    } else {
      gameId = timestamp.toString();
    }
    
    const saveData: SavedGameData = {
      id: gameId,
      board: serializeBoard(gameState.board),
      currentPlayer: gameState.currentPlayer,
      selectedPosition: gameState.selectedPosition,
      gameOver: gameState.gameOver,
      winner: gameState.winner,
      moves: gameState.moves || [],
      currentStep: gameState.currentStep || 0,
      startTime: gameState.startTime || timestamp,
      timestamp: isUpdate ? (() => {
        // 更新时保留原始保存时间，但更新时间戳用于排序
        const existing = localStorage.getItem(SAVE_KEY_PREFIX + gameId);
        if (existing) {
          try {
            const existingData = JSON.parse(existing);
            return existingData.timestamp || timestamp;
          } catch (e) {
            return timestamp;
          }
        }
        return timestamp;
      })() : timestamp,
    };
    
    // 保存棋局数据
    const saveKey = SAVE_KEY_PREFIX + gameId;
    localStorage.setItem(saveKey, JSON.stringify(saveData));
    
    // 更新保存列表
    const gameInfo: SavedGameInfo = {
      id: gameId,
      timestamp: saveData.timestamp,
      gameOver: gameState.gameOver,
      winner: gameState.winner,
      totalMoves: gameState.moves?.length || 0,
      startTime: gameState.startTime || timestamp,
    };
    
    if (isUpdate) {
      // 更新列表中的项
      updateSavedGamesList(gameInfo);
    } else {
      // 添加到列表
      addToSavedGamesList(gameInfo);
    }
    
    return gameId;
  } catch (error) {
    console.error('保存棋局失败:', error);
    return null;
  }
}

/**
 * 添加到保存列表
 */
function addToSavedGamesList(gameInfo: SavedGameInfo): void {
  try {
    const listStr = localStorage.getItem(SAVE_LIST_KEY);
    const list: SavedGameInfo[] = listStr ? JSON.parse(listStr) : [];
    
    // 添加到列表开头（最新的在前面）
    list.unshift(gameInfo);
    
    // 限制最多保存50个棋局
    if (list.length > 50) {
      // 删除最旧的
      const removed = list.pop();
      if (removed) {
        localStorage.removeItem(SAVE_KEY_PREFIX + removed.id);
      }
    }
    
    localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('更新保存列表失败:', error);
  }
}

/**
 * 更新保存列表中的项
 */
function updateSavedGamesList(gameInfo: SavedGameInfo): void {
  try {
    const listStr = localStorage.getItem(SAVE_LIST_KEY);
    if (!listStr) {
      // 如果列表不存在，创建新列表
      addToSavedGamesList(gameInfo);
      return;
    }
    
    const list: SavedGameInfo[] = JSON.parse(listStr);
    const index = list.findIndex(item => item.id === gameInfo.id);
    
    if (index >= 0) {
      // 更新现有项
      list[index] = gameInfo;
    } else {
      // 如果找不到，添加到列表开头
      list.unshift(gameInfo);
    }
    
    localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('更新保存列表失败:', error);
  }
}

/**
 * 加载指定的棋局
 */
export function loadGame(gameId?: string): GameState | null {
  try {
    let saveKey: string;
    
    if (gameId) {
      // 加载指定的棋局
      saveKey = SAVE_KEY_PREFIX + gameId;
    } else {
      // 兼容旧版本：尝试加载旧的单棋局保存
      const oldSave = localStorage.getItem('chinese-chess-saved-game');
      if (oldSave) {
        const saveData = JSON.parse(oldSave);
        // 兼容旧版本数据（没有 moves 字段）
        const moves = saveData.moves || [];
        const currentStep = saveData.currentStep !== undefined ? saveData.currentStep : moves.length;
        
        return {
          board: deserializeBoard(saveData.board),
          currentPlayer: saveData.currentPlayer,
          selectedPosition: saveData.selectedPosition,
          gameOver: saveData.gameOver || false,
          winner: saveData.winner || null,
          moves,
          currentStep,
          startTime: saveData.startTime || saveData.timestamp || Date.now(),
        };
      }
      
      // 加载最新的棋局
      const list = getSavedGamesList();
      if (list.length === 0) return null;
      saveKey = SAVE_KEY_PREFIX + list[0].id;
    }
    
    const saved = localStorage.getItem(saveKey);
    if (!saved) return null;
    
    const saveData: SavedGameData = JSON.parse(saved);
    
    // 兼容旧版本数据（没有 moves 字段）
    const moves = saveData.moves || [];
    const currentStep = saveData.currentStep !== undefined ? saveData.currentStep : moves.length;
    
    return {
      board: deserializeBoard(saveData.board),
      currentPlayer: saveData.currentPlayer,
      selectedPosition: saveData.selectedPosition,
      gameOver: saveData.gameOver || false,
      winner: saveData.winner || null,
      moves,
      currentStep,
      startTime: saveData.startTime || saveData.timestamp || Date.now(),
      savedGameId: saveData.id, // 加载时恢复保存ID
    };
  } catch (error) {
    console.error('加载棋局失败:', error);
    return null;
  }
}

/**
 * 检查是否有保存的棋局
 */
export function hasSavedGame(): boolean {
  const list = getSavedGamesList();
  return list.length > 0;
}

/**
 * 删除指定的保存棋局
 */
export function deleteSavedGame(gameId?: string): void {
  if (gameId) {
    // 删除指定的棋局
    localStorage.removeItem(SAVE_KEY_PREFIX + gameId);
    
    // 从列表中移除
    const listStr = localStorage.getItem(SAVE_LIST_KEY);
    if (listStr) {
      const list: SavedGameInfo[] = JSON.parse(listStr);
      const filtered = list.filter(item => item.id !== gameId);
      localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(filtered));
    }
  } else {
    // 兼容旧版本：删除旧的单棋局保存
    localStorage.removeItem('chinese-chess-saved-game');
  }
}

/**
 * 获取所有保存的棋局列表
 */
export function getSavedGamesList(): SavedGameInfo[] {
  try {
    const listStr = localStorage.getItem(SAVE_LIST_KEY);
    if (!listStr) return [];
    
    const list: SavedGameInfo[] = JSON.parse(listStr);
    // 按时间戳降序排序（最新的在前）
    return list.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('获取保存列表失败:', error);
    return [];
  }
}

/**
 * 获取保存时间（兼容旧版本）
 */
export function getSaveTime(): number | null {
  const list = getSavedGamesList();
  if (list.length > 0) {
    return list[0].timestamp;
  }
  return null;
}
