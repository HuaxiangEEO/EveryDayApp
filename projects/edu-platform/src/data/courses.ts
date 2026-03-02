// 课程卡片模拟数据，对应设计图中的课程列表
export interface CourseItem {
  id: string
  title: string
  source: string
  badge?: number
  pinned?: boolean
  coverClass?: string
}

export const courses: CourseItem[] = [
  { id: '1', title: '逻辑与运算:从基础到进阶的数学思维课', source: '翼鸥大学堂', badge: 3, coverClass: 'cover-math' },
  { id: '2', title: '文言文精讲与现代文创作课', source: '翼鸥大学堂', badge: 3, pinned: true, coverClass: 'cover-book' },
  { id: '3', title: '听说读写全突破:中考高考英语冲刺课', source: '翼鸥大学堂', badge: 12, coverClass: 'cover-english' },
  { id: '4', title: '从公式推导到实验验证的物理课', source: '翼鸥大学堂', coverClass: 'cover-physics' },
  { id: '5', title: 'E=mc² 相对论入门', source: '翼鸥大学堂', badge: 0, coverClass: 'cover-relativity' },
  { id: '6', title: '用对话解锁日常沟通与跨文化认知', source: '翼鸥大学堂', coverClass: 'cover-talk' },
  { id: '7', title: '亲手做实验,读懂物质变化', source: '翼鸥大学堂', coverClass: 'cover-lab' },
]
