import type { List, Task } from '../types/task'

const LISTS_KEY = 'todo-app-lists'
const TASKS_KEY = 'todo-app-tasks'

const DEFAULT_LISTS: List[] = [
  { id: 'all', name: '所有', type: 'all' },
  { id: 'today', name: '今天', type: 'today' },
  { id: 'recent7', name: '最近7天', type: 'recent7' },
  { id: 'inbox', name: '收集箱', type: 'inbox' },
  { id: 'list-1', name: '目标管理', type: 'custom' },
  { id: 'list-2', name: '学习调研', type: 'custom' },
  { id: 'list-3', name: '读书计划', type: 'custom' },
]

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getTomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

/** 示例任务，用于首次加载（无本地数据时） */
function getSeedTasks(inboxId: string): Task[] {
  const today = new Date().toISOString().slice(0, 10)
  const tom = getTomorrowISO()
  const d3 = new Date(); d3.setDate(d3.getDate() + 3)
  const d3Str = d3.toISOString().slice(0, 10)
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)
  const base: Pick<Task, 'dueTime' | 'recurrence' | 'recurrenceEnd' | 'recurrenceEndDate' | 'recurrenceEndCount'> = { dueTime: null, recurrence: '', recurrenceEnd: 'never', recurrenceEndDate: null, recurrenceEndCount: null }
  const ts = () => new Date().toISOString()
  return [
    { id: genId(), title: '晨间复盘', listId: inboxId, dueDate: today, completed: false, important: true, urgent: true, createdAt: ts(), ...base },
    { id: genId(), title: '回复客户邮件', listId: inboxId, dueDate: today, completed: false, important: true, urgent: false, createdAt: ts(), ...base },
    { id: genId(), title: '周会准备材料', listId: inboxId, dueDate: tom, completed: false, important: true, urgent: true, createdAt: ts(), ...base },
    { id: genId(), title: '整理会议纪要', listId: inboxId, dueDate: yesterdayStr, completed: false, important: false, urgent: true, createdAt: ts(), ...base },
    { id: genId(), title: '读书 30 分钟', listId: inboxId, dueDate: d3Str, completed: false, important: true, urgent: false, createdAt: ts(), ...base },
    { id: genId(), title: '运动 / 散步', listId: inboxId, dueDate: null, completed: false, important: false, urgent: false, createdAt: ts(), ...base },
    { id: genId(), title: '季度目标拆解', listId: 'list-1', dueDate: tom, completed: false, important: true, urgent: false, createdAt: ts(), ...base },
    { id: genId(), title: '技术方案调研', listId: 'list-2', dueDate: d3Str, completed: false, important: false, urgent: false, createdAt: ts(), ...base },
  ]
}

export function loadLists(): List[] {
  try {
    const raw = localStorage.getItem(LISTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as List[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (_) {}
  return DEFAULT_LISTS
}

export function saveLists(lists: List[]): void {
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Task[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  const lists = loadLists()
  const inbox = lists.find(l => l.type === 'inbox')
  const inboxId = inbox?.id ?? 'inbox'
  return getSeedTasks(inboxId)
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function createTask(partial: Omit<Task, 'id' | 'createdAt'>): Task {
  const task: Task = {
    ...partial,
    id: genId(),
    createdAt: new Date().toISOString(),
  }
  return task
}
