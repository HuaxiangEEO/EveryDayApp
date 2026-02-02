import { Question } from '../data/questions';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  isExpanded: boolean;
  isFavorite: boolean;
  onToggle: () => void;
  onToggleFavorite: () => void;
  difficultyLabel: string;
}

/**
 * 题目卡片组件
 * 显示题目信息，支持展开/收起答案和收藏功能
 */
function QuestionCard({ question, isExpanded, isFavorite, onToggle, onToggleFavorite, difficultyLabel }: QuestionCardProps) {
  const difficultyClass = `difficulty-${question.difficulty}`;

  return (
    <div className={`question-card ${isExpanded ? 'expanded' : ''} ${isFavorite ? 'favorited' : ''}`}>
      <div className="question-header">
        <div className="question-meta">
          <span className={`difficulty-badge ${difficultyClass}`}>
            {difficultyLabel}
          </span>
          <span className="category-badge">{question.category}</span>
          <div className="tags">
            {question.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>
        <div className="question-actions">
          <button
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            onClick={onToggleFavorite}
            aria-label={isFavorite ? '取消收藏' : '收藏'}
            title={isFavorite ? '取消收藏' : '收藏'}
          >
            <span className="favorite-icon">{isFavorite ? '★' : '☆'}</span>
          </button>
          <button
            className={`toggle-button ${isExpanded ? 'expanded' : ''}`}
            onClick={onToggle}
            aria-label={isExpanded ? '收起答案' : '展开答案'}
          >
            {isExpanded ? '收起答案' : '查看答案'}
            <span className="arrow">{isExpanded ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      <div className="question-title">
        <span className="question-number">#{question.id}</span>
        <h3>{question.title}</h3>
      </div>

      {isExpanded && (
        <div className="question-answer">
          <div className="answer-content">
            {question.answer.split('\n').map((paragraph, index) => {
              // 处理粗体标记
              const parts = paragraph.split(/(\*\*.*?\*\*)/g);
              return (
                <p key={index}>
                  {parts.map((part, partIndex) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                    }
                    // 处理代码块标记
                    if (part.startsWith('```')) {
                      return null; // 代码块开始/结束标记，这里简化处理
                    }
                    return <span key={partIndex}>{part}</span>;
                  })}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;
