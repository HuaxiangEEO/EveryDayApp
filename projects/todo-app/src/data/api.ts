import { supabase } from '../lib/supabase'
import type { List, Task, RecurrenceType, RecurrenceEndType } from '../types/task'

const LIST_TYPES = ['inbox', 'custom'] as const
type DbList = { id: string; user_id: string; name: string; type: typeof LIST_TYPES[number]; created_at: string }
const toList = (row: DbList): List => ({
  id: row.id,
  name: row.name,
  type: row.type,
})

type DbTask = {
  id: string
  user_id: string
  list_id: string
  title: string
  due_date: string | null
  due_time: string | null
  completed: boolean
  important: boolean
  urgent: boolean
  recurrence: string | null
  recurrence_end: string | null
  recurrence_end_date: string | null
  recurrence_end_count: number | null
  created_at: string
  order: number | null
}
const toTask = (row: DbTask): Task => ({
  id: row.id,
  title: row.title,
  listId: row.list_id,
  dueDate: row.due_date,
  dueTime: row.due_time ?? null,
  completed: row.completed,
  important: row.important,
  urgent: row.urgent,
  recurrence: (row.recurrence as RecurrenceType) ?? '',
  recurrenceEnd: (row.recurrence_end as RecurrenceEndType) ?? 'never',
  recurrenceEndDate: row.recurrence_end_date ?? null,
  recurrenceEndCount: row.recurrence_end_count ?? null,
  createdAt: row.created_at,
  order: row.order ?? undefined,
})

const DEFAULT_CUSTOM_NAMES = ['目标管理', '学习调研', '读书计划']

/** 获取当前用户清单（仅 inbox + custom），并确保至少有一个 inbox。插入默认清单时用 upsert 避免重复。 */
export async function fetchLists(userId: string): Promise<List[]> {
  const defaultLists: { user_id: string; name: string; type: 'inbox' | 'custom' }[] = [
    { user_id: userId, name: '收集箱', type: 'inbox' },
    ...DEFAULT_CUSTOM_NAMES.map(name => ({ user_id: userId, name, type: 'custom' as const })),
  ]
  await supabase
    .from('lists')
    .upsert(defaultLists, { onConflict: 'user_id,name', ignoreDuplicates: true })

  const { data: rows, error } = await supabase
    .from('lists')
    .select('id, user_id, name, type, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  const dbLists = (rows ?? []) as DbList[]
  const inbox = dbLists.find(l => l.type === 'inbox')
  if (!inbox) {
    return [
      { id: 'all', name: '所有', type: 'all' },
      { id: 'today', name: '今天', type: 'today' },
      { id: 'recent7', name: '最近7天', type: 'recent7' },
      { id: 'inbox', name: '收集箱', type: 'inbox' },
    ]
  }
  const customByName = new Map<string, DbList>()
  for (const l of dbLists.filter(l => l.type === 'custom')) {
    if (!customByName.has(l.name)) customByName.set(l.name, l)
  }
  const customLists = Array.from(customByName.values())
  return [
    { id: 'all', name: '所有', type: 'all' },
    { id: 'today', name: '今天', type: 'today' },
    { id: 'recent7', name: '最近7天', type: 'recent7' },
    toList(inbox),
    ...customLists.map(toList),
  ]
}

/** 获取当前用户全部任务 */
export async function fetchTasks(userId: string): Promise<Task[]> {
  const { data: rows, error } = await supabase
    .from('tasks')
    .select('id, user_id, list_id, title, due_date, due_time, completed, important, urgent, recurrence, recurrence_end, recurrence_end_date, recurrence_end_count, created_at, order')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return ((rows ?? []) as DbTask[]).map(toTask)
}

/** 新建清单（仅 custom） */
export async function createList(userId: string, name: string): Promise<List> {
  const { data, error } = await supabase
    .from('lists')
    .insert({ user_id: userId, name, type: 'custom' })
    .select('id, user_id, name, type, created_at')
    .single()
  if (error) throw error
  return toList(data as DbList)
}

/** 新建任务 */
export async function createTask(
  userId: string,
  payload: {
    title: string
    listId: string
    dueDate?: string | null
    dueTime?: string | null
    important?: boolean
    urgent?: boolean
    recurrence?: RecurrenceType
    recurrenceEnd?: RecurrenceEndType
    recurrenceEndDate?: string | null
    recurrenceEndCount?: number | null
  }
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      list_id: payload.listId,
      title: payload.title.trim(),
      due_date: payload.dueDate || null,
      due_time: payload.dueTime || null,
      recurrence: payload.recurrence ?? '',
      recurrence_end: payload.recurrenceEnd ?? 'never',
      recurrence_end_date: payload.recurrenceEndDate || null,
      recurrence_end_count: payload.recurrenceEndCount ?? null,
      completed: false,
      important: payload.important ?? false,
      urgent: payload.urgent ?? false,
    })
    .select('id, user_id, list_id, title, due_date, due_time, completed, important, urgent, recurrence, recurrence_end, recurrence_end_date, recurrence_end_count, created_at, order')
    .single()
  if (error) throw error
  return toTask(data as DbTask)
}

/** 更新任务 */
export async function updateTask(
  userId: string,
  taskId: string,
  patch: Partial<Pick<Task, 'title' | 'listId' | 'dueDate' | 'dueTime' | 'completed' | 'important' | 'urgent' | 'recurrence' | 'recurrenceEnd' | 'recurrenceEndDate' | 'recurrenceEndCount'>>
): Promise<Task> {
  const row: Record<string, unknown> = {}
  if (patch.title !== undefined) row.title = patch.title.trim()
  if (patch.listId !== undefined) row.list_id = patch.listId
  if (patch.dueDate !== undefined) row.due_date = patch.dueDate || null
  if (patch.dueTime !== undefined) row.due_time = patch.dueTime || null
  if (patch.recurrence !== undefined) row.recurrence = patch.recurrence ?? ''
  if (patch.recurrenceEnd !== undefined) row.recurrence_end = patch.recurrenceEnd ?? 'never'
  if (patch.recurrenceEndDate !== undefined) row.recurrence_end_date = patch.recurrenceEndDate || null
  if (patch.recurrenceEndCount !== undefined) row.recurrence_end_count = patch.recurrenceEndCount ?? null
  if (patch.completed !== undefined) row.completed = patch.completed
  if (patch.important !== undefined) row.important = patch.important
  if (patch.urgent !== undefined) row.urgent = patch.urgent
  if (Object.keys(row).length === 0) {
    const tasks = await fetchTasks(userId)
    return tasks.find(t => t.id === taskId) as Task
  }
  const { data, error } = await supabase
    .from('tasks')
    .update(row)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select('id, user_id, list_id, title, due_date, due_time, completed, important, urgent, recurrence, recurrence_end, recurrence_end_date, recurrence_end_count, created_at, order')
    .single()
  if (error) throw error
  return toTask(data as DbTask)
}

/** 删除任务 */
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId)
  if (error) throw error
}
