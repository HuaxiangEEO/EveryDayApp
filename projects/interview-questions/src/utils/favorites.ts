/**
 * 收藏管理工具函数
 * 使用localStorage持久化收藏数据
 */

const FAVORITES_KEY = 'os-interview-favorites';

/**
 * 获取所有收藏的题目ID
 */
export function getFavorites(): Set<number> {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      const ids = JSON.parse(stored) as number[];
      return new Set(ids);
    }
  } catch (error) {
    console.error('读取收藏数据失败:', error);
  }
  return new Set<number>();
}

/**
 * 保存收藏的题目ID
 */
export function saveFavorites(favorites: Set<number>): void {
  try {
    const ids = Array.from(favorites);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('保存收藏数据失败:', error);
  }
}

/**
 * 添加收藏
 */
export function addFavorite(id: number): void {
  const favorites = getFavorites();
  favorites.add(id);
  saveFavorites(favorites);
}

/**
 * 移除收藏
 */
export function removeFavorite(id: number): void {
  const favorites = getFavorites();
  favorites.delete(id);
  saveFavorites(favorites);
}

/**
 * 切换收藏状态
 */
export function toggleFavorite(id: number): boolean {
  const favorites = getFavorites();
  if (favorites.has(id)) {
    favorites.delete(id);
    saveFavorites(favorites);
    return false;
  } else {
    favorites.add(id);
    saveFavorites(favorites);
    return true;
  }
}

/**
 * 检查是否已收藏
 */
export function isFavorite(id: number): boolean {
  return getFavorites().has(id);
}
