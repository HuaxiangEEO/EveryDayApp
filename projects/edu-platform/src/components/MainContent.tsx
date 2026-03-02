import { useState } from 'react'
import { courses } from '../data/courses'
import CourseCard from './CourseCard'
import './MainContent.css'

const actionButtons = [
  { label: '创建班级', icon: 'plus' },
  { label: '创建公开课', icon: 'globe' },
  { label: '课堂', icon: 'classroom', hot: true },
  { label: '作业', icon: 'homework', hot: true },
  { label: '测验', icon: 'quiz' },
  { label: '录播课', icon: 'record' },
  { label: '学习资料', icon: 'materials' },
  { label: '更多活动', icon: 'grid' },
]

const tabs = ['全部班级', '我是教师', '我是学生', '待处理', '已结课']

export default function MainContent() {
  const [activeTab, setActiveTab] = useState(0)
  const [isList, setIsList] = useState(false)

  return (
    <main className="main-content">
      <div className="main-actions">
        {actionButtons.map((btn) => (
          <button key={btn.label} type="button" className="main-action-btn">
            <span className={`main-action-icon main-action-icon--${btn.icon}`} />
            <span>{btn.label}</span>
            {btn.hot && <span className="main-action-hot">HOT</span>}
          </button>
        ))}
      </div>
      <div className="main-tabs">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            type="button"
            className={`main-tab ${i === activeTab ? 'main-tab--active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
        <div className="main-tabs-view">
          <button type="button" className={`main-view-btn ${isList ? 'main-view-btn--active' : ''}`} onClick={() => setIsList(true)} aria-label="列表" />
          <button type="button" className={`main-view-btn ${!isList ? 'main-view-btn--active' : ''}`} onClick={() => setIsList(false)} aria-label="网格" />
        </div>
      </div>
      <div className={`main-grid ${isList ? 'main-grid--list' : ''}`}>
        {courses.map((item) => (
          <CourseCard key={item.id} item={item} />
        ))}
        <a href="#" className="course-card course-card--join">
          <span className="course-card-join-icon">+</span>
          <span className="course-card-join-label">加入新班级</span>
        </a>
      </div>
    </main>
  )
}
