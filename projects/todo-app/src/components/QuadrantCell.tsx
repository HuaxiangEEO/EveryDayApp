import { useState, useCallback } from 'react'
import type { Task, List, RecurrenceType, RecurrenceEndType } from '../types/task'
import { DATE_GROUP_ORDER, DATE_GROUP_LABELS } from '../utils/dateGroup'
import { groupTasksByDate } from '../utils/dateGroup'
import TaskItem from './TaskItem'
import TaskEditModal, { type TaskAddData } from './TaskEditModal'
import './QuadrantCell.css'

export type QuadrantId = 1 | 2 | 3 | 4

const QUAD_CONFIG: Record<QuadrantId, { label: string; important: boolean; urgent: boolean }> = {
  1: { label: '重要且紧急', important: true, urgent: true },
  2: { label: '重要不紧急', important: true, urgent: false },
  3: { label: '不重要但紧急', important: false, urgent: true },
  4: { label: '不重要不紧急', important: false, urgent: false },
}

interface QuadrantCellProps {
  quadrant: QuadrantId
  tasks: Task[]
  lists: List[]
  getListName: (listId: string) => string
  onToggle: (id: string) => void
  onUpdate: (id: string, patch: Partial<Pick<Task, 'title' | 'listId' | 'dueDate' | 'important' | 'urgent'>>) => void
  onDelete: (id: string) => void
  onAdd: (
    title: string,
    options: {
      important: boolean
      urgent: boolean
      listId?: string
      dueDate?: string | null
      dueTime?: string | null
      recurrence?: RecurrenceType
      recurrenceEnd?: RecurrenceEndType
      recurrenceEndDate?: string | null
      recurrenceEndCount?: number | null
    }
  ) => void | Promise<void>
}

export default function QuadrantCell({
  quadrant,
  tasks,
  lists,
  getListName,
  onToggle,
  onUpdate,
  onDelete,
  onAdd,
}: QuadrantCellProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [addValue, setAddValue] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const { important, urgent, label } = QUAD_CONFIG[quadrant]
  const grouped = groupTasksByDate(tasks)
  const accentClass = `quadrant-cell quadrant-${quadrant}`

  const handleAdd = useCallback(async () => {
    const t = addValue.trim()
    if (addLoading) return
    if (!t) {
      setShowAddModal(true)
      return
    }
    setAddLoading(true)
    try {
      await onAdd(t, { important, urgent })
      setAddValue('')
    } finally {
      setAddLoading(false)
    }
  }, [addValue, addLoading, important, urgent, onAdd])

  return (
    <div className={accentClass}>
      <div className="quadrant-cell-header">
        <span className="quadrant-cell-title">{quadrant === 1 ? 'I' : quadrant === 2 ? 'II' : quadrant === 3 ? 'III' : 'IV'} {label}</span>
        <div className="quadrant-cell-actions">
          <input
            type="text"
            className="quadrant-cell-add-input"
            placeholder="添加任务"
            value={addValue}
            onChange={e => setAddValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            disabled={addLoading}
          />
          <button type="button" className="quadrant-cell-add-btn" onClick={handleAdd} title="添加" disabled={addLoading}>{addLoading ? '…' : '+'}</button>
        </div>
      </div>
      <div className="quadrant-cell-body">
        {DATE_GROUP_ORDER.map(key => {
          const groupTasks = grouped.get(key) ?? []
          if (groupTasks.length === 0) return null
          return (
            <section key={key} className="quadrant-group">
              <h4 className="quadrant-group-title">{DATE_GROUP_LABELS[key]} {groupTasks.length}</h4>
              {groupTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  listName={getListName(task.listId)}
                  onToggle={onToggle}
                  onEdit={setEditingTask}
                />
              ))}
            </section>
          )
        })}
        {tasks.length === 0 && (
          <div className="quadrant-cell-empty">没有任务</div>
        )}
      </div>
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          lists={lists}
          onSave={(patch) => { onUpdate(editingTask.id, patch); setEditingTask(null) }}
          onDelete={() => { onDelete(editingTask.id); setEditingTask(null) }}
          onClose={() => setEditingTask(null)}
        />
      )}
      {showAddModal && (
        <TaskEditModal
          task={null}
          lists={lists}
          defaultListId={lists.find(l => l.type === 'inbox')?.id}
          defaultImportant={important}
          defaultUrgent={urgent}
          onAdd={async (data: TaskAddData) => {
            await onAdd(data.title, {
              important: data.important,
              urgent: data.urgent,
              listId: data.listId,
              dueDate: data.dueDate,
              dueTime: data.dueTime,
              recurrence: data.recurrence,
              recurrenceEnd: data.recurrenceEnd,
              recurrenceEndDate: data.recurrenceEndDate,
              recurrenceEndCount: data.recurrenceEndCount,
            })
            setShowAddModal(false)
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
