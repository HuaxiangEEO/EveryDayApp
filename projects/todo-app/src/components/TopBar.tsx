import { useAuth } from '../contexts/AuthContext'
import './TopBar.css'

interface TopBarProps {
  viewMode: 'list' | 'quadrant' | 'calendar'
  listName: string
}

export default function TopBar({ listName }: TopBarProps) {
  const { signOut } = useAuth()
  return (
    <header className="topbar">
      <h1 className="topbar-title">{listName}</h1>
      <button type="button" className="topbar-signout" onClick={() => signOut()}>
        退出
      </button>
    </header>
  )
}
