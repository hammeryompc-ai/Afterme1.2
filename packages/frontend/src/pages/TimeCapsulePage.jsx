import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Gift, Plus, Trash2, Save, X, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { timecapsuleAPI } from '../services/api'

const RELEASE_TYPES = ['date', 'age', 'event', 'on_death']
const CONTENT_RATINGS = ['all_ages', 'teen', 'adult']

export default function TimeCapsulePage() {
  const navigate = useNavigate()
  const [capsules, setCapsules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    message: '',
    recipientName: '',
    recipientEmail: '',
    releaseType: 'date',
    releaseDate: '',
    releaseAge: '',
    releaseEvent: '',
    contentRating: 'all_ages'
  })

  useEffect(() => {
    loadCapsules()
  }, [])

  const loadCapsules = async () => {
    setLoading(true)
    try {
      const { data } = await timecapsuleAPI.getCapsules()
      setCapsules(data)
    } catch {
      toast.error('Failed to load time capsules')
    } finally {
      setLoading(false)
    }
  }

  const saveCapsule = async () => {
    if (!form.title || !form.message) {
      toast.error('Title and message are required')
      return
    }
    try {
      await timecapsuleAPI.createCapsule(form)
      toast.success('Time capsule created!')
      setShowForm(false)
      setForm({
        title: '', message: '', recipientName: '', recipientEmail: '',
        releaseType: 'date', releaseDate: '', releaseAge: '', releaseEvent: '', contentRating: 'all_ages'
      })
      loadCapsules()
    } catch {
      toast.error('Failed to create time capsule')
    }
  }

  const deleteCapsule = async (id) => {
    try {
      await timecapsuleAPI.deleteCapsule(id)
      toast.success('Time capsule deleted')
      loadCapsules()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const releaseLabel = (capsule) => {
    if (capsule.releaseType === 'date' && capsule.releaseDate) {
      return `Releases on ${new Date(capsule.releaseDate).toLocaleDateString()}`
    }
    if (capsule.releaseType === 'age') return `Releases at age ${capsule.releaseAge}`
    if (capsule.releaseType === 'event') return `Releases on: ${capsule.releaseEvent}`
    if (capsule.releaseType === 'on_death') return 'Releases on death'
    return 'Release condition not set'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-primary-500 hover:text-primary-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AfterMe for Kids</h1>
            <p className="text-sm text-gray-500">Time-capsule messages for the next generation</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Gift size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-purple-900">Leave messages for the future</p>
            <p className="text-sm text-purple-700">
              Create personal messages, videos, or stories to be delivered to your children or loved ones
              at the right moment — a birthday, graduation, or when they come of age.
            </p>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            <Plus size={16} /> Create Capsule
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">New Time Capsule</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="grid gap-4">
              <input
                placeholder="Title (e.g., 'To My Daughter on Her 18th Birthday')"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="Recipient name"
                  value={form.recipientName}
                  onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <input
                  placeholder="Recipient email"
                  type="email"
                  value={form.recipientEmail}
                  onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <textarea
                placeholder="Your message..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 h-32 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Release Trigger</label>
                <select
                  value={form.releaseType}
                  onChange={(e) => setForm({ ...form, releaseType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {RELEASE_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              {form.releaseType === 'date' && (
                <input
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              )}
              {form.releaseType === 'age' && (
                <input
                  type="number"
                  placeholder="Age to unlock (e.g., 18)"
                  value={form.releaseAge}
                  onChange={(e) => setForm({ ...form, releaseAge: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              )}
              {form.releaseType === 'event' && (
                <input
                  placeholder="Event description (e.g., On graduation day)"
                  value={form.releaseEvent}
                  onChange={(e) => setForm({ ...form, releaseEvent: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content Rating</label>
                <select
                  value={form.contentRating}
                  onChange={(e) => setForm({ ...form, contentRating: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {CONTENT_RATINGS.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={saveCapsule} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition">
                <Save size={16} /> Save Capsule
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : capsules.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Gift size={48} className="mx-auto mb-4 opacity-30" />
            <p>No time capsules yet. Create your first message to the future!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {capsules.map((capsule) => (
              <div key={capsule._id} className="bg-white rounded-lg shadow p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{capsule.title}</h3>
                      {capsule.isDelivered && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Delivered</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">To: {capsule.recipientName || capsule.recipientEmail}</p>
                    <p className="text-gray-700 text-sm line-clamp-2">{capsule.message}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                      <Clock size={12} />
                      <span>{releaseLabel(capsule)}</span>
                      <span className="ml-2">· {capsule.contentRating?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  {!capsule.isDelivered && (
                    <button onClick={() => deleteCapsule(capsule._id)} className="p-2 hover:bg-red-100 rounded-lg text-red-400 ml-3">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
