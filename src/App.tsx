import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/mainPages/login/LoginPage'
import MyWorkspaces from './pages/mainPages/myWorkspaces/myWorkspaces'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<MyWorkspaces />} />
        <Route path="/workspaces" element={<MyWorkspaces />} />
      </Routes>
    </div>
  )
}

export default App