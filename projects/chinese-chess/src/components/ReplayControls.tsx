import { MoveRecord } from '../types/chess';
import './ReplayControls.css';

interface ReplayControlsProps {
  currentStep: number;
  totalSteps: number;
  currentMove: MoveRecord | null;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFirst: () => void;
  onLast: () => void;
  onStop: () => void;
}

/**
 * 复盘控制面板组件
 */
export default function ReplayControls({
  currentStep,
  totalSteps,
  currentMove,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onFirst,
  onLast,
  onStop,
}: ReplayControlsProps) {
  const getMoveDescription = (move: MoveRecord | null): string => {
    if (!move) return '初始状态';
    
    const playerName = move.player === 'red' ? '红方' : '黑方';
    const pieceName = getPieceName(move.piece.type);
    const captureText = move.capturedPiece ? `吃${getPieceName(move.capturedPiece.type)}` : '';
    
    return `${playerName}：${pieceName}${captureText}`;
  };

  const getPieceName = (type: string): string => {
    const names: Record<string, string> = {
      king: '将',
      advisor: '士',
      elephant: '象',
      horse: '马',
      rook: '车',
      cannon: '炮',
      pawn: '兵',
    };
    return names[type] || type;
  };

  return (
    <div className="replay-controls">
      <div className="replay-controls-header">
        <h3>复盘控制</h3>
        <button className="btn btn-exit-replay" onClick={onStop}>
          退出复盘
        </button>
      </div>
      
      <div className="replay-controls-buttons">
        <button
          className="btn btn-replay"
          onClick={onFirst}
          disabled={!canGoPrevious}
          title="第一步"
        >
          ◀◀
        </button>
        <button
          className="btn btn-replay"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          title="上一步"
        >
          ◀
        </button>
        <button
          className="btn btn-replay"
          onClick={onNext}
          disabled={!canGoNext}
          title="下一步"
        >
          ▶
        </button>
        <button
          className="btn btn-replay"
          onClick={onLast}
          disabled={!canGoNext}
          title="最后一步"
        >
          ▶▶
        </button>
      </div>
      
      <div className="replay-info">
        <div className="replay-step-info">
          第 <strong>{currentStep}</strong> / {totalSteps} 步
        </div>
        <div className="replay-move-info">
          {getMoveDescription(currentMove)}
        </div>
      </div>
    </div>
  );
}
