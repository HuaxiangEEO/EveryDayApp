import { ReactNode } from 'react';
import { Position } from '../types/chess';
import './ChessBoard.css';

interface ChessBoardProps {
  onCellClick: (position: Position) => void;
  selectedPosition: Position | null;
  validMoves: Position[];
  children?: ReactNode; // 棋子层
}

/**
 * 棋盘组件
 * 9列 x 10行的中国象棋棋盘
 */
export default function ChessBoard({ onCellClick, selectedPosition, validMoves, children }: ChessBoardProps) {
  const rows = 10;
  const cols = 9;

  const handleCellClick = (row: number, col: number) => {
    onCellClick({ row, col });
  };

  const isSelected = (row: number, col: number) => {
    return selectedPosition?.row === row && selectedPosition?.col === col;
  };

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(pos => pos.row === row && pos.col === col);
  };

  const isRiver = (row: number) => {
    return row === 4 || row === 5;
  };

  const isPalace = (row: number, col: number) => {
    // 黑方九宫（0-2行，3-5列）
    if (row >= 0 && row <= 2 && col >= 3 && col <= 5) return true;
    // 红方九宫（7-9行，3-5列）
    if (row >= 7 && row <= 9 && col >= 3 && col <= 5) return true;
    return false;
  };

  return (
    <div className="chess-board">
      <div className="board-container">
        {/* 棋盘网格 */}
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="board-row">
            {Array.from({ length: cols }).map((_, col) => {
              const cellKey = `${row}-${col}`;
              const selected = isSelected(row, col);
              const validMove = isValidMove(row, col);
              
              return (
                <div
                  key={cellKey}
                  className={`board-cell ${selected ? 'selected' : ''} ${validMove ? 'valid-move' : ''} ${isPalace(row, col) ? 'palace' : ''}`}
                  onClick={() => handleCellClick(row, col)}
                >
                  {/* 交叉点 */}
                  <div className="intersection" />
                  
                  {/* 九宫斜线 */}
                  {isPalace(row, col) && (
                    <>
                      {(row === 0 && col === 3) || (row === 2 && col === 5) ? (
                        <div className="diagonal-line diagonal-top-right" />
                      ) : null}
                      {(row === 0 && col === 5) || (row === 2 && col === 3) ? (
                        <div className="diagonal-line diagonal-top-left" />
                      ) : null}
                      {(row === 7 && col === 3) || (row === 9 && col === 5) ? (
                        <div className="diagonal-line diagonal-bottom-right" />
                      ) : null}
                      {(row === 7 && col === 5) || (row === 9 && col === 3) ? (
                        <div className="diagonal-line diagonal-bottom-left" />
                      ) : null}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        
        {/* 楚河汉界分隔线 */}
        <div className="river-divider" />
        
        {/* 楚河汉界 */}
        <div className="river-label river-top">楚河</div>
        <div className="river-label river-bottom">汉界</div>
        
        {/* 棋子层 */}
        {children && (
          <div className="pieces-layer">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
