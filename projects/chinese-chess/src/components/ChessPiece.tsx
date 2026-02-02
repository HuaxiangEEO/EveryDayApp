import { Piece, Position } from '../types/chess';
import './ChessPiece.css';

interface ChessPieceProps {
  piece: Piece;
  position: Position;
  isSelected: boolean;
  isHighlighted?: boolean; // 复盘模式下高亮显示
  onClick: () => void;
}

/**
 * 棋子组件
 */
export default function ChessPiece({ piece, position, isSelected, isHighlighted = false, onClick }: ChessPieceProps) {
  const pieceName = getPieceName(piece.type, piece.color);
  
  // 计算棋子在棋盘上的位置（百分比）
  // 棋盘是9列10行，每个格子中心点位置
  const leftPercent = ((position.col + 0.5) / 9) * 100;
  const topPercent = ((position.row + 0.5) / 10) * 100;
  
  return (
    <div
      className={`chess-piece ${piece.color} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
      style={{
        left: `calc(${leftPercent}% - 4%)`, // 棋子宽度是8%，所以减去4%使其居中
        top: `calc(${topPercent}% - 4%)`,   // 棋子高度是8%，所以减去4%使其居中
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span className="piece-text">{pieceName}</span>
    </div>
  );
}

/**
 * 获取棋子显示名称
 */
function getPieceName(type: Piece['type'], color: Piece['color']): string {
  const names: Record<Piece['type'], { red: string; black: string }> = {
    king: { red: '帅', black: '将' },
    advisor: { red: '仕', black: '士' },
    elephant: { red: '相', black: '象' },
    horse: { red: '马', black: '马' },
    rook: { red: '车', black: '车' },
    cannon: { red: '炮', black: '炮' },
    pawn: { red: '兵', black: '卒' },
  };
  return names[type][color];
}
