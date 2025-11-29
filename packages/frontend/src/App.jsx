import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import LegacyProfilePage from './pages/LegacyProfilePage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/chat" /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={token ? <Navigate to="/chat" /> : <SignupPage />}
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legacy/:userId"
          element={<LegacyProfilePage />}
        />
        <Route path="/" element={<Navigate to="/chat" />} />
      </Routes>
    </BrowserRouter>
  )
}
