import type { CourseItem } from '../data/courses'
import './CourseCard.css'

interface CourseCardProps {
  item: CourseItem
}

export default function CourseCard({ item }: CourseCardProps) {
  return (
    <article className="course-card">
      <div className={`course-card-cover ${item.coverClass ?? ''}`} />
      {item.pinned && (
        <span className="course-card-pin" aria-hidden>
          📌
        </span>
      )}
      {item.badge != null && item.badge > 0 && (
        <span className="course-card-badge">{item.badge}</span>
      )}
      <div className="course-card-body">
        <h3 className="course-card-title">{item.title}</h3>
        <p className="course-card-source">{item.source}</p>
      </div>
    </article>
  )
}
