
import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/mainPages/login/LoginPage'
import MyWorkspaces from './pages/mainPages/myWorkspaces/myWorkspaces'
import HomePage from './pages/mainPages/home/HomePage'
import BookWorkspaces from './pages/workspacePages/workspaceFrame/BookWorkspaces'
import MainLayout from './components/mainPages/layout/MainLayout'
import { Outlet } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MainLayout><Outlet /></MainLayout>}>
          <Route index element={<HomePage />} />
          <Route path="workspaces" element={<MyWorkspaces />} />
        </Route>
        <Route path="/workspace" element={<BookWorkspaces />} />
      </Routes>
    </div>
  )
}

export default App