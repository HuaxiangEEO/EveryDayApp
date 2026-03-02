// 清单：系统默认 + 用户清单。all/today/recent7 为虚拟视图，不落库
export interface List {
  id: string
  name: string
  type: 'all' | 'today' | 'recent7' | 'inbox' | 'custom' | 'history'
}

/** 重复类型：无、每天、每周、每月、每年、工作日 */
export type RecurrenceType = '' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'weekdays'

/** 结束重复：一直重复、按日期结束、按次数结束 */
export type RecurrenceEndType = 'never' | 'date' | 'count'

export interface Task {
  id: string
  title: string
  listId: string
  dueDate: string | null
  /** 截止时间 "HH:mm"，仅日期时为空 */
  dueTime: string | null
  completed: boolean
  important: boolean
  urgent: boolean
  /** 周期性重复 */
  recurrence: RecurrenceType
  /** 结束重复方式 */
  recurrenceEnd: RecurrenceEndType
  /** 按日期结束时：截止日期 ISO */
  recurrenceEndDate: string | null
  /** 按次数结束时：重复次数 */
  recurrenceEndCount: number | null
  createdAt: string
  order?: number
}

export type DateGroupKey = 'overdue' | 'tomorrow' | 'recent7' | 'noDate'
