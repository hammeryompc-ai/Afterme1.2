import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Users, FolderOpen, Clock, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { familyAPI } from '../services/api'

export default function FamilyPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('vault')
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => { loadPlans() }, [])

  const loadPlans = async () => {
    try {
      const { data } = await familyAPI.getPlans()
      setPlans(data)
      if (data.length > 0 && !selected) setSelected(data[0])
    } catch {
      toast.error('Failed to load family plans')
    }
  }

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await familyAPI.createPlan(form)
      setPlans([...plans, data])
      setSelected(data)
      setShowCreatePlan(false)
      setForm({})
      toast.success('Family plan created!')
    } catch {
      toast.error('Failed to create plan')
    } finally { setLoading(false) }
  }

  const handleAddToVault = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await familyAPI.addToVault(selected._id, form)
      toast.success('Added to shared vault')
      setForm({})
      const { data } = await familyAPI.getPlan(selected._id)
      setSelected(data)
    } catch {
      toast.error('Failed to add to vault')
    } finally { setLoading(false) }
  }

  const handleAddTimeline = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await familyAPI.addTimeline(selected._id, form)
      toast.success('Timeline event added')
      setForm({})
      const { data } = await familyAPI.getPlan(selected._id)
      setSelected(data)
    } catch {
      toast.error('Failed to add event')
    } finally { setLoading(false) }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await familyAPI.addMember(selected._id, form)
      toast.success('Member added')
      setForm({})
      const { data } = await familyAPI.getPlan(selected._id)
      setSelected(data)
    } catch {
      toast.error('Failed to add member')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'vault', label: 'Shared Vault', icon: FolderOpen },
    { id: 'timeline', label: 'Family Timeline', icon: Clock },
    { id: 'members', label: 'Members', icon: UserPlus }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Couples & Family Plans</h1>
          <button onClick={() => setShowCreatePlan(true)} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition">
            <Plus size={16} /> New Plan
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Create Plan Modal */}
        {showCreatePlan && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Create Family Plan</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <input required placeholder="Plan name (e.g. 'Our Family Vault')" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <select value={form.type || 'family'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="couple">Couple</option>
                <option value="family">Family</option>
                <option value="group">Group</option>
              </select>
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Create
                </button>
                <button type="button" onClick={() => setShowCreatePlan(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {plans.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No family plans yet.</p>
          </div>
        ) : (
          <div>
            {/* Plan Selector */}
            {plans.length > 1 && (
              <div className="flex gap-3 mb-6 overflow-x-auto">
                {plans.map((p) => (
                  <button key={p._id} onClick={() => setSelected(p)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${selected?._id === p._id ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {selected && (
              <>
                {/* Tabs */}
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

                {/* Vault */}
                {activeTab === 'vault' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Add to Shared Vault</h3>
                      <form onSubmit={handleAddToVault} className="space-y-4">
                        <input required placeholder="Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <select value={form.type || 'document'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                          <option value="document">Document</option>
                          <option value="photo">Photo</option>
                          <option value="video">Video</option>
                          <option value="note">Note</option>
                        </select>
                        <textarea placeholder="Content or notes" value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <Plus size={16} /> Add
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Vault Items ({selected?.sharedVault?.length || 0})</h3>
                      {selected?.sharedVault?.length === 0 && <p className="text-gray-500 text-sm">No items yet.</p>}
                      <ul className="space-y-3">
                        {selected?.sharedVault?.map((item) => (
                          <li key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FolderOpen size={18} className="text-primary-500" />
                            <div>
                              <p className="font-semibold text-gray-900">{item.title}</p>
                              <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Add Timeline Event</h3>
                      <form onSubmit={handleAddTimeline} className="space-y-4">
                        <input required placeholder="Event title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <textarea placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                        <input type="date" value={form.date || ''} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <Plus size={16} /> Add Event
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Family Timeline</h3>
                      {selected?.sharedTimeline?.length === 0 && <p className="text-gray-500 text-sm">No events yet.</p>}
                      <ul className="space-y-4">
                        {[...(selected?.sharedTimeline || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).map((ev) => (
                          <li key={ev._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-gray-900">{ev.title}</p>
                              {ev.description && <p className="text-sm text-gray-600">{ev.description}</p>}
                              {ev.date && <p className="text-xs text-gray-400 mt-1">{new Date(ev.date).toLocaleDateString()}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Members */}
                {activeTab === 'members' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Invite Member</h3>
                      <form onSubmit={handleAddMember} className="space-y-4">
                        <input required placeholder="Name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <input type="email" required placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <select value={form.role || 'member'} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="readonly">Read-only</option>
                        </select>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <UserPlus size={16} /> Invite
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Members ({selected?.members?.length || 0})</h3>
                      <ul className="space-y-3">
                        {selected?.members?.map((m) => (
                          <li key={m._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                              {(m.name || m.email)?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{m.name || m.email}</p>
                              <p className="text-xs text-gray-500 capitalize">{m.role}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
