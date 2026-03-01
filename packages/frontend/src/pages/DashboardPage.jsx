import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderLock, ShieldCheck, Baby, Users, BookOpen,
  Landmark, Bitcoin, Star, Building2, Scale, MessageSquare, User
} from 'lucide-react'

const features = [
  {
    path: '/concierge',
    icon: FolderLock,
    title: 'Pre-Death Concierge',
    description: 'Document vault, task workflows, executor collaboration & password consolidation.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    path: '/guardian',
    icon: ShieldCheck,
    title: 'AI Guardian Mode',
    description: 'Journaling, wellness check-ins, trusted contacts & safety alerts.',
    color: 'from-green-500 to-green-600'
  },
  {
    path: '/kids',
    icon: Baby,
    title: 'AfterMe for Kids',
    description: 'Time-capsule messages with age triggers & safe content policies.',
    color: 'from-pink-500 to-pink-600'
  },
  {
    path: '/family',
    icon: Users,
    title: 'Couples & Family Plans',
    description: 'Shared vault, family timelines & cross-access permissions.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    path: '/biographer',
    icon: BookOpen,
    title: 'AI Biographer',
    description: 'Ingest media & transcripts, build your life timeline & autobiography.',
    color: 'from-orange-500 to-orange-600'
  },
  {
    path: '/banking',
    icon: Landmark,
    title: 'Bank Partnerships',
    description: 'Verification flows, audit logs, compliance & estate transfer workflows.',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    path: '/crypto',
    icon: Bitcoin,
    title: 'Crypto Inheritance',
    description: 'Multi-sig wallets, recovery mechanisms & inheritance triggers.',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    path: '/creator',
    icon: Star,
    title: 'Creator Licensing',
    description: 'Storefront, fan subscriptions, revenue share & licensing agreements.',
    color: 'from-rose-500 to-rose-600'
  },
  {
    path: '/tenant',
    icon: Building2,
    title: 'Gov & Nonprofit',
    description: 'Multi-tenant deployments, grant reporting & consent frameworks.',
    color: 'from-teal-500 to-teal-600'
  },
  {
    path: '/executor',
    icon: Scale,
    title: 'AI Executor & Probate',
    description: 'Step-by-step case engine, form generation & beneficiary management.',
    color: 'from-indigo-500 to-indigo-600'
  }
]

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">AfterMe Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
            >
              <MessageSquare size={16} /> Messages
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
            >
              <User size={16} /> Profile
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-gray-600 mb-8 text-lg">
          Select a service to get started with your digital legacy planning.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ path, icon: Icon, title, description, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="text-left bg-white rounded-xl shadow hover:shadow-md border border-gray-100 overflow-hidden transition group"
            >
              <div className={`bg-gradient-to-r ${color} p-5`}>
                <Icon size={32} className="text-white" />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-primary-600 transition">
                  {title}
                </h3>
                <p className="text-gray-600 text-sm">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
