import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, ShieldCheck, BookOpen, Bell, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { guardianAPI } from '../services/api'

const MOODS = ['great', 'good', 'okay', 'low', 'crisis']
const MOOD_COLORS = {
  great: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  okay: 'bg-yellow-100 text-yellow-800',
  low: 'bg-orange-100 text-orange-800',
  crisis: 'bg-red-100 text-red-800'
}

export default function GuardianPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    try {
      const { data } = await guardianAPI.getProfile()
      setProfile(data)
    } catch {
      toast.error('Failed to load Guardian profile')
    }
  }

  const toggleActive = async () => {
    setLoading(true)
    try {
      const { data } = await guardianAPI.toggle()
      setProfile((p) => ({ ...p, isActive: data.isActive }))
      toast.success(data.isActive ? 'Guardian Mode activated' : 'Guardian Mode paused')
    } catch {
      toast.error('Failed to toggle Guardian Mode')
    } finally { setLoading(false) }
  }

  const handleCheckIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await guardianAPI.checkIn(form)
      toast.success('Check-in recorded!')
      setForm({})
      loadProfile()
    } catch {
      toast.error('Check-in failed')
    } finally { setLoading(false) }
  }

  const handleJournal = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await guardianAPI.addJournalEntry(form)
      toast.success('Journal entry saved')
      setForm({})
      loadProfile()
    } catch {
      toast.error('Failed to save entry')
    } finally { setLoading(false) }
  }

  const handleAddContact = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await guardianAPI.addContact(form)
      toast.success('Trusted contact added')
      setForm({})
      loadProfile()
    } catch {
      toast.error('Failed to add contact')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ShieldCheck },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'checkin', label: 'Check-in', icon: Bell },
    { id: 'contacts', label: 'Trusted Contacts', icon: UserPlus }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">AI Guardian Mode</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setForm({}) }}
              className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === id ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Guardian Status</h3>
                  <p className="text-gray-500 text-sm">AI monitors your wellness and alerts trusted contacts if needed.</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold text-sm ${profile?.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {profile?.isActive ? '● Active' : '○ Inactive'}
                </div>
              </div>
              <button onClick={toggleActive} disabled={loading}
                className={`font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition ${
                  profile?.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-500 text-white hover:bg-green-600'
                }`}>
                {profile?.isActive ? 'Pause Guardian Mode' : 'Activate Guardian Mode'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-5">
                <p className="text-3xl font-bold text-primary-500">{profile?.journalEntries?.length || 0}</p>
                <p className="text-gray-500 text-sm mt-1">Journal Entries</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5">
                <p className="text-3xl font-bold text-green-500">{profile?.checkIns?.length || 0}</p>
                <p className="text-gray-500 text-sm mt-1">Check-ins Completed</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5">
                <p className="text-3xl font-bold text-blue-500">{profile?.trustedContacts?.length || 0}</p>
                <p className="text-gray-500 text-sm mt-1">Trusted Contacts</p>
              </div>
              <div className="bg-white rounded-lg shadow p-5">
                <p className="text-3xl font-bold text-orange-500">
                  {profile?.alerts?.filter((a) => !a.resolved).length || 0}
                </p>
                <p className="text-gray-500 text-sm mt-1">Active Alerts</p>
              </div>
            </div>
          </div>
        )}

        {/* Journal */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">New Journal Entry</h3>
              <form onSubmit={handleJournal} className="space-y-4">
                <textarea required placeholder="How are you feeling today? Write freely..." value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full h-28 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map((m) => (
                      <button key={m} type="button" onClick={() => setForm({ ...form, mood: m })}
                        className={`px-3 py-1 rounded-full text-sm font-semibold capitalize transition ${form.mood === m ? MOOD_COLORS[m] : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Save Entry
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Recent Entries</h3>
              {profile?.journalEntries?.length === 0 && <p className="text-gray-500 text-sm">No journal entries yet.</p>}
              <ul className="space-y-4">
                {[...(profile?.journalEntries || [])].reverse().slice(0, 10).map((entry) => (
                  <li key={entry._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${MOOD_COLORS[entry.mood]}`}>{entry.mood}</span>
                      <span className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{entry.content}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Check-in */}
        {activeTab === 'checkin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Log a Check-in</h3>
              <form onSubmit={handleCheckIn} className="space-y-4">
                <textarea placeholder="How are you doing? (optional)" value={form.response || ''} onChange={(e) => setForm({ ...form, response: e.target.value })}
                  className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map((m) => (
                      <button key={m} type="button" onClick={() => setForm({ ...form, mood: m })}
                        className={`px-3 py-1 rounded-full text-sm font-semibold capitalize transition ${form.mood === m ? MOOD_COLORS[m] : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Bell size={16} /> Submit Check-in
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Check-in History ({profile?.checkIns?.length || 0})</h3>
              {profile?.checkIns?.length === 0 && <p className="text-gray-500 text-sm">No check-ins yet.</p>}
              <ul className="space-y-3">
                {[...(profile?.checkIns || [])].reverse().slice(0, 10).map((c) => (
                  <li key={c._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${MOOD_COLORS[c.mood]}`}>{c.mood}</span>
                    <div>
                      {c.response && <p className="text-sm text-gray-700">{c.response}</p>}
                      <p className="text-xs text-gray-400">{new Date(c.completedAt).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Contacts */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Add Trusted Contact</h3>
              <form onSubmit={handleAddContact} className="space-y-4">
                <input required placeholder="Full name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input type="email" required placeholder="Email address" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input placeholder="Phone (optional)" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <UserPlus size={16} /> Add Contact
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Trusted Contacts ({profile?.trustedContacts?.length || 0})</h3>
              {profile?.trustedContacts?.length === 0 && <p className="text-gray-500 text-sm">No trusted contacts yet.</p>}
              <ul className="space-y-3">
                {profile?.trustedContacts?.map((c) => (
                  <li key={c._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <UserPlus size={18} className="text-primary-500" />
                    <div>
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.email}{c.phone && ` · ${c.phone}`}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
