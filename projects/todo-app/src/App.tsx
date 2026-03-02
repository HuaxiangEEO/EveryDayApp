import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TaskList from './components/TaskList'
import QuadrantView from './components/QuadrantView'
import CalendarView from './components/CalendarView'
import HistoryView from './components/HistoryView'
import TopBar from './components/TopBar'
import Login from './components/Login'
import { useAuth } from './contexts/AuthContext'
import { useTasks } from './hooks/useTasks'
import type { List } from './types/task'
import './App.css'

type ViewMode = 'list' | 'quadrant' | 'calendar'

function MainApp() {
  const [currentList, setCurrentList] = useState<List | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const { lists, loading, error, reload } = useTasks()

  const effectiveList = currentList ?? lists.find(l => l.type === 'all') ?? lists[0]

  if (loading && lists.length === 0) {
    return (
      <div className="app-loading">
        <span>加载中…</span>
      </div>
    )
  }

  if (!loading && lists.length === 0) {
    return (
      <div className="app-loading">
        <span>加载失败或暂无数据</span>
        <button type="button" className="app-retry" onClick={() => reload()}>重试</button>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar
        lists={lists}
        currentList={effectiveList!}
        viewMode={viewMode}
        onSelectList={(list) => { setCurrentList(list); setViewMode('list') }}
        onSelectQuadrant={() => setViewMode('quadrant')}
        onSelectCalendar={() => setViewMode('calendar')}
      />
      <div className="app-center">
        <TopBar
          viewMode={viewMode}
          listName={viewMode === 'list' ? (effectiveList?.name ?? '') : viewMode === 'quadrant' ? '四象限' : '日历'}
        />
        {error && (
          <div className="app-error">
            {error}
          </div>
        )}
        <div className="app-body">
          {viewMode === 'list' && effectiveList?.type === 'history' && <HistoryView />}
          {viewMode === 'list' && effectiveList && effectiveList.type !== 'history' && <TaskList list={effectiveList} />}
          {viewMode === 'quadrant' && <QuadrantView />}
          {viewMode === 'calendar' && <CalendarView />}
        </div>
      </div>
    </div>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="app-loading">
        <span>加载中…</span>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <MainApp />
}

export default App
