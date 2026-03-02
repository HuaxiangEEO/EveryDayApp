import type { Task, RecurrenceType } from '../types/task'
import './TaskItem.css'

const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  '': '',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  yearly: '每年',
  weekdays: '工作日',
}

interface TaskItemProps {
  task: Task
  listName: string
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
}

function formatDueDate(due: string | null): string {
  if (!due) return ''
  const d = new Date(due)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dDay = new Date(d)
  dDay.setHours(0, 0, 0, 0)
  if (dDay.getTime() === today.getTime()) return '今天'
  if (dDay.getTime() === tomorrow.getTime()) return '明天'
  const dayAfter = new Date(tomorrow)
  dayAfter.setDate(dayAfter.getDate() + 1)
  if (dDay.getTime() === dayAfter.getTime()) return '后天'
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[d.getDay()] || `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatEndLabel(task: Task): string | null {
  if (!task.recurrence) return null
  const end = task.recurrenceEnd ?? 'never'
  if (end === 'date' && task.recurrenceEndDate) {
    const d = task.recurrenceEndDate
    return `至 ${d.slice(0, 4)}/${d.slice(5, 7)}/${d.slice(8, 10)}`
  }
  if (end === 'count' && task.recurrenceEndCount != null && task.recurrenceEndCount > 0) {
    return `共 ${task.recurrenceEndCount} 次`
  }
  return null
}

export default function TaskItem({ task, listName, onToggle, onEdit }: TaskItemProps) {
  const dueLabel = task.dueDate ? formatDueDate(task.dueDate) : null
  const timeLabel = task.dueTime ?? null
  const recurrenceLabel = (task.recurrence && RECURRENCE_LABELS[task.recurrence]) || null
  const endLabel = formatEndLabel(task)
  return (
    <div className="task-item" onClick={() => onEdit(task)}>
      <button
        type="button"
        className="task-item-check"
        aria-label={task.completed ? '标记未完成' : '标记完成'}
        onClick={(e) => { e.stopPropagation(); onToggle(task.id) }}
      >
        {task.completed ? <span className="task-item-checked">✓</span> : null}
      </button>
      <div className="task-item-body">
        <span className={`task-item-title ${task.completed ? 'done' : ''}`}>{task.title}</span>
        <div className="task-item-meta">
          <span className="task-item-list">{listName}</span>
          {dueLabel && <span className="task-item-due">{dueLabel}{timeLabel ? ` ${timeLabel}` : ''}</span>}
          {recurrenceLabel && <span className="task-item-recurrence">{recurrenceLabel}</span>}
          {endLabel && <span className="task-item-recurrence-end">{endLabel}</span>}
        </div>
      </div>
    </div>
  )
}
