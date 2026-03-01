import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Baby, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { kidsAPI } from '../services/api'

export default function KidsPage() {
  const navigate = useNavigate()
  const [capsules, setCapsules] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', releaseRules: { type: 'date' } })

  useEffect(() => { loadCapsules() }, [])

  const loadCapsules = async () => {
    try {
      const { data } = await kidsAPI.getCapsules()
      setCapsules(data)
    } catch {
      toast.error('Failed to load capsules')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await kidsAPI.createCapsule(form)
      toast.success('Time capsule created!')
      setShowForm(false)
      setForm({ title: '', message: '', releaseRules: { type: 'date' } })
      loadCapsules()
    } catch {
      toast.error('Failed to create capsule')
    } finally { setLoading(false) }
  }

  const handleSeal = async (id) => {
    try {
      await kidsAPI.sealCapsule(id)
      toast.success('Capsule sealed!')
      loadCapsules()
    } catch {
      toast.error('Failed to seal capsule')
    }
  }

  const STATUS_COLORS = {
    draft: 'bg-gray-100 text-gray-700',
    sealed: 'bg-blue-100 text-blue-800',
    released: 'bg-green-100 text-green-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">AfterMe for Kids</h1>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition">
            <Plus size={16} /> New Capsule
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Create Time Capsule</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Capsule title (e.g. 'For Emma on her 18th birthday')" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <input placeholder="Recipient name" value={form.recipientName || ''} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <input type="email" placeholder="Recipient email (optional)" value={form.recipientEmail || ''} onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <textarea required placeholder="Your message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full h-28 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Release Rule</label>
                <select value={form.releaseRules.type} onChange={(e) => setForm({ ...form, releaseRules: { ...form.releaseRules, type: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none mb-3">
                  <option value="date">Specific Date</option>
                  <option value="age">Recipient Age</option>
                  <option value="event">Life Event</option>
                  <option value="manual">Manual Release</option>
                </select>
                {form.releaseRules.type === 'date' && (
                  <input type="date" placeholder="Release date" value={form.releaseRules.releaseDate || ''} onChange={(e) => setForm({ ...form, releaseRules: { ...form.releaseRules, releaseDate: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                )}
                {form.releaseRules.type === 'age' && (
                  <input type="number" placeholder="Release at age (e.g. 18)" value={form.releaseRules.releaseAge || ''} onChange={(e) => setForm({ ...form, releaseRules: { ...form.releaseRules, releaseAge: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                )}
                {form.releaseRules.type === 'event' && (
                  <input placeholder="Describe the event (e.g. Graduation)" value={form.releaseRules.eventDescription || ''} onChange={(e) => setForm({ ...form, releaseRules: { ...form.releaseRules, eventDescription: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Policy</label>
                <select value={form.contentPolicy?.ageRating || 'all'} onChange={(e) => setForm({ ...form, contentPolicy: { ...form.contentPolicy, ageRating: e.target.value } })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="all">All Ages</option>
                  <option value="13+">13+</option>
                  <option value="18+">18+</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Create
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {capsules.length === 0 && !showForm && (
          <div className="text-center py-16">
            <Baby size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No time capsules yet.</p>
            <p className="text-gray-400 text-sm mt-2">Create your first message for a loved one.</p>
          </div>
        )}

        <div className="grid gap-4">
          {capsules.map((capsule) => (
            <div key={capsule._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{capsule.title}</h3>
                  {capsule.recipientName && <p className="text-sm text-gray-500">For: {capsule.recipientName}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[capsule.status]}`}>
                  {capsule.status}
                </span>
              </div>
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{capsule.message}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Release: <span className="capitalize">{capsule.releaseRules?.type}</span></span>
                {capsule.releaseRules?.releaseDate && <span>{new Date(capsule.releaseRules.releaseDate).toLocaleDateString()}</span>}
                {capsule.releaseRules?.releaseAge && <span>Age {capsule.releaseRules.releaseAge}</span>}
                <span>Rating: {capsule.contentPolicy?.ageRating || 'all'}</span>
              </div>
              {capsule.status === 'draft' && (
                <button onClick={() => handleSeal(capsule._id)} className="mt-4 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition">
                  <Lock size={14} /> Seal Capsule
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
