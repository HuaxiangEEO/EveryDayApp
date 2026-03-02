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

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function getTomorrowISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

/** 示例任务，用于首次加载 */
function getSeedTasks(inboxId: string): Task[] {
  const t = getTodayISO()
  const tom = getTomorrowISO()
  const day3 = new Date(); day3.setDate(day3.getDate() + 2)
  const day3Str = day3.toISOString().slice(0, 10)
  const last = new Date(); last.setDate(last.getDate() - 1)
  const lastStr = last.toISOString().slice(0, 10)
  return [
    { id: genId(), title: '每日微信读书10分钟', listId: inboxId, dueDate: lastStr, completed: false, important: true, urgent: true, createdAt: new Date().toISOString() },
    { id: genId(), title: '辉哥随想', listId: inboxId, dueDate: tom, completed: false, important: true, urgent: false, createdAt: new Date().toISOString() },
    { id: genId(), title: '文明之旅', listId: inboxId, dueDate: day3Str, completed: false, important: true, urgent: false, createdAt: new Date().toISOString() },
    { id: genId(), title: '每日AI新知', listId: inboxId, dueDate: day3Str, completed: false, important: true, urgent: false, createdAt: new Date().toISOString() },
    { id: genId(), title: '找几个典型的Figma页面生成网页', listId: inboxId, dueDate: null, completed: false, important: false, urgent: false, createdAt: new Date().toISOString() },
    { id: genId(), title: '梳理前端对客户端的依赖,做web版', listId: 'list-1', dueDate: null, completed: false, important: false, urgent: false, createdAt: new Date().toISOString() },
    { id: genId(), title: 'AI coding产品调研', listId: 'list-2', dueDate: null, completed: false, important: false, urgent: false, createdAt: new Date().toISOString() },
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
