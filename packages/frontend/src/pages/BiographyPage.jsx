import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Plus, Trash2, Save, Sparkles, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import { biographyAPI } from '../services/api'

const ENTRY_TYPES = ['life_event', 'memory', 'achievement', 'relationship', 'other']

export default function BiographyPage() {
  const navigate = useNavigate()
  const [biography, setBiography] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('timeline')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: '',
    title: '',
    description: '',
    location: '',
    entryType: 'memory',
    tags: ''
  })

  useEffect(() => {
    loadBiography()
  }, [])

  const loadBiography = async () => {
    setLoading(true)
    try {
      const { data } = await biographyAPI.getBiography()
      setBiography(data)
    } catch {
      toast.error('Failed to load biography')
    } finally {
      setLoading(false)
    }
  }

  const addEntry = async () => {
    if (!form.title || !form.year) {
      toast.error('Title and year are required')
      return
    }
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
        month: form.month ? Number(form.month) : undefined,
        year: Number(form.year)
      }
      const { data } = await biographyAPI.addTimelineEntry(payload)
      setBiography(data)
      setShowForm(false)
      setForm({ year: new Date().getFullYear(), month: '', title: '', description: '', location: '', entryType: 'memory', tags: '' })
      toast.success('Timeline entry added!')
    } catch {
      toast.error('Failed to add entry')
    }
  }

  const deleteEntry = async (id) => {
    try {
      await biographyAPI.deleteTimelineEntry(id)
      loadBiography()
      toast.success('Entry removed')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const generateAutobiography = async () => {
    setGenerating(true)
    try {
      const { data } = await biographyAPI.generateAutobiography()
      setBiography((prev) => ({ ...prev, autobiographyDraft: data.draft }))
      setActiveTab('autobiography')
      toast.success('Autobiography draft generated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate autobiography')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-primary-500 hover:text-primary-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Biographer</h1>
            <p className="text-sm text-gray-500">Build your life story — timeline, media, and autobiography</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { id: 'timeline', label: 'Life Timeline', icon: BookOpen },
            { id: 'media', label: 'Media', icon: Image },
            { id: 'autobiography', label: 'Autobiography', icon: Sparkles }
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

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                <Plus size={16} /> Add Event
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add Timeline Event</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="number"
                    placeholder="Year"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Month (optional)"
                    min={1}
                    max={12}
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div className="grid gap-4">
                  <input
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    placeholder="Location (optional)"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <select
                    value={form.entryType}
                    onChange={(e) => setForm({ ...form, entryType: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {ENTRY_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                  <input
                    placeholder="Tags (comma-separated)"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={addEntry} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition">
                    <Save size={16} /> Add
                  </button>
                </div>
              </div>
            )}

            {biography?.timelineEntries?.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                <p>Your life timeline is empty. Add your first event!</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {biography?.timelineEntries?.map((entry, idx) => (
                    <div key={entry._id || idx} className="flex gap-4 relative">
                      <div className="w-12 h-12 bg-white border-2 border-primary-500 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs flex-shrink-0 z-10">
                        {entry.year}
                      </div>
                      <div className="bg-white rounded-lg shadow p-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs text-primary-500 font-semibold">{entry.entryType?.replace('_', ' ')}</span>
                            <h3 className="font-bold text-gray-900">{entry.title}</h3>
                            {entry.description && <p className="text-sm text-gray-600 mt-1">{entry.description}</p>}
                            {entry.location && <p className="text-xs text-gray-400 mt-1">📍 {entry.location}</p>}
                          </div>
                          <button onClick={() => deleteEntry(entry._id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-400 ml-2">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Media Ingestion</h3>
            <p className="text-gray-600 mb-6">
              Upload photos, videos, audio recordings, or documents to enrich your biography.
              The AI will analyze and transcribe your media to help build your story.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Photos', count: biography?.mediaItems?.filter(m => m.type === 'photo').length || 0 },
                { label: 'Videos', count: biography?.mediaItems?.filter(m => m.type === 'video').length || 0 },
                { label: 'Audio', count: biography?.mediaItems?.filter(m => m.type === 'audio').length || 0 },
                { label: 'Documents', count: biography?.mediaItems?.filter(m => m.type === 'document').length || 0 }
              ].map(({ label, count }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary-500">{count}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-400">
              <Image size={40} className="mx-auto mb-3 opacity-30" />
              <p>Drag & drop files or click to upload</p>
              <p className="text-sm mt-1">Supports photos, videos, audio, and documents</p>
            </div>
          </div>
        )}

        {/* Autobiography Tab */}
        {activeTab === 'autobiography' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">AI-Generated Autobiography</h3>
                {biography?.autobiographyGeneratedAt && (
                  <p className="text-sm text-gray-500">
                    Last generated: {new Date(biography.autobiographyGeneratedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <button
                onClick={generateAutobiography}
                disabled={generating || (biography?.timelineEntries?.length || 0) === 0}
                className="flex items-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {generating ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Sparkles size={16} />
                )}
                {generating ? 'Generating...' : 'Generate Draft'}
              </button>
            </div>

            {biography?.autobiographyDraft ? (
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 font-sans text-sm leading-relaxed bg-gray-50 rounded-lg p-6">
                  {biography.autobiographyDraft}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
                <p>No autobiography draft yet.</p>
                <p className="text-sm mt-1">Add timeline events and then click "Generate Draft".</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
