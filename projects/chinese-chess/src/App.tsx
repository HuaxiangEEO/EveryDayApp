import { useMemo, useState, useEffect, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { useReplay } from './hooks/useReplay';
import ChessBoard from './components/ChessBoard';
import ChessPiece from './components/ChessPiece';
import ReplayControls from './components/ReplayControls';
import SavedGamesList from './components/SavedGamesList';
import { Position } from './types/chess';
import { hasSavedGame, loadGame, getSavedGamesList, deleteSavedGame, SavedGameInfo } from './utils/gameStorage';
import './App.css';

/**
 * 主应用组件
 * 中国象棋对战游戏
 */
function App() {
  const { gameState, selectPosition, getValidMoves, saveCurrentGame, resetGame, loadSavedGameForReplay, loadGameById } = useGameState();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [hasSaved, setHasSaved] = useState(hasSavedGame());
  const [showSavedGamesList, setShowSavedGamesList] = useState(false);
  const [savedGamesList, setSavedGamesList] = useState<SavedGameInfo[]>([]);
  
  // 刷新保存的棋局列表
  const refreshSavedGamesList = useCallback(() => {
    const list = getSavedGamesList();
    setSavedGamesList(list);
    setHasSaved(list.length > 0);
  }, []);
  
  // 检查是否有保存的棋局（用于显示按钮）
  const hasAnySavedGames = useMemo(() => {
    return savedGamesList.length > 0 || getSavedGamesList().length > 0;
  }, [savedGamesList.length]);
  
  // 加载保存的棋局列表
  useEffect(() => {
    if (showSavedGamesList) {
      refreshSavedGamesList();
    }
  }, [showSavedGamesList, refreshSavedGamesList]);
  
  // 初始化时检查是否有保存的棋局
  useEffect(() => {
    refreshSavedGamesList();
  }, [refreshSavedGamesList]);
  
  // 检查是否有可复盘的记录
  const hasReplayableGame = useMemo(() => {
    // 如果当前游戏有走棋记录，可以复盘
    if (gameState.moves && gameState.moves.length > 0) return true;
    // 检查 localStorage 中是否有保存的棋局记录
    try {
      const saved = localStorage.getItem('chinese-chess-saved-game');
      if (saved) {
        const saveData = JSON.parse(saved);
        // 检查是否有 moves 数组且长度大于0
        if (saveData.moves && Array.isArray(saveData.moves) && saveData.moves.length > 0) {
          return true;
        }
      }
    } catch (e) {
      console.error('检查复盘记录失败:', e);
    }
    return false;
  }, [gameState.moves.length, hasSaved]);
  
  // 复盘功能
  const {
    replayState,
    replayBoard,
    currentMove,
    startReplay,
    stopReplay,
    previousStep,
    nextStep,
    goToFirst,
    goToLast,
    canGoPrevious,
    canGoNext,
    totalSteps,
  } = useReplay(gameState);

  // 根据复盘状态决定使用哪个棋盘
  const displayBoard = replayState.isReplaying ? replayBoard : gameState.board;
  
  // 复盘模式下禁用棋盘交互
  const handleCellClick = (position: Position) => {
    if (replayState.isReplaying) return; // 复盘模式下不允许走棋
    selectPosition(position);
  };

  // 计算有效移动位置（复盘模式下不显示）
  const validMoves = useMemo(() => {
    if (replayState.isReplaying || !gameState.selectedPosition) return [];
    return getValidMoves(gameState.selectedPosition);
  }, [replayState.isReplaying, gameState.selectedPosition, getValidMoves]);

  // 获取最近一步走棋（非复盘模式下）
  const lastMove = useMemo(() => {
    if (replayState.isReplaying) return null;
    if (gameState.moves && gameState.moves.length > 0) {
      return gameState.moves[gameState.moves.length - 1];
    }
    return null;
  }, [gameState.moves, replayState.isReplaying]);

  // 渲染棋子
  const renderPieces = () => {
    const pieces: JSX.Element[] = [];
    displayBoard.forEach((piece, key) => {
      const position = { row: parseInt(key.split(',')[0]), col: parseInt(key.split(',')[1]) };
      
      // 复盘模式下高亮当前步的走棋
      let isHighlighted = false;
      if (replayState.isReplaying && currentMove) {
        const fromMatch = position.row === currentMove.from.row && position.col === currentMove.from.col;
        const toMatch = position.row === currentMove.to.row && position.col === currentMove.to.col;
        isHighlighted = fromMatch || toMatch;
      } else if (!replayState.isReplaying && lastMove) {
        // 非复盘模式下高亮最近一步走棋
        const fromMatch = position.row === lastMove.from.row && position.col === lastMove.from.col;
        const toMatch = position.row === lastMove.to.row && position.col === lastMove.to.col;
        isHighlighted = fromMatch || toMatch;
      }
      
      const isSelected = !replayState.isReplaying && 
                         gameState.selectedPosition?.row === position.row && 
                         gameState.selectedPosition?.col === position.col;
      
      pieces.push(
        <ChessPiece
          key={piece.id}
          piece={piece}
          position={position}
          isSelected={isSelected}
          isHighlighted={isHighlighted}
          onClick={() => {
            if (!replayState.isReplaying) {
              selectPosition(position);
            }
          }}
        />
      );
    });
    return pieces;
  };

  const getCurrentPlayerName = () => {
    return gameState.currentPlayer === 'red' ? '红方' : '黑方';
  };

  const handleSave = () => {
    const gameId = saveCurrentGame();
    if (gameId) {
      setShowSaveSuccess(true);
      setHasSaved(true);
      // 更新列表
      setSavedGamesList(getSavedGamesList());
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }
  };
  
  // 加载指定的棋局
  const handleLoadGame = (gameId: string, forReplay: boolean = false) => {
    const saved = loadGame(gameId);
    if (saved && loadGameById(gameId)) {
      setShowSavedGamesList(false);
      setHasSaved(true);
      
      if (forReplay) {
        // 如果选择复盘，直接进入复盘模式
        if (saved.moves && saved.moves.length > 0) {
          setTimeout(() => {
            startReplay();
          }, 100);
        }
      } else {
        // 如果选择继续对弈，显示最终状态
        // 用户可以继续走棋或点击"复盘"按钮查看走棋过程
      }
    }
  };
  
  // 删除指定的棋局
  const handleDeleteGame = (gameId: string) => {
    deleteSavedGame(gameId);
    refreshSavedGamesList();
  };

  const handleReset = () => {
    if (window.confirm('确定要重新开始游戏吗？当前棋局将被清除。')) {
      resetGame();
      setHasSaved(false);
    }
  };

  // 处理复盘按钮点击
  const handleStartReplay = () => {
    // 如果当前游戏没有走棋记录，尝试从 localStorage 加载保存的记录
    if (!gameState.moves || gameState.moves.length === 0) {
      const saved = loadGame();
      if (saved && saved.moves && saved.moves.length > 0) {
        // 加载保存的记录
        loadSavedGameForReplay();
        // 等待状态更新后再启动复盘
        setTimeout(() => {
          startReplay();
        }, 100);
        return;
      } else {
        alert('没有可复盘的记录');
        return;
      }
    }
    // 当前游戏有走棋记录，直接启动复盘
    startReplay();
  };


  return (
    <div className="app">
      <header className="app-header">
        <h1>中国象棋</h1>
        <p className="subtitle">人机对战游戏</p>
      </header>

      <main className="main-content">
        <div className="game-container">
          <div className="game-info">
            <div className="current-player">
              <span className="player-label">当前玩家：</span>
              <span className={`player-name ${gameState.currentPlayer}`}>
                {getCurrentPlayerName()}
              </span>
              {gameState.currentPlayer === 'black' && (
                <span className="ai-thinking">🤖 AI思考中...</span>
              )}
            </div>
            {gameState.gameOver ? (
              <div className="game-over">
                {gameState.winner ? (
                  <>游戏结束！{gameState.winner === 'red' ? '红方' : '黑方'}获胜！</>
                ) : (
                  <>游戏结束！平局</>
                )}
              </div>
            ) : null}
            
            <div className="game-controls">
              {!replayState.isReplaying && (
                <>
                  <button 
                    className="btn btn-save" 
                    onClick={handleSave}
                  >
                    💾 保存棋局
                  </button>
                  <button 
                    className="btn btn-reset" 
                    onClick={handleReset}
                  >
                    🔄 重新开始
                  </button>
                  {hasReplayableGame && (
                    <button 
                      className="btn btn-replay-start" 
                      onClick={handleStartReplay}
                    >
                      📖 复盘
                    </button>
                  )}
                  {hasAnySavedGames && (
                    <button 
                      className="btn btn-list" 
                      onClick={() => setShowSavedGamesList(true)}
                    >
                      📋 已保存的棋局
                    </button>
                  )}
                  {showSaveSuccess && (
                    <span className="save-success">✓ 已保存</span>
                  )}
                </>
              )}
            </div>
            
            {/* 复盘控制面板 */}
            {replayState.isReplaying && (
              <ReplayControls
                currentStep={replayState.currentStep}
                totalSteps={totalSteps}
                currentMove={currentMove}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                onPrevious={previousStep}
                onNext={nextStep}
                onFirst={goToFirst}
                onLast={goToLast}
                onStop={stopReplay}
              />
            )}
          </div>
          
          <div className="board-wrapper">
            <ChessBoard
              onCellClick={handleCellClick}
              selectedPosition={replayState.isReplaying ? null : gameState.selectedPosition}
              validMoves={validMoves}
            >
              {renderPieces()}
            </ChessBoard>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 中国象棋对战游戏</p>
      </footer>
      
      {/* 已保存棋局列表 */}
      {showSavedGamesList && (
        <SavedGamesList
          games={savedGamesList}
          onLoad={handleLoadGame}
          onDelete={handleDeleteGame}
          onClose={() => setShowSavedGamesList(false)}
        />
      )}
    </div>
  );
}

export default App;
