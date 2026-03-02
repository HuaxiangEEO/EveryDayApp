import type { List } from '../types/task'
import './Sidebar.css'

interface SidebarProps {
  lists: List[]
  currentList: List
  viewMode: 'list' | 'quadrant' | 'calendar'
  onSelectList: (list: List) => void
  onSelectQuadrant: () => void
  onSelectCalendar: () => void
}

export default function Sidebar({ lists, currentList, viewMode, onSelectList, onSelectQuadrant, onSelectCalendar }: SidebarProps) {
  // 任务模块：所有、今天、最近7天、历史
  const taskItems = [
    lists.find(l => l.type === 'all'),
    lists.find(l => l.type === 'today'),
    lists.find(l => l.type === 'recent7'),
    { id: 'history', name: '历史', type: 'history' as const },
  ].filter(Boolean) as List[]
  // 清单模块：收集箱 + 用户自定义清单
  const listItems = [
    lists.find(l => l.type === 'inbox'),
    ...lists.filter(l => l.type === 'custom'),
  ].filter(Boolean) as List[]

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <section className="sidebar-section">
          <h2 className="sidebar-section-title">任务</h2>
          <div className="sidebar-section-items">
            {taskItems.map(list => (
              <button
                key={list.id}
                type="button"
                className={`sidebar-item ${viewMode === 'list' && currentList.id === list.id ? 'active' : ''}`}
                onClick={() => onSelectList(list)}
              >
                <span className="sidebar-item-name">{list.name}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="sidebar-section">
          <h2 className="sidebar-section-title">清单</h2>
          <div className="sidebar-section-items">
            {listItems.map(list => (
              <button
                key={list.id}
                type="button"
                className={`sidebar-item ${viewMode === 'list' && currentList.id === list.id ? 'active' : ''}`}
                onClick={() => onSelectList(list)}
              >
                <span className="sidebar-item-name">{list.name}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="sidebar-section sidebar-section-calendar">
          <h2 className="sidebar-section-title">日历</h2>
          <div className="sidebar-section-items">
            <button
              type="button"
              className={`sidebar-item ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={onSelectCalendar}
            >
              <span className="sidebar-item-name">日历</span>
            </button>
          </div>
        </section>
        <section className="sidebar-section sidebar-section-quadrant">
          <h2 className="sidebar-section-title">四象限</h2>
          <div className="sidebar-section-items">
            <button
              type="button"
              className={`sidebar-item ${viewMode === 'quadrant' ? 'active' : ''}`}
              onClick={onSelectQuadrant}
            >
              <span className="sidebar-item-name">四象限</span>
            </button>
          </div>
        </section>
      </nav>
    </aside>
  )
}
