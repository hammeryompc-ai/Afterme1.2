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
import ConciergePage from './pages/ConciergePage'
import GuardianPage from './pages/GuardianPage'
import KidsPage from './pages/KidsPage'
import FamilyPage from './pages/FamilyPage'
import BiographerPage from './pages/BiographerPage'
import BankingPage from './pages/BankingPage'
import CryptoPage from './pages/CryptoPage'
import CreatorPage from './pages/CreatorPage'
import TenantPage from './pages/TenantPage'
import ExecutorPage from './pages/ExecutorPage'
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
          path="/concierge"
          element={
            <ProtectedRoute>
              <ConciergePage />
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
          path="/kids"
          element={
            <ProtectedRoute>
              <KidsPage />
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
          path="/biographer"
          element={
            <ProtectedRoute>
              <BiographerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/banking"
          element={
            <ProtectedRoute>
              <BankingPage />
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
          path="/tenant"
          element={
            <ProtectedRoute>
              <TenantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/executor"
          element={
            <ProtectedRoute>
              <ExecutorPage />
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

