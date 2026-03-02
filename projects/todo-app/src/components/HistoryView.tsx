import { useMemo, useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import type { Task } from '../types/task'
import TaskEditModal from './TaskEditModal'
import './HistoryView.css'

/** 按任务日期（dueDate）倒序，无日期的排最后按 createdAt 倒序 */
function sortByTaskDateDesc(a: Task, b: Task): number {
  const ad = a.dueDate || '0000-00-00'
  const bd = b.dueDate || '0000-00-00'
  const cmp = bd.localeCompare(ad)
  if (cmp !== 0) return cmp
  return (b.createdAt || '').localeCompare(a.createdAt || '')
}

function formatDue(dueDate: string | null): string {
  if (!dueDate) return '无日期'
  const d = new Date(dueDate)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export default function HistoryView() {
  const { tasks, lists, toggleComplete, updateTask, deleteTask } = useTasks()
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const completedSorted = useMemo(() => {
    const completed = tasks.filter(t => t.completed)
    return [...completed].sort(sortByTaskDateDesc)
  }, [tasks])

  const getListName = (listId: string) => lists.find(l => l.id === listId)?.name ?? listId

  return (
    <div className="history-view">
      <div className="history-list">
        {completedSorted.map(task => (
          <div key={task.id} className="history-item" onClick={() => setEditingTask(task)}>
            <button
              type="button"
              className="history-item-check checked"
              aria-label="标记未完成"
              onClick={e => { e.stopPropagation(); toggleComplete(task.id) }}
            >
              <span className="task-item-checked">✓</span>
            </button>
            <div className="history-item-body">
              <span className="history-item-title">{task.title}</span>
              <div className="history-item-meta">
                <span className="history-item-list">{getListName(task.listId)}</span>
                <span className="history-item-date">任务日期 {formatDue(task.dueDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {completedSorted.length === 0 && (
        <div className="history-empty">暂无已完成任务</div>
      )}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          lists={lists}
          onSave={patch => { updateTask(editingTask.id, patch); setEditingTask(null) }}
          onDelete={() => { deleteTask(editingTask.id); setEditingTask(null) }}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  )
}
