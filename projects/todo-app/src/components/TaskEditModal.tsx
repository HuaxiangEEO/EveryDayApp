import { useState, useEffect } from 'react'
import type { Task, List, RecurrenceType, RecurrenceEndType } from '../types/task'
import './TaskEditModal.css'

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: '', label: '不重复' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' },
  { value: 'weekdays', label: '工作日' },
]

const RECURRENCE_END_OPTIONS: { value: RecurrenceEndType; label: string }[] = [
  { value: 'never', label: '一直重复' },
  { value: 'date', label: '按日期结束重复' },
  { value: 'count', label: '按次数结束重复' },
]

export type TaskAddData = {
  title: string
  listId: string
  dueDate: string | null
  dueTime: string | null
  important: boolean
  urgent: boolean
  recurrence: RecurrenceType
  recurrenceEnd: RecurrenceEndType
  recurrenceEndDate: string | null
  recurrenceEndCount: number | null
}

type TaskEditModalProps =
  | {
      task: Task
      lists: List[]
      onSave: (patch: Partial<Pick<Task, 'title' | 'listId' | 'dueDate' | 'dueTime' | 'important' | 'urgent' | 'recurrence' | 'recurrenceEnd' | 'recurrenceEndDate' | 'recurrenceEndCount'>>) => void
      onDelete: () => void
      onClose: () => void
      onAdd?: never
      defaultListId?: never
      defaultImportant?: never
      defaultUrgent?: never
    }
  | {
      task: null
      lists: List[]
      onAdd: (data: TaskAddData) => void | Promise<void>
      onClose: () => void
      defaultListId?: string
      defaultImportant?: boolean
      defaultUrgent?: boolean
      onSave?: never
      onDelete?: never
    }

const customLists = (lists: List[]) => lists.filter(l => l.type === 'custom' || l.type === 'inbox')

function getDraftInitial(lists: List[], defaultListId?: string, defaultImportant?: boolean, defaultUrgent?: boolean) {
  const inboxId = lists.find(l => l.type === 'inbox')?.id ?? lists[0]?.id ?? ''
  return {
    title: '',
    listId: defaultListId ?? inboxId,
    dueDate: '',
    dueTime: '',
    important: defaultImportant ?? false,
    urgent: defaultUrgent ?? false,
    recurrence: '' as RecurrenceType,
    recurrenceEnd: 'never' as RecurrenceEndType,
    recurrenceEndDate: '',
    recurrenceEndCount: '',
  }
}

export default function TaskEditModal(props: TaskEditModalProps) {
  const { task, lists, onClose } = props
  const isCreate = task === null
  const draft = isCreate ? getDraftInitial(lists, props.defaultListId, props.defaultImportant, props.defaultUrgent) : null

  const [title, setTitle] = useState(isCreate ? '' : task.title)
  const [listId, setListId] = useState(isCreate ? (draft!.listId) : task.listId)
  const [dueDate, setDueDate] = useState(isCreate ? '' : (task.dueDate ?? ''))
  const [dueTime, setDueTime] = useState(isCreate ? '' : (task.dueTime ?? ''))
  const [important, setImportant] = useState(isCreate ? (draft!.important) : task.important)
  const [urgent, setUrgent] = useState(isCreate ? (draft!.urgent) : task.urgent)
  const [recurrence, setRecurrence] = useState<RecurrenceType>(isCreate ? '' : (task.recurrence ?? ''))
  const [recurrenceEnd, setRecurrenceEnd] = useState<RecurrenceEndType>(isCreate ? 'never' : (task.recurrenceEnd ?? 'never'))
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(isCreate ? '' : (task.recurrenceEndDate ?? ''))
  const [recurrenceEndCount, setRecurrenceEndCount] = useState(isCreate ? '' : String(task.recurrenceEndCount ?? ''))

  useEffect(() => {
    if (task === null) return
    setTitle(task.title)
    setListId(task.listId)
    setDueDate(task.dueDate ?? '')
    setDueTime(task.dueTime ?? '')
    setImportant(task.important)
    setUrgent(task.urgent)
    setRecurrence(task.recurrence ?? '')
    setRecurrenceEnd(task.recurrenceEnd ?? 'never')
    setRecurrenceEndDate(task.recurrenceEndDate ?? '')
    setRecurrenceEndCount(task.recurrenceEndCount != null ? String(task.recurrenceEndCount) : '')
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const countNum = recurrenceEnd === 'count' ? parseInt(recurrenceEndCount, 10) : null
    const payload = {
      title: title.trim(),
      listId,
      dueDate: dueDate.trim() || null,
      dueTime: dueTime.trim() || null,
      important,
      urgent,
      recurrence: recurrence || '',
      recurrenceEnd: recurrence ? recurrenceEnd : 'never',
      recurrenceEndDate: recurrenceEnd === 'date' && recurrenceEndDate.trim() ? recurrenceEndDate.trim() : null,
      recurrenceEndCount: recurrenceEnd === 'count' && countNum != null && !isNaN(countNum) && countNum > 0 ? countNum : null,
    }
    if (isCreate) {
      if (!payload.title) return
      props.onAdd(payload as TaskAddData)
    } else {
      props.onSave(payload)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 className="modal-title">{isCreate ? '添加任务' : '编辑任务'}</h2>
            <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">×</button>
          </div>
          <div className="modal-body">
            <label className="modal-field">
              <span>标题</span>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
                className="modal-input"
              />
            </label>
            <label className="modal-field">
              <span>清单</span>
              <select
                value={listId}
                onChange={e => setListId(e.target.value)}
                className="modal-input"
              >
                {customLists(lists).map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </label>
            <div className="modal-field-row modal-field-datetime">
              <label className="modal-field">
                <span>日期</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="modal-input"
                />
              </label>
              <label className="modal-field">
                <span>时间</span>
                <input
                  type="time"
                  value={dueTime}
                  onChange={e => setDueTime(e.target.value)}
                  className="modal-input"
                />
              </label>
            </div>
            <label className="modal-field">
              <span>重复</span>
              <select
                value={recurrence}
                onChange={e => setRecurrence(e.target.value as RecurrenceType)}
                className="modal-input"
              >
                {RECURRENCE_OPTIONS.map(opt => (
                  <option key={opt.value || 'none'} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
            {recurrence && (
              <div className="modal-field recurrence-end">
                <span className="modal-field-label">结束重复</span>
                <select
                  value={recurrenceEnd}
                  onChange={e => setRecurrenceEnd(e.target.value as RecurrenceEndType)}
                  className="modal-input"
                >
                  {RECURRENCE_END_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {recurrenceEnd === 'date' && (
                  <input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={e => setRecurrenceEndDate(e.target.value)}
                    className="modal-input modal-input-inline"
                  />
                )}
                {recurrenceEnd === 'count' && (
                  <div className="modal-field-row modal-field-count">
                    <input
                      type="number"
                      min={1}
                      value={recurrenceEndCount}
                      onChange={e => setRecurrenceEndCount(e.target.value)}
                      className="modal-input modal-input-inline"
                      placeholder="次数"
                    />
                    <span>次</span>
                  </div>
                )}
              </div>
            )}
            <div className="modal-field modal-field-row">
              <label className="modal-check">
                <input
                  type="checkbox"
                  checked={important}
                  onChange={e => setImportant(e.target.checked)}
                />
                <span>重要</span>
              </label>
              <label className="modal-check">
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={e => setUrgent(e.target.checked)}
                />
                <span>紧急</span>
              </label>
            </div>
          </div>
          <div className="modal-footer">
            {!isCreate && (
              <button type="button" className="modal-btn modal-btn-danger" onClick={props.onDelete}>
                删除
              </button>
            )}
            <button type="submit" className="modal-btn modal-btn-primary">
              {isCreate ? '添加' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
