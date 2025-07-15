
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/mainPages/login/LoginPage'
import MyWorkspaces from './pages/mainPages/myWorkspaces/myWorkspaces'
import BookWorkspaces from './pages/mainPages/myWorkspaces/BookWorkspaces'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<BookWorkspaces />} />
        <Route path="/workspaces" element={<MyWorkspaces />} />
      </Routes>
    </div>
  )
}

export default App