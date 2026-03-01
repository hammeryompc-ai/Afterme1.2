import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, User, MessageCircle,
  FileText, Shield, Gift, Users, BookOpen,
  Briefcase, Coins, Star, Building2
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const FEATURES = [
  {
    id: 'vault',
    path: '/vault',
    label: 'Pre-Death Concierge',
    description: 'Document vault, task workflows, executor collaboration & password management.',
    icon: FileText,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'guardian',
    path: '/guardian',
    label: 'AI Guardian Mode',
    description: 'Daily check-ins, journaling, mood tracking, trusted contacts & safety alerts.',
    icon: Shield,
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'timecapsule',
    path: '/timecapsule',
    label: 'AfterMe for Kids',
    description: 'Time-capsule messages released by age, date, or event with safe content policies.',
    icon: Gift,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'family',
    path: '/family',
    label: 'Couples & Family Plans',
    description: 'Shared vault, family space, permissioning, and cross-access timelines.',
    icon: Users,
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'biography',
    path: '/biography',
    label: 'AI Biographer',
    description: 'Life timeline builder, media ingestion, transcript processing & autobiography output.',
    icon: BookOpen,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'estate',
    path: '/estate',
    label: 'AI Executor & Probate',
    description: 'Step-by-step probate engine, form generation, beneficiary management & evidence vault.',
    icon: Briefcase,
    color: 'from-gray-600 to-gray-800'
  },
  {
    id: 'crypto',
    path: '/crypto',
    label: 'Crypto Inheritance Bridge',
    description: 'Multi-sig workflows, secure key recovery mechanisms & inheritance triggers.',
    icon: Coins,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'creator',
    path: '/creator',
    label: 'Celebrity & Influencer',
    description: 'Creator storefront, fan subscriptions, revenue share tracking & licensing agreements.',
    icon: Star,
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 'admin',
    path: '/admin',
    label: 'Government & Nonprofit',
    description: 'Multi-tenant deployments, grant reporting, program dashboards & consent frameworks.',
    icon: Building2,
    color: 'from-slate-500 to-slate-700'
  }
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">AfterMe Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition text-gray-700 text-sm"
            >
              <MessageCircle size={18} />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition text-gray-700 text-sm"
            >
              <User size={18} />
              <span className="hidden sm:inline">Profile</span>
            </button>
            <button
              onClick={() => { logout(); navigate('/login') }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-red-100 rounded-lg transition text-red-600 text-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Welcome back, {user?.firstName} 👋
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            Your complete digital legacy platform. Manage your documents, leave messages for the future,
            and ensure your wishes are carried out exactly as you intend.
          </p>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ id, path, label, description, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-all text-left p-5 group hover:-translate-y-0.5"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{label}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/vault')}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-sm transition"
            >
              + Upload Document
            </button>
            <button
              onClick={() => navigate('/guardian')}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-sm transition"
            >
              + Journal Entry
            </button>
            <button
              onClick={() => navigate('/timecapsule')}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg text-sm transition"
            >
              + Time Capsule
            </button>
            <button
              onClick={() => navigate('/biography')}
              className="px-4 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold rounded-lg text-sm transition"
            >
              + Life Event
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-sm transition"
            >
              Train AI Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
