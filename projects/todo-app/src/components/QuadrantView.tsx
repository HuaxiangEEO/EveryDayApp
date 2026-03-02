import type { RecurrenceType, RecurrenceEndType } from '../types/task'
import { useTasks } from '../hooks/useTasks'
import QuadrantCell, { type QuadrantId } from './QuadrantCell'
import './QuadrantView.css'

export default function QuadrantView() {
  const { lists, getTasksForQuadrant, toggleComplete, updateTask, deleteTask, addTask } = useTasks()
  const getListName = (listId: string) => lists.find(l => l.id === listId)?.name ?? listId
  const inboxId = lists.find(l => l.type === 'inbox')?.id ?? 'inbox'

  const handleAdd = async (
    title: string,
    opts: {
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
  ) => {
    await addTask(title, {
      listId: opts.listId ?? inboxId,
      important: opts.important,
      urgent: opts.urgent,
      dueDate: opts.dueDate,
      dueTime: opts.dueTime,
      recurrence: opts.recurrence,
      recurrenceEnd: opts.recurrenceEnd,
      recurrenceEndDate: opts.recurrenceEndDate,
      recurrenceEndCount: opts.recurrenceEndCount,
    })
  }

  return (
    <div className="quadrant-view">
      <div className="quadrant-grid">
        <QuadrantCell
          quadrant={1}
          tasks={getTasksForQuadrant(1)}
          lists={lists}
          getListName={getListName}
          onToggle={toggleComplete}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onAdd={(title, opts) => handleAdd(title, opts)}
        />
        <QuadrantCell
          quadrant={2}
          tasks={getTasksForQuadrant(2)}
          lists={lists}
          getListName={getListName}
          onToggle={toggleComplete}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onAdd={(title, opts) => handleAdd(title, opts)}
        />
        <QuadrantCell
          quadrant={3}
          tasks={getTasksForQuadrant(3)}
          lists={lists}
          getListName={getListName}
          onToggle={toggleComplete}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onAdd={(title, opts) => handleAdd(title, opts)}
        />
        <QuadrantCell
          quadrant={4}
          tasks={getTasksForQuadrant(4)}
          lists={lists}
          getListName={getListName}
          onToggle={toggleComplete}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onAdd={(title, opts) => handleAdd(title, opts)}
        />
      </div>
    </div>
  )
}
