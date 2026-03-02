import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import MainContent from './components/MainContent'
import UpcomingTodo from './components/UpcomingTodo'
import './App.css'

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="app-center">
        <TopBar />
        <div className="app-body">
          <MainContent />
          <UpcomingTodo />
        </div>
      </div>
    </div>
  )
}

export default App
