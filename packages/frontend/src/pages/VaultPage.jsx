import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, FileText, Key, CheckSquare, Users, Plus, Trash2, Edit2, Save, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import { vaultAPI } from '../services/api'

const CATEGORIES = ['will', 'insurance', 'financial', 'medical', 'legal', 'password', 'personal', 'other']
const TASK_CATEGORIES = ['financial', 'legal', 'medical', 'personal', 'estate', 'notification', 'other']

export default function VaultPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('documents')
  const [documents, setDocuments] = useState([])
  const [passwords, setPasswords] = useState([])
  const [tasks, setTasks] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({})

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'documents') {
        const { data } = await vaultAPI.getDocuments()
        setDocuments(data)
      } else if (activeTab === 'passwords') {
        const { data } = await vaultAPI.getPasswords()
        setPasswords(data)
      } else if (activeTab === 'tasks') {
        const { data } = await vaultAPI.getTasks()
        setTasks(data)
      } else if (activeTab === 'contacts') {
        const { data } = await vaultAPI.getContacts()
        setContacts(data)
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (activeTab === 'documents') {
        if (editingId) {
          await vaultAPI.updateDocument(editingId, form)
        } else {
          await vaultAPI.createDocument(form)
        }
      } else if (activeTab === 'passwords') {
        await vaultAPI.createPassword(form)
      } else if (activeTab === 'tasks') {
        if (editingId) {
          await vaultAPI.updateTask(editingId, form)
        } else {
          await vaultAPI.createTask(form)
        }
      } else if (activeTab === 'contacts') {
        if (editingId) {
          await vaultAPI.updateContact(editingId, form)
        } else {
          await vaultAPI.createContact(form)
        }
      }
      toast.success('Saved!')
      setShowForm(false)
      setEditingId(null)
      setForm({})
      loadData()
    } catch {
      toast.error('Failed to save')
    }
  }

  const handleDelete = async (id) => {
    try {
      if (activeTab === 'documents') await vaultAPI.deleteDocument(id)
      else if (activeTab === 'tasks') await vaultAPI.deleteTask(id)
      else if (activeTab === 'contacts') await vaultAPI.deleteContact(id)
      toast.success('Deleted')
      loadData()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const openEdit = (item) => {
    setEditingId(item._id)
    setForm(item)
    setShowForm(true)
  }

  const tabs = [
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'passwords', label: 'Passwords', icon: Key },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'contacts', label: 'Contacts', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-primary-500 hover:text-primary-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Pre-Death Concierge Vault</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setShowForm(false); setForm({}) }}
              className={`flex items-center gap-2 px-4 py-3 font-semibold border-b-2 whitespace-nowrap transition ${
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

        {/* Add Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm({}) }}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            <Plus size={16} /> Add {activeTab.slice(0, -1)}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit' : 'Add'} {activeTab.slice(0, -1)}
              </h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <div className="grid gap-4">
              {activeTab === 'documents' && (
                <>
                  <input
                    placeholder="Title"
                    value={form.title || ''}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <select
                    value={form.category || ''}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <textarea
                    placeholder="Description"
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    placeholder="File URL (or upload link)"
                    value={form.fileUrl || ''}
                    onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </>
              )}

              {activeTab === 'passwords' && (
                <>
                  <input
                    placeholder="Service name (e.g. Gmail)"
                    value={form.service || ''}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    placeholder="Username / email"
                    value={form.username || ''}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={form.encryptedPassword || ''}
                    onChange={(e) => setForm({ ...form, encryptedPassword: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    placeholder="URL"
                    value={form.url || ''}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </>
              )}

              {activeTab === 'tasks' && (
                <>
                  <input
                    placeholder="Task title"
                    value={form.title || ''}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <select
                    value={form.category || ''}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select category</option>
                    {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select
                    value={form.priority || 'medium'}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {['low', 'medium', 'high', 'critical'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Description"
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 h-20 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </>
              )}

              {activeTab === 'contacts' && (
                <>
                  <input
                    placeholder="Full name"
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    placeholder="Email"
                    value={form.email || ''}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    placeholder="Phone"
                    value={form.phone || ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <select
                    value={form.role || 'emergency'}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {['guardian_alert', 'executor', 'family', 'emergency', 'beneficiary'].map((r) => (
                      <option key={r} value={r}>{r.replace('_', ' ')}</option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                <Save size={16} /> Save
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-3">
            {activeTab === 'documents' && documents.map((doc) => (
              <div key={doc._id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-primary-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{doc.title}</p>
                    <p className="text-sm text-gray-500">{doc.category} · {doc.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(doc)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(doc._id)} className="p-2 hover:bg-red-100 rounded-lg text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}

            {activeTab === 'passwords' && passwords.map((pw) => (
              <div key={pw._id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key size={20} className="text-primary-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{pw.passwordEntry?.service}</p>
                    <p className="text-sm text-gray-500">{pw.passwordEntry?.username}</p>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'tasks' && tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckSquare size={20} className={task.status === 'completed' ? 'text-green-500' : 'text-primary-500'} />
                  <div>
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.category} · {task.priority} priority · {task.status}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(task)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(task._id)} className="p-2 hover:bg-red-100 rounded-lg text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}

            {activeTab === 'contacts' && contacts.map((contact) => (
              <div key={contact._id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-primary-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.email} · {contact.role?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(contact)} className="p-2 hover:bg-gray-100 rounded-lg"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(contact._id)} className="p-2 hover:bg-red-100 rounded-lg text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}

            {((activeTab === 'documents' && documents.length === 0) ||
              (activeTab === 'passwords' && passwords.length === 0) ||
              (activeTab === 'tasks' && tasks.length === 0) ||
              (activeTab === 'contacts' && contacts.length === 0)) && (
              <div className="text-center py-12 text-gray-400">
                No {activeTab} yet. Click "Add" to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
