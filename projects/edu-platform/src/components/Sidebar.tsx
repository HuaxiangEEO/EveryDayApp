import './Sidebar.css'

const navItems = [
  { label: '班级', icon: 'classes', badge: 18 },
  { label: '聊天', icon: 'chat' },
  { label: '待办', icon: 'todo', badge: 70 },
  { label: '课程表', icon: 'schedule' },
  { label: '空间', icon: 'space' },
]
const bottomItems = [
  { label: '黑板', icon: 'blackboard' },
  { label: '投屏', icon: 'screen' },
]

function Icon({ name }: { name: string }) {
  return <span className={`sidebar-icon sidebar-icon--${name}`} aria-hidden />
}

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-avatar" aria-hidden />
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <a key={item.label} href="#" className="sidebar-item sidebar-item--active">
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.badge != null && <span className="sidebar-badge">{item.badge}</span>}
          </a>
        ))}
      </nav>
      <nav className="sidebar-nav sidebar-nav--bottom">
        {bottomItems.map((item) => (
          <a key={item.label} href="#" className="sidebar-item">
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}
