import { useState, useMemo } from 'react'
import { useTasks } from '../hooks/useTasks'
import type { Task } from '../types/task'
import './CalendarView.css'

type CalendarViewType = 'week' | 'month'

const WEEKDAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8)

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function getWeekDates(weekStart: Date): string[] {
  const out: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    out.push(toDateStr(d))
  }
  return out
}

export default function CalendarView() {
  const { tasks } = useTasks()
  const [viewType, setViewType] = useState<CalendarViewType>('week')
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [monthDate, setMonthDate] = useState(() => new Date())

  const todayStr = toDateStr(new Date())
  const goToToday = () => {
    setWeekStart(getMonday(new Date()))
    setMonthDate(new Date())
  }
  const prev = () => {
    if (viewType === 'week') {
      const d = new Date(weekStart)
      d.setDate(d.getDate() - 7)
      setWeekStart(d)
    } else {
      setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))
    }
  }
  const next = () => {
    if (viewType === 'week') {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + 7)
      setWeekStart(d)
    } else {
      setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))
    }
  }

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart])
  const weekStartStr = weekDates[0]
  const weekEndStr = weekDates[6]
  const calendarTasks = useMemo(() => tasks.filter(t => t.dueDate), [tasks])
  const tasksInWeek = useMemo(
    () => calendarTasks.filter(t => t.dueDate && t.dueDate >= weekStartStr && t.dueDate <= weekEndStr),
    [calendarTasks, weekStartStr, weekEndStr]
  )
  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {}
    weekDates.forEach(d => { map[d] = [] })
    tasksInWeek.forEach(t => {
      if (t.dueDate && map[t.dueDate]) map[t.dueDate].push(t)
    })
    return map
  }, [weekDates, tasksInWeek])

  const weekTitle = weekStart.getMonth() + 1 + '月 · 第' + Math.ceil((weekStart.getDate() + (weekStart.getDay() || 7) - 1) / 7) + '周'
  const monthTitle = monthDate.getFullYear() + '年' + (monthDate.getMonth() + 1) + '月'

  return (
    <div className="calendar-view">
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-nav">
          <button type="button" className="calendar-nav-btn" onClick={prev}>‹</button>
          <button type="button" className="calendar-today-btn" onClick={goToToday}>今天</button>
          <button type="button" className="calendar-nav-btn" onClick={next}>›</button>
        </div>
        <span className="calendar-title">{viewType === 'week' ? weekTitle : monthTitle}</span>
        <div className="calendar-view-tabs">
          <button type="button" className={'calendar-tab ' + (viewType === 'week' ? 'active' : '')} onClick={() => setViewType('week')}>周视图</button>
          <button type="button" className={'calendar-tab ' + (viewType === 'month' ? 'active' : '')} onClick={() => setViewType('month')}>月视图</button>
        </div>
      </div>

      {viewType === 'week' && (
        <div className="calendar-week">
          <div className="calendar-week-header">
            <div className="calendar-week-time-col" />
            {weekDates.map((d, i) => (
              <div key={d} className={'calendar-week-day-col ' + (d === todayStr ? 'today' : '')}>
                <span className="calendar-week-day-name">{WEEKDAY_NAMES[i]}</span>
                <span className="calendar-week-day-num">{new Date(d).getDate()}</span>
              </div>
            ))}
          </div>
          <div className="calendar-week-allday">
            <div className="calendar-week-time-col"><span>全天</span></div>
            {weekDates.map(d => (
              <div key={d} className={'calendar-week-cell ' + (d === todayStr ? 'today' : '')}>
                {(tasksByDay[d] ?? []).filter(t => !t.dueTime).map(t => (
                  <div key={t.id} className={'calendar-week-event calendar-event-allday' + (t.completed ? ' completed' : '')} title={t.title}>{t.title}</div>
                ))}
              </div>
            ))}
          </div>
          {HOURS.map(hour => (
            <div key={hour} className="calendar-week-row">
              <div className="calendar-week-time-col"><span>{hour}:00</span></div>
              {weekDates.map(d => (
                <div key={d} className={'calendar-week-cell ' + (d === todayStr ? 'today' : '')}>
                  {(tasksByDay[d] ?? []).filter(t => {
                    if (!t.dueTime) return false
                    const h = parseInt(t.dueTime.slice(0, 2), 10)
                    return h === hour
                  }).map(t => (
                    <div key={t.id} className={'calendar-week-event' + (t.completed ? ' completed' : '')} title={t.title + ' ' + t.dueTime}>
                      <span className="calendar-event-time">{t.dueTime}</span>
                      <span className="calendar-event-title">{t.title}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {viewType === 'month' && (
        <MonthGrid year={monthDate.getFullYear()} month={monthDate.getMonth()} tasks={calendarTasks} todayStr={todayStr} />
      )}
    </div>
  )
}

function MonthGrid({ year, month, tasks, todayStr }: { year: number; month: number; tasks: Task[]; todayStr: string }) {
  const firstDay = new Date(year, month, 1)
  const startMonday = getMonday(firstDay)
  const days: { date: string; isCurrentMonth: boolean }[] = []
  const d = new Date(startMonday)
  for (let i = 0; i < 42; i++) {
    days.push({ date: toDateStr(d), isCurrentMonth: d.getMonth() === month })
    d.setDate(d.getDate() + 1)
  }
  const tasksByDate: Record<string, Task[]> = {}
  tasks.forEach(t => {
    if (!t.dueDate) return
    if (!tasksByDate[t.dueDate]) tasksByDate[t.dueDate] = []
    tasksByDate[t.dueDate].push(t)
  })

  return (
    <div className="calendar-month">
      <div className="calendar-month-header">
        {WEEKDAY_NAMES.map(name => <div key={name} className="calendar-month-weekday">{name}</div>)}
      </div>
      <div className="calendar-month-grid">
        {days.map(({ date, isCurrentMonth }) => {
          const dayTasks = tasksByDate[date] ?? []
          return (
            <div key={date} className={'calendar-month-cell ' + (!isCurrentMonth ? 'other-month' : '') + (date === todayStr ? ' today' : '')}>
              <span className="calendar-month-day-num">{new Date(date).getDate()}</span>
              <div className="calendar-month-events">
                {dayTasks.slice(0, 3).map(t => (
                  <div key={t.id} className={'calendar-month-event' + (t.completed ? ' completed' : '')} title={t.title}>{t.dueTime ? t.dueTime + ' ' : ''}{t.title}</div>
                ))}
                {dayTasks.length > 3 && <div className="calendar-month-more">+{dayTasks.length - 3}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
