import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import LegacyProfilePage from './pages/LegacyProfilePage'
import DashboardPage from './pages/DashboardPage'
import VaultPage from './pages/VaultPage'
import GuardianPage from './pages/GuardianPage'
import TimeCapsulePage from './pages/TimeCapsulePage'
import FamilyPage from './pages/FamilyPage'
import BiographyPage from './pages/BiographyPage'
import EstatePage from './pages/EstatePage'
import CryptoPage from './pages/CryptoPage'
import CreatorPage from './pages/CreatorPage'
import AdminPage from './pages/AdminPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const { token } = useAuthStore()

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={token ? <Navigate to="/dashboard" /> : <SignupPage />}
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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vault"
          element={
            <ProtectedRoute>
              <VaultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guardian"
          element={
            <ProtectedRoute>
              <GuardianPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timecapsule"
          element={
            <ProtectedRoute>
              <TimeCapsulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute>
              <FamilyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/biography"
          element={
            <ProtectedRoute>
              <BiographyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estate"
          element={
            <ProtectedRoute>
              <EstatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crypto"
          element={
            <ProtectedRoute>
              <CryptoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator"
          element={
            <ProtectedRoute>
              <CreatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/legacy/:userId"
          element={<LegacyProfilePage />}
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

