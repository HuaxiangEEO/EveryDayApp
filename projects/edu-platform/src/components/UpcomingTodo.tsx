import { upcomingTodos } from '../data/todos'
import './UpcomingTodo.css'

const todayItems = upcomingTodos.filter((t) => t.group === 'today')
const weekItems = upcomingTodos.filter((t) => t.group === 'week')

function TodoCard({ item }: { item: (typeof upcomingTodos)[0] }) {
  return (
    <div className="todo-card">
      <span className={`todo-card-icon todo-card-icon--${item.type}`} aria-hidden />
      <div className="todo-card-main">
        <div className="todo-card-title">{item.title}</div>
        {(item.time || item.status) && (
          <div className="todo-card-meta">
            {item.time}
            {item.time && item.status && ' · '}
            {item.status}
          </div>
        )}
        <div className="todo-card-course">{item.course}</div>
        {item.hint && <div className="todo-card-hint">{item.hint}</div>}
        <button
          type="button"
          className={`todo-card-btn ${item.buttonPrimary ? 'todo-card-btn--primary' : ''}`}
        >
          {item.buttonText}
        </button>
      </div>
    </div>
  )
}

export default function UpcomingTodo() {
  return (
    <aside className="upcoming-todo">
      <div className="upcoming-todo-header">
        <h2 className="upcoming-todo-title">近期待办</h2>
        <span className="upcoming-todo-badge">72</span>
        <a href="#" className="upcoming-todo-more">更多</a>
      </div>
      <div className="upcoming-todo-body">
        <section className="upcoming-todo-group">
          <h3 className="upcoming-todo-group-title">今天</h3>
          {todayItems.map((item) => (
            <TodoCard key={item.id} item={item} />
          ))}
        </section>
        <section className="upcoming-todo-group">
          <h3 className="upcoming-todo-group-title">本周</h3>
          {weekItems.map((item) => (
            <TodoCard key={item.id} item={item} />
          ))}
        </section>
      </div>
    </aside>
  )
}
