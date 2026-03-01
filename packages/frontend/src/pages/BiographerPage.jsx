import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, BookOpen, Image, Clock, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { biographerAPI } from '../services/api'

export default function BiographerPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('timeline')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => { loadProjects() }, [])

  const loadProjects = async () => {
    try {
      const { data } = await biographerAPI.getProjects()
      setProjects(data)
      if (data.length > 0 && !selected) setSelected(data[0])
    } catch {
      toast.error('Failed to load biography projects')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await biographerAPI.createProject(form)
      setProjects([...projects, data])
      setSelected(data)
      setShowCreate(false)
      setForm({})
      toast.success('Biography project created!')
    } catch {
      toast.error('Failed to create project')
    } finally { setLoading(false) }
  }

  const handleAddMedia = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await biographerAPI.addMedia(selected._id, form)
      toast.success('Media asset added')
      setForm({})
      const { data } = await biographerAPI.getProject(selected._id)
      setSelected(data)
    } catch {
      toast.error('Failed to add media')
    } finally { setLoading(false) }
  }

  const handleAddTimeline = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await biographerAPI.addTimeline(selected._id, form)
      toast.success('Timeline entry added')
      setForm({})
      const { data } = await biographerAPI.getProject(selected._id)
      setSelected(data)
    } catch {
      toast.error('Failed to add timeline entry')
    } finally { setLoading(false) }
  }

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const { data } = await biographerAPI.generateAutobiography(selected._id)
      toast.success('Autobiography generated!')
      const { data: updated } = await biographerAPI.getProject(selected._id)
      setSelected(updated)
    } catch {
      toast.error('Failed to generate autobiography')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'timeline', label: 'Life Timeline', icon: Clock },
    { id: 'media', label: 'Media Assets', icon: Image },
    { id: 'output', label: 'Autobiography', icon: BookOpen }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">AI Biographer</h1>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showCreate && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">New Biography Project</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Project title (e.g. 'My Life Story')" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Create
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No biography projects yet.</p>
          </div>
        ) : (
          <>
            {projects.length > 1 && (
              <div className="flex gap-3 mb-6 overflow-x-auto">
                {projects.map((p) => (
                  <button key={p._id} onClick={() => setSelected(p)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${selected?._id === p._id ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    {p.title}
                  </button>
                ))}
              </div>
            )}
            {selected && (
              <>
                <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => { setActiveTab(id); setForm({}) }}
                      className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 whitespace-nowrap transition ${
                        activeTab === id ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}>
                      <Icon size={16} /> {label}
                    </button>
                  ))}
                </div>

                {/* Timeline */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Add Life Event</h3>
                      <form onSubmit={handleAddTimeline} className="space-y-4">
                        <input required placeholder="Event title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <textarea placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="number" required placeholder="Year" value={form.year || ''} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                          <input placeholder="Location (optional)" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <Plus size={16} /> Add
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Timeline ({selected?.timeline?.length || 0} events)</h3>
                      {selected?.timeline?.length === 0 && <p className="text-gray-500 text-sm">No events yet. Start building your life story.</p>}
                      <ol className="space-y-4">
                        {selected?.timeline?.map((ev) => (
                          <li key={ev._id} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-16 text-center">
                              <span className="text-lg font-bold text-primary-500">{ev.year}</span>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg flex-1">
                              <p className="font-semibold text-gray-900">{ev.title}</p>
                              {ev.description && <p className="text-sm text-gray-600 mt-1">{ev.description}</p>}
                              {ev.location && <p className="text-xs text-gray-400 mt-1">📍 {ev.location}</p>}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}

                {/* Media */}
                {activeTab === 'media' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Add Media Asset</h3>
                      <form onSubmit={handleAddMedia} className="space-y-4">
                        <input required placeholder="Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <select value={form.type || 'photo'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                          <option value="photo">Photo</option>
                          <option value="video">Video</option>
                          <option value="audio">Audio</option>
                          <option value="document">Document</option>
                          <option value="transcript">Transcript</option>
                        </select>
                        <input placeholder="URL or file path" value={form.url || ''} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <input placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <Plus size={16} /> Add Asset
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Media Library ({selected?.mediaAssets?.length || 0})</h3>
                      {selected?.mediaAssets?.length === 0 && <p className="text-gray-500 text-sm">No media yet.</p>}
                      <div className="grid grid-cols-2 gap-3">
                        {selected?.mediaAssets?.map((asset) => (
                          <div key={asset._id} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-semibold text-gray-900 text-sm">{asset.title}</p>
                            <p className="text-xs text-gray-500 capitalize mt-0.5">{asset.type}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Output */}
                {activeTab === 'output' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Generate Autobiography</h3>
                          <p className="text-gray-500 text-sm mt-1">AI will compose your life story from {selected?.timeline?.length || 0} events and {selected?.mediaAssets?.length || 0} media assets.</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          selected?.status === 'complete' ? 'bg-green-100 text-green-800' :
                          selected?.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>{selected?.status}</span>
                      </div>
                      <button onClick={handleGenerate} disabled={loading || selected?.timeline?.length === 0}
                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                        <Sparkles size={16} /> Generate Autobiography
                      </button>
                    </div>
                    {selected?.autobiographyOutput?.text && (
                      <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold text-gray-900 text-lg mb-3">Your Story</h3>
                        <p className="text-xs text-gray-400 mb-4">Generated {new Date(selected.autobiographyOutput.generatedAt).toLocaleDateString()}</p>
                        <div className="prose max-w-none text-gray-700 leading-relaxed">
                          {selected.autobiographyOutput.text}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
