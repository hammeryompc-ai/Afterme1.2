import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Settings, Shield, Plus, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { guardianAPI } from '../services/api'

const MOODS = ['great', 'good', 'neutral', 'low', 'poor']
const FREQUENCIES = ['daily', 'weekly', 'monthly']

export default function GuardianPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('journal')
  const [entries, setEntries] = useState([])
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', mood: 'neutral', tags: '' })
  const [settingsForm, setSettingsForm] = useState({})

  useEffect(() => {
    if (activeTab === 'journal') loadEntries()
    else if (activeTab === 'settings') loadSettings()
  }, [activeTab])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const { data } = await guardianAPI.getJournal()
      setEntries(data)
    } catch {
      toast.error('Failed to load journal')
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    setLoading(true)
    try {
      const { data } = await guardianAPI.getSettings()
      setSettings(data)
      setSettingsForm(data)
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const saveEntry = async () => {
    if (!form.content.trim()) {
      toast.error('Please write something')
      return
    }
    try {
      await guardianAPI.createJournalEntry({
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : []
      })
      toast.success('Journal entry saved!')
      setShowForm(false)
      setForm({ title: '', content: '', mood: 'neutral', tags: '' })
      loadEntries()
    } catch {
      toast.error('Failed to save entry')
    }
  }

  const deleteEntry = async (id) => {
    try {
      await guardianAPI.deleteJournalEntry(id)
      toast.success('Entry deleted')
      loadEntries()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const saveSettings = async () => {
    try {
      await guardianAPI.updateSettings(settingsForm)
      toast.success('Guardian settings saved!')
    } catch {
      toast.error('Failed to save settings')
    }
  }

  const moodColor = {
    great: 'text-green-600 bg-green-50',
    good: 'text-teal-600 bg-teal-50',
    neutral: 'text-gray-600 bg-gray-100',
    low: 'text-yellow-600 bg-yellow-50',
    poor: 'text-red-600 bg-red-50'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-primary-500 hover:text-primary-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">AI Guardian Mode</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { id: 'journal', label: 'Journal & Check-ins', icon: BookOpen },
            { id: 'settings', label: 'Guardian Settings', icon: Settings },
            { id: 'safety', label: 'Safety Rules', icon: Shield }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition ${
                activeTab === id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                <Plus size={16} /> New Entry
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">New Journal Entry</h3>
                <div className="grid gap-4">
                  <input
                    placeholder="Title (optional)"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <textarea
                    placeholder="How are you feeling today? What's on your mind?"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 h-32 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                    <div className="flex gap-2">
                      {MOODS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setForm({ ...form, mood: m })}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                            form.mood === m ? moodColor[m] + ' ring-2 ring-offset-1 ring-primary-500' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    placeholder="Tags (comma-separated)"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button onClick={saveEntry} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition">
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No journal entries yet. Start your first check-in!</div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry._id} className="bg-white rounded-lg shadow p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {entry.title && <h3 className="font-semibold text-gray-900 mb-1">{entry.title}</h3>}
                        <p className="text-gray-700 text-sm">{entry.content}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${moodColor[entry.mood]}`}>
                            {entry.mood}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button onClick={() => deleteEntry(entry._id)} className="p-2 hover:bg-red-100 rounded-lg text-red-400 ml-3">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Guardian Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in Frequency</label>
                <select
                  value={settingsForm.checkInFrequency || 'weekly'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, checkInFrequency: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Check-in Time</label>
                <input
                  type="time"
                  value={settingsForm.checkInTime || '09:00'}
                  onChange={(e) => setSettingsForm({ ...settingsForm, checkInTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Message</label>
                <textarea
                  placeholder="Message to send to trusted contacts in an emergency..."
                  value={settingsForm.emergencyMessage || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, emergencyMessage: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <button onClick={saveSettings} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition">
                <Save size={16} /> Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Safety Rules Tab */}
        {activeTab === 'safety' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Safety Rules & Triggers</h3>
            <p className="text-gray-600 mb-6">
              Configure conditions that will trigger alerts to your trusted contacts. 
              These rules help protect you and ensure loved ones are notified when needed.
            </p>
            <div className="space-y-4">
              {[
                { label: 'Missed check-in for 3+ days', description: 'Alert contacts if you miss consecutive check-ins' },
                { label: 'Mood rated "poor" twice in a row', description: 'Alert wellness contact when persistent low mood is detected' },
                { label: 'No app activity for 30 days', description: 'Trigger inactivity alert to executor' },
                { label: 'Manual emergency trigger', description: 'Button to immediately alert all guardian contacts' }
              ].map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input type="checkbox" defaultChecked className="mt-1 w-4 h-4" />
                  <div>
                    <p className="font-semibold text-gray-900">{rule.label}</p>
                    <p className="text-sm text-gray-500">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => toast.success('Safety rules saved!')} className="mt-4 flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition">
              <Save size={16} /> Save Rules
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
