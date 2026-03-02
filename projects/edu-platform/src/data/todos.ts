// 近期待办模拟数据
export interface TodoItem {
  id: string
  title: string
  type: 'video' | 'doc'
  time?: string
  course: string
  status?: string
  hint?: string
  buttonText: string
  buttonPrimary?: boolean
  group: 'today' | 'week'
}

export const upcomingTodos: TodoItem[] = [
  {
    id: '1',
    title: '12月2日课后三角函数',
    type: 'video',
    time: '18:30 开始,陈光',
    course: '文言文精讲与现代文创作课',
    status: '已上课10分',
    buttonText: '进入教室',
    buttonPrimary: true,
    group: 'today',
  },
  {
    id: '2',
    title: '【催交】期末大作业提交',
    type: 'doc',
    time: '今日12:00截止',
    course: '计算机科学导论',
    hint: '老师催交',
    buttonText: '写作业',
    group: 'today',
  },
  {
    id: '3',
    title: '【作业】物理实验报告',
    type: 'doc',
    status: '昨日已截止,李老师',
    course: '物理实验',
    hint: '需修正数据分析部分',
    buttonText: '去订正',
    buttonPrimary: true,
    group: 'today',
  },
  {
    id: '4',
    title: "Hello! I'm Baobao",
    type: 'video',
    time: '周五19:30、陈光',
    course: '英语口语提升班',
    status: '即将开始',
    buttonText: '备课',
    group: 'week',
  },
  {
    id: '5',
    title: '【作业】AI+超级个体',
    type: 'doc',
    time: '周日截止,陈光',
    course: '翼鸥产品方法论',
    status: '32人已提交',
    hint: '待批阅8',
    buttonText: '去批阅',
    group: 'week',
  },
]
