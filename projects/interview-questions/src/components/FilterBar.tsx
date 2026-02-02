import './FilterBar.css';

interface FilterBarProps {
  categories: string[];
  difficulties: string[];
  difficultyLabels: Record<string, string>;
  selectedCategory: string;
  selectedDifficulty: string;
  searchKeyword: string;
  showFavoritesOnly: boolean;
  favoriteCount: number;
  onCategoryChange: (category: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onSearchChange: (keyword: string) => void;
  onShowFavoritesOnlyChange: (show: boolean) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

/**
 * 筛选栏组件
 * 提供分类、难度筛选和搜索功能
 */
function FilterBar({
  categories,
  difficulties,
  difficultyLabels,
  selectedCategory,
  selectedDifficulty,
  searchKeyword,
  showFavoritesOnly,
  favoriteCount,
  onCategoryChange,
  onDifficultyChange,
  onSearchChange,
  onShowFavoritesOnlyChange,
  onExpandAll,
  onCollapseAll
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="category-filter">分类：</label>
        <select
          id="category-filter"
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="difficulty-filter">难度：</label>
        <select
          id="difficulty-filter"
          className="filter-select"
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
        >
          {difficulties.map(diff => (
            <option key={diff} value={diff}>
              {diff === '全部' ? '全部' : difficultyLabels[diff] || diff}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group search-group">
        <label htmlFor="search-input">搜索：</label>
        <input
          id="search-input"
          type="text"
          className="search-input"
          placeholder="搜索题目、答案或标签..."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-group favorite-filter">
        <label className="favorite-checkbox-label">
          <input
            type="checkbox"
            className="favorite-checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => onShowFavoritesOnlyChange(e.target.checked)}
          />
          <span className="favorite-checkbox-text">
            只看收藏 {favoriteCount > 0 && `(${favoriteCount})`}
          </span>
        </label>
      </div>

      <div className="filter-group action-buttons">
        <button className="action-btn" onClick={onExpandAll}>
          展开全部
        </button>
        <button className="action-btn" onClick={onCollapseAll}>
          收起全部
        </button>
      </div>
    </div>
  );
}

export default FilterBar;
