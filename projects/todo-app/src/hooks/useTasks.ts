import { useState, useEffect, useCallback } from 'react'
import type { List, Task, RecurrenceType, RecurrenceEndType } from '../types/task'
import { useAuth } from '../contexts/AuthContext'
import * as api from '../data/api'
import { groupTasksByDate } from '../utils/dateGroup'

const todayISO = (): string => new Date().toISOString().slice(0, 10)
const tomorrowISO = (): string => {
  const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10)
}
const inNext7Days = (dateStr: string): boolean => {
  const t = todayISO()
  const tom = tomorrowISO()
  if (dateStr <= t) return false
  const end = new Date(); end.setDate(end.getDate() + 7)
  const endStr = end.toISOString().slice(0, 10)
  return dateStr >= tom && dateStr <= endStr
}

function filterTasksByList(tasks: Task[], list: List): Task[] {
  const incomplete = tasks.filter(t => !t.completed)
  if (list.type === 'all') return incomplete
  if (list.type === 'today') return incomplete.filter(t => t.dueDate === todayISO())
  if (list.type === 'recent7') return incomplete.filter(t => t.dueDate && (t.dueDate === todayISO() || t.dueDate === tomorrowISO() || inNext7Days(t.dueDate)))
  if (list.type === 'inbox' || list.type === 'custom') return incomplete.filter(t => t.listId === list.id)
  return incomplete
}

export function getTasksForQuadrant(tasks: Task[], quadrant: 1 | 2 | 3 | 4): Task[] {
  const incomplete = tasks.filter(t => !t.completed)
  if (quadrant === 1) return incomplete.filter(t => t.important && t.urgent)
  if (quadrant === 2) return incomplete.filter(t => t.important && !t.urgent)
  if (quadrant === 3) return incomplete.filter(t => !t.important && t.urgent)
  return incomplete.filter(t => !t.important && !t.urgent)
}

export function useTasks() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const [lists, setLists] = useState<List[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const [listData, taskData] = await Promise.all([api.fetchLists(userId), api.fetchTasks(userId)])
      setLists(listData)
      setTasks(taskData)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const addTask = useCallback(async (title: string, options?: { listId?: string; dueDate?: string | null; dueTime?: string | null; important?: boolean; urgent?: boolean; recurrence?: RecurrenceType; recurrenceEnd?: RecurrenceEndType; recurrenceEndDate?: string | null; recurrenceEndCount?: number | null }) => {
    if (!userId) return
    const listId = options?.listId ?? lists.find(l => l.type === 'inbox')?.id ?? ''
    if (!listId) {
      setError('无法添加：未找到收集箱，请刷新页面重试')
      return
    }
    setError(null)
    try {
      const task = await api.createTask(userId, {
        title,
        listId,
        dueDate: options?.dueDate ?? null,
        dueTime: options?.dueTime ?? null,
        important: options?.important ?? false,
        urgent: options?.urgent ?? false,
        recurrence: options?.recurrence ?? '',
        recurrenceEnd: options?.recurrenceEnd ?? 'never',
        recurrenceEndDate: options?.recurrenceEndDate ?? null,
        recurrenceEndCount: options?.recurrenceEndCount ?? null,
      })
      setTasks(prev => [...prev, task])
      return task
    } catch (e) {
      setError(e instanceof Error ? e.message : '添加失败')
    }
  }, [userId, lists])

  const toggleComplete = useCallback(async (id: string) => {
    if (!userId) return
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const next = !task.completed
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: next } : t))
    try {
      await api.updateTask(userId, id, { completed: next })
    } catch (e) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: task.completed } : t))
      setError(e instanceof Error ? e.message : '更新失败')
    }
  }, [userId, tasks])

  const updateTask = useCallback(async (id: string, patch: Partial<Pick<Task, 'title' | 'listId' | 'dueDate' | 'dueTime' | 'important' | 'urgent' | 'recurrence' | 'recurrenceEnd' | 'recurrenceEndDate' | 'recurrenceEndCount'>>) => {
    if (!userId) return
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
    try {
      const updated = await api.updateTask(userId, id, patch)
      setTasks(prev => prev.map(t => t.id === id ? updated : t))
    } catch (e) {
      setError(e instanceof Error ? e.message : '更新失败')
      load()
    }
  }, [userId, load])

  const deleteTask = useCallback(async (id: string) => {
    if (!userId) return
    setTasks(prev => prev.filter(t => t.id !== id))
    try {
      await api.deleteTask(userId, id)
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败')
      load()
    }
  }, [userId, load])

  const getFilteredForList = useCallback((list: List) => filterTasksByList(tasks, list), [tasks])
  const getGroupedByDate = useCallback((taskList: Task[]) => groupTasksByDate(taskList), [])

  return {
    lists,
    tasks,
    loading,
    error,
    reload: load,
    addTask,
    toggleComplete,
    updateTask,
    deleteTask,
    getFilteredForList,
    getGroupedByDate,
    getTasksForQuadrant: (q: 1 | 2 | 3 | 4) => getTasksForQuadrant(tasks, q),
  }
}
