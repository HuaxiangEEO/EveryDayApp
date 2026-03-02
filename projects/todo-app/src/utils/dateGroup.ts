import type { Task } from '../types/task'
import type { DateGroupKey } from '../types/task'

const today = (): string => {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

const tomorrow = (): string => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

/** 判断日期是否在「今天起 7 天内」（不含今天） */
function isWithinNext7Days(dateStr: string): boolean {
  const todayStr = today()
  const tomorrowStr = tomorrow()
  if (dateStr <= todayStr) return false
  const end = new Date()
  end.setDate(end.getDate() + 7)
  const endStr = end.toISOString().slice(0, 10)
  return dateStr >= tomorrowStr && dateStr <= endStr
}

/** 将任务按日期分组：已过期、明天、最近7天、无日期。今天归入最近7天。 */
export function getDateGroupKey(task: Task): DateGroupKey {
  const due = task.dueDate
  if (!due) return 'noDate'
  const todayStr = today()
  const tomorrowStr = tomorrow()
  if (due < todayStr) return 'overdue'
  if (due === tomorrowStr) return 'tomorrow'
  if (due === todayStr || isWithinNext7Days(due)) return 'recent7'
  return 'recent7'
}

export const DATE_GROUP_ORDER: DateGroupKey[] = ['overdue', 'tomorrow', 'recent7', 'noDate']

export const DATE_GROUP_LABELS: Record<DateGroupKey, string> = {
  overdue: '已过期',
  tomorrow: '明天',
  recent7: '最近7天',
  noDate: '无日期',
}

/** 将任务列表按日期分组，返回 Map<DateGroupKey, Task[]> */
export function groupTasksByDate(tasks: Task[]): Map<DateGroupKey, Task[]> {
  const map = new Map<DateGroupKey, Task[]>()
  for (const key of DATE_GROUP_ORDER) {
    map.set(key, [])
  }
  for (const task of tasks) {
    const key = getDateGroupKey(task)
    map.get(key)!.push(task)
  }
  return map
}
