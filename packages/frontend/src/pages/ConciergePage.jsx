import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, CheckSquare, FolderLock, Key, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { conciergeAPI } from '../services/api'

export default function ConciergePage() {
  const navigate = useNavigate()
  const [vault, setVault] = useState(null)
  const [activeTab, setActiveTab] = useState('documents')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    loadVault()
  }, [])

  const loadVault = async () => {
    try {
      const { data } = await conciergeAPI.getVault()
      setVault(data)
    } catch {
      toast.error('Failed to load vault')
    }
  }

  const handleAddDocument = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await conciergeAPI.addDocument(form)
      toast.success('Document added')
      setForm({})
      loadVault()
    } catch {
      toast.error('Failed to add document')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await conciergeAPI.addTask(form)
      toast.success('Task added')
      setForm({})
      loadVault()
    } catch {
      toast.error('Failed to add task')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await conciergeAPI.addPassword(form)
      toast.success('Password saved')
      setForm({})
      loadVault()
    } catch {
      toast.error('Failed to save password')
    } finally {
      setLoading(false)
    }
  }

  const handleAddExecutor = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await conciergeAPI.addExecutor(form)
      toast.success('Executor added')
      setForm({})
      loadVault()
    } catch {
      toast.error('Failed to add executor')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'documents', label: 'Documents', icon: FolderLock },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'executors', label: 'Executors', icon: Users },
    { id: 'passwords', label: 'Passwords', icon: Key },
    { id: 'schedule', label: 'Schedule', icon: Calendar }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Pre-Death Concierge</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setForm({}) }}
              className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 whitespace-nowrap transition ${
                activeTab === id ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Add Document</h3>
              <form onSubmit={handleAddDocument} className="space-y-4">
                <input required placeholder="Document name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <select value={form.type || 'other'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="will">Will</option>
                  <option value="trust">Trust</option>
                  <option value="insurance">Insurance</option>
                  <option value="medical">Medical</option>
                  <option value="financial">Financial</option>
                  <option value="property">Property</option>
                  <option value="other">Other</option>
                </select>
                <input placeholder="Notes" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Add Document
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Stored Documents ({vault?.documents?.length || 0})</h3>
              {vault?.documents?.length === 0 && <p className="text-gray-500 text-sm">No documents yet.</p>}
              <ul className="space-y-3">
                {vault?.documents?.map((doc) => (
                  <li key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{doc.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{doc.type} {doc.notes && `· ${doc.notes}`}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Add Task</h3>
              <form onSubmit={handleAddTask} className="space-y-4">
                <input required placeholder="Task title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input type="date" value={form.dueDate || ''} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Add Task
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Tasks ({vault?.tasks?.length || 0})</h3>
              {vault?.tasks?.length === 0 && <p className="text-gray-500 text-sm">No tasks yet.</p>}
              <ul className="space-y-3">
                {vault?.tasks?.map((task) => (
                  <li key={task._id} className={`flex items-center gap-3 p-3 rounded-lg ${task.completed ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <CheckSquare size={18} className={task.completed ? 'text-green-500' : 'text-gray-400'} />
                    <div>
                      <p className={`font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                      {task.dueDate && <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Executors Tab */}
        {activeTab === 'executors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Add Executor</h3>
              <form onSubmit={handleAddExecutor} className="space-y-4">
                <input required placeholder="Full name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input type="email" required placeholder="Email address" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <select value={form.role || 'primary'} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="primary">Primary Executor</option>
                  <option value="backup">Backup Executor</option>
                </select>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Add Executor
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Executors ({vault?.executors?.length || 0})</h3>
              {vault?.executors?.length === 0 && <p className="text-gray-500 text-sm">No executors added yet.</p>}
              <ul className="space-y-3">
                {vault?.executors?.map((ex) => (
                  <li key={ex._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Users size={18} className="text-primary-500" />
                    <div>
                      <p className="font-semibold text-gray-900">{ex.name}</p>
                      <p className="text-xs text-gray-500">{ex.email} · <span className="capitalize">{ex.role}</span></p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Passwords Tab */}
        {activeTab === 'passwords' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-2">Password Vault</h3>
              <p className="text-sm text-gray-500 mb-4">Store encrypted credentials for your executor to access after you're gone.</p>
              <form onSubmit={handleAddPassword} className="space-y-4">
                <input required placeholder="Service / Website" value={form.service || ''} onChange={(e) => setForm({ ...form, service: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input placeholder="Username / Email" value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input type="password" placeholder="Password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input placeholder="Notes" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Key size={16} /> Save Password
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Saved Credentials ({vault?.passwords?.length || 0})</h3>
              {vault?.passwords?.length === 0 && <p className="text-gray-500 text-sm">No credentials saved yet.</p>}
              <ul className="space-y-3">
                {vault?.passwords?.map((pw) => (
                  <li key={pw._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Key size={18} className="text-primary-500" />
                    <div>
                      <p className="font-semibold text-gray-900">{pw.service}</p>
                      <p className="text-xs text-gray-500">{pw.username}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Schedule Event</h3>
              <form onSubmit={async (e) => {
                e.preventDefault()
                setLoading(true)
                try {
                  await conciergeAPI.scheduleEvent(form)
                  toast.success('Event scheduled')
                  setForm({})
                  loadVault()
                } catch {
                  toast.error('Failed to schedule event')
                } finally { setLoading(false) }
              }} className="space-y-4">
                <input required placeholder="Event title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input type="datetime-local" value={form.scheduledAt || ''} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <select value={form.type || 'reminder'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="reminder">Reminder</option>
                  <option value="deadline">Deadline</option>
                  <option value="meeting">Meeting</option>
                </select>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Calendar size={16} /> Schedule
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Scheduled Events ({vault?.scheduledEvents?.length || 0})</h3>
              {vault?.scheduledEvents?.length === 0 && <p className="text-gray-500 text-sm">No events scheduled.</p>}
              <ul className="space-y-3">
                {vault?.scheduledEvents?.map((ev) => (
                  <li key={ev._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar size={18} className="text-primary-500" />
                    <div>
                      <p className="font-semibold text-gray-900">{ev.title}</p>
                      {ev.scheduledAt && <p className="text-xs text-gray-500">{new Date(ev.scheduledAt).toLocaleString()}</p>}
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
