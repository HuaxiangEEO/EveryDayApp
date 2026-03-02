import { useState, useCallback } from 'react'
import type { RecurrenceType } from '../types/task'
import './AddTaskInput.css'

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: '', label: '不重复' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' },
  { value: 'weekdays', label: '工作日' },
]

export interface AddTaskOptions {
  dueDate?: string | null
  dueTime?: string | null
  recurrence?: RecurrenceType
}

interface AddTaskInputProps {
  placeholder?: string
  onAdd: (title: string, options?: AddTaskOptions) => void | Promise<void>
  /** 标题为空时点击添加时调用，用于打开添加任务弹窗等 */
  onEmptyAddClick?: () => void
}

export default function AddTaskInput({ placeholder = '添加任务至「收集箱」', onAdd, onEmptyAddClick }: AddTaskInputProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [emptyHint, setEmptyHint] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [recurrence, setRecurrence] = useState<RecurrenceType>('')

  const handleSubmit = useCallback(async () => {
    const t = value.trim()
    if (loading) return
    if (!t) {
      if (onEmptyAddClick) {
        onEmptyAddClick()
        return
      }
      setEmptyHint(true)
      return
    }
    setEmptyHint(false)
    setLoading(true)
    try {
      await onAdd(t, {
        dueDate: dueDate.trim() || null,
        dueTime: dueTime.trim() || null,
        recurrence: recurrence || undefined,
      })
      setValue('')
      setDueDate('')
      setDueTime('')
      setRecurrence('')
    } finally {
      setLoading(false)
    }
  }, [value, onAdd, loading, dueDate, dueTime, recurrence])

  return (
    <div className="add-task">
      <div className="add-task-row">
        <span className="add-task-icon">+</span>
        <input
          className="add-task-input"
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => { setValue(e.target.value); setEmptyHint(false) }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
        />
        <button
          type="button"
          className={`add-task-schedule-btn ${showSchedule ? 'active' : ''}`}
          onClick={() => setShowSchedule(s => !s)}
          title="日期与重复"
          aria-label="日期与重复"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        </button>
        <button type="button" className="add-task-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? '添加中…' : '添加'}
        </button>
      </div>
      {showSchedule && (
        <div className="add-task-schedule">
          <label className="add-task-schedule-field">
            <span>日期</span>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="add-task-schedule-input" />
          </label>
          <label className="add-task-schedule-field">
            <span>时间</span>
            <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="add-task-schedule-input" />
          </label>
          <label className="add-task-schedule-field">
            <span>重复</span>
            <select value={recurrence} onChange={e => setRecurrence(e.target.value as RecurrenceType)} className="add-task-schedule-input">
              {RECURRENCE_OPTIONS.map(opt => (
                <option key={opt.value || 'none'} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {emptyHint && <span className="add-task-hint">请输入任务标题</span>}
    </div>
  )
}
