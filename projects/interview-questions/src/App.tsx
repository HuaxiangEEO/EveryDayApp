import { useState, useMemo, useEffect } from 'react';
import { questions, getCategories, type Question } from './data/questions';
import QuestionCard from './components/QuestionCard';
import FilterBar from './components/FilterBar';
import { getFavorites, toggleFavorite } from './utils/favorites';
import './App.css';

/**
 * 主应用组件
 * 操作系统面试题库网站
 */
function App() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('全部');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(getFavorites());

  // 监听localStorage变化（支持多标签页同步）
  useEffect(() => {
    const handleStorageChange = () => {
      setFavoriteIds(getFavorites());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const categories = ['全部', ...getCategories()];
  const difficulties = ['全部', 'easy', 'medium', 'hard'];

  // 筛选和搜索题目
  const filteredQuestions = useMemo(() => {
    let result = questions;

    // 收藏筛选（优先）
    if (showFavoritesOnly) {
      result = result.filter(q => favoriteIds.has(q.id));
    }

    // 分类筛选
    if (selectedCategory !== '全部') {
      result = result.filter(q => q.category === selectedCategory);
    }

    // 难度筛选
    if (selectedDifficulty !== '全部') {
      result = result.filter(q => q.difficulty === selectedDifficulty);
    }

    // 关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(q =>
        q.title.toLowerCase().includes(keyword) ||
        q.answer.toLowerCase().includes(keyword) ||
        q.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
    }

    return result;
  }, [selectedCategory, selectedDifficulty, searchKeyword, showFavoritesOnly, favoriteIds]);

  // 切换答案展开/收起
  const toggleAnswer = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 展开所有答案
  const expandAll = () => {
    setExpandedIds(new Set(filteredQuestions.map(q => q.id)));
  };

  // 收起所有答案
  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // 切换收藏状态
  const handleToggleFavorite = (id: number) => {
    toggleFavorite(id);
    setFavoriteIds(getFavorites());
  };

  const difficultyLabels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>操作系统面试题库</h1>
        <p className="subtitle">软件工程专业校招面试必备知识</p>
      </header>

      <FilterBar
        categories={categories}
        difficulties={difficulties}
        difficultyLabels={difficultyLabels}
        selectedCategory={selectedCategory}
        selectedDifficulty={selectedDifficulty}
        searchKeyword={searchKeyword}
        showFavoritesOnly={showFavoritesOnly}
        favoriteCount={favoriteIds.size}
        onCategoryChange={setSelectedCategory}
        onDifficultyChange={setSelectedDifficulty}
        onSearchChange={setSearchKeyword}
        onShowFavoritesOnlyChange={setShowFavoritesOnly}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />

      <main className="main-content">
        <div className="questions-stats">
          <span>共找到 <strong>{filteredQuestions.length}</strong> 道题目</span>
          {favoriteIds.size > 0 && (
            <span className="favorite-count">已收藏 <strong>{favoriteIds.size}</strong> 道</span>
          )}
        </div>

        <div className="questions-list">
          {filteredQuestions.length === 0 ? (
            <div className="no-results">
              <p>没有找到相关题目，请尝试调整筛选条件</p>
            </div>
          ) : (
            filteredQuestions.map(question => (
              <QuestionCard
                key={question.id}
                question={question}
                isExpanded={expandedIds.has(question.id)}
                isFavorite={favoriteIds.has(question.id)}
                onToggle={() => toggleAnswer(question.id)}
                onToggleFavorite={() => handleToggleFavorite(question.id)}
                difficultyLabel={difficultyLabels[question.difficulty]}
              />
            ))
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 操作系统面试题库 - 助力软件工程校招</p>
      </footer>
    </div>
  );
}

export default App;
