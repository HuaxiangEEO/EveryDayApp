import './TopBar.css'

export default function TopBar() {
  return (
    <header className="topbar">
      <button type="button" className="topbar-search" aria-label="搜索">
        <span className="topbar-icon topbar-icon--search" />
      </button>
      <button type="button" className="topbar-status">
        <span>5节课进行中</span>
        <span className="topbar-icon topbar-icon--chevron" />
      </button>
      <div className="topbar-actions">
        <button type="button" className="topbar-icon topbar-icon--plus" aria-label="新建" />
        <button type="button" className="topbar-icon topbar-icon--refresh" aria-label="刷新" />
        <button type="button" className="topbar-avatar" aria-label="个人" />
      </div>
    </header>
  )
}
