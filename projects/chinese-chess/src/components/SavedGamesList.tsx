import { SavedGameInfo } from '../utils/gameStorage';
import './SavedGamesList.css';

interface SavedGamesListProps {
  games: SavedGameInfo[];
  onLoad: (gameId: string, forReplay?: boolean) => void;
  onDelete: (gameId: string) => void;
  onClose: () => void;
}

/**
 * 已保存棋局列表组件
 */
export default function SavedGamesList({ games, onLoad, onDelete, onClose }: SavedGamesListProps) {
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      // 今天
      return `今天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (days === 1) {
      // 昨天
      return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else if (days < 7) {
      // 一周内
      return `${days}天前 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } else {
      // 更早
      return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    }
  };

  const getGameStatus = (game: SavedGameInfo): string => {
    if (game.gameOver) {
      if (game.winner === 'red') return '红方胜';
      if (game.winner === 'black') return '黑方胜';
      return '平局';
    }
    return `进行中 (${game.totalMoves}步)`;
  };

  if (games.length === 0) {
    return (
      <div className="saved-games-list-overlay" onClick={onClose}>
        <div className="saved-games-list" onClick={(e) => e.stopPropagation()}>
          <div className="saved-games-list-header">
            <h3>已保存的棋局</h3>
            <button className="btn-close" onClick={onClose}>×</button>
          </div>
          <div className="saved-games-list-empty">
            <p>暂无保存的棋局</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-games-list-overlay" onClick={onClose}>
      <div className="saved-games-list" onClick={(e) => e.stopPropagation()}>
        <div className="saved-games-list-header">
          <h3>已保存的棋局 ({games.length})</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="saved-games-list-content">
          {games.map((game) => (
            <div key={game.id} className="saved-game-item">
              <div className="saved-game-info">
                <div className="saved-game-time">{formatTime(game.timestamp)}</div>
                <div className="saved-game-status">{getGameStatus(game)}</div>
              </div>
              <div className="saved-game-actions">
                {game.gameOver ? (
                  // 游戏已结束，只能复盘
                  <button
                    className="btn btn-replay"
                    onClick={() => onLoad(game.id, true)}
                    title="复盘棋局"
                  >
                    📖 复盘
                  </button>
                ) : (
                  // 游戏未结束，可以继续对弈或复盘
                  <>
                    <button
                      className="btn btn-continue"
                      onClick={() => onLoad(game.id, false)}
                      title="继续对弈"
                    >
                      ▶️ 继续
                    </button>
                    {game.totalMoves > 0 && (
                      <button
                        className="btn btn-replay"
                        onClick={() => onLoad(game.id, true)}
                        title="复盘棋局"
                      >
                        📖 复盘
                      </button>
                    )}
                  </>
                )}
                <button
                  className="btn btn-delete"
                  onClick={() => {
                    if (window.confirm('确定要删除这个棋局吗？')) {
                      onDelete(game.id);
                    }
                  }}
                  title="删除棋局"
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
