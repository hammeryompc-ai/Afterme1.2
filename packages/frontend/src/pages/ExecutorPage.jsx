import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Scale, Users, FileText, FolderLock, CheckSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { executorAPI } from '../services/api'

const STEP_COLORS = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-800',
  complete: 'bg-green-100 text-green-800',
  blocked: 'bg-red-100 text-red-800'
}

export default function ExecutorPage() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('steps')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => { loadCases() }, [])

  const loadCases = async () => {
    try {
      const { data } = await executorAPI.getCases()
      setCases(data)
      if (data.length > 0 && !selected) setSelected(data[0])
    } catch {
      toast.error('Failed to load probate cases')
    }
  }

  const loadCase = async (id) => {
    try {
      const { data } = await executorAPI.getCase(id)
      setSelected(data)
    } catch {
      toast.error('Failed to refresh case')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await executorAPI.createCase(form)
      setCases([...cases, data])
      setSelected(data)
      setShowCreate(false)
      setForm({})
      toast.success('Probate case opened!')
    } catch {
      toast.error('Failed to open case')
    } finally { setLoading(false) }
  }

  const handleUpdateStep = async (stepId, status) => {
    setLoading(true)
    try {
      await executorAPI.updateStep(selected._id, stepId, { status })
      toast.success('Step updated')
      loadCase(selected._id)
    } catch {
      toast.error('Failed to update step')
    } finally { setLoading(false) }
  }

  const handleAddBeneficiary = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await executorAPI.addBeneficiary(selected._id, form)
      toast.success('Beneficiary added')
      setForm({})
      loadCase(selected._id)
    } catch {
      toast.error('Failed to add beneficiary')
    } finally { setLoading(false) }
  }

  const handleGenerateForm = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await executorAPI.generateForm(selected._id, form)
      toast.success('Form generated')
      setForm({})
      loadCase(selected._id)
    } catch {
      toast.error('Failed to generate form')
    } finally { setLoading(false) }
  }

  const handleAddEvidence = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await executorAPI.addEvidence(selected._id, form)
      toast.success('Evidence added to vault')
      setForm({})
      loadCase(selected._id)
    } catch {
      toast.error('Failed to add evidence')
    } finally { setLoading(false) }
  }

  const handleSendComm = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await executorAPI.sendCommunication(selected._id, form)
      toast.success('Communication logged')
      setForm({})
      loadCase(selected._id)
    } catch {
      toast.error('Failed to log communication')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'steps', label: 'Case Steps', icon: CheckSquare },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'evidence', label: 'Evidence Vault', icon: FolderLock },
    { id: 'comms', label: 'Communications', icon: Send }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">AI Executor & Probate</h1>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition">
            <Plus size={16} /> Open Case
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showCreate && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Open Probate Case</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Deceased person's full name" value={form.deceasedName || ''} onChange={(e) => setForm({ ...form, deceasedName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <input placeholder="Jurisdiction (e.g. California, USA)" value={form.jurisdiction || ''} onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Scale size={16} /> Open Case
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {cases.length === 0 ? (
          <div className="text-center py-16">
            <Scale size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No probate cases yet.</p>
            <p className="text-gray-400 text-sm mt-2">Open a case to begin the estate settlement process.</p>
          </div>
        ) : (
          <>
            {cases.length > 1 && (
              <div className="flex gap-3 mb-6 overflow-x-auto">
                {cases.map((c) => (
                  <button key={c._id} onClick={() => { setSelected(c); setActiveTab('steps') }}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${selected?._id === c._id ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    {c.deceasedName}
                  </button>
                ))}
              </div>
            )}
            {selected && (
              <>
                <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{selected.deceasedName}</p>
                    <p className="text-xs text-gray-500">Case #{selected.caseNumber} {selected.jurisdiction && `· ${selected.jurisdiction}`}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    selected.status === 'closed' ? 'bg-green-100 text-green-800' :
                    selected.status === 'contested' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>{selected.status.replace('_', ' ')}</span>
                </div>

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

                {/* Steps */}
                {activeTab === 'steps' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-4">Probate Steps ({selected?.steps?.filter(s => s.status === 'complete').length}/{selected?.steps?.length})</h3>
                    <ol className="space-y-4">
                      {selected?.steps?.map((step) => (
                        <li key={step._id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {step.order}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-gray-900">{step.title}</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${STEP_COLORS[step.status]}`}>
                                {step.status.replace('_', ' ')}
                              </span>
                            </div>
                            {step.description && <p className="text-sm text-gray-600 mt-1">{step.description}</p>}
                            {step.completedAt && <p className="text-xs text-gray-400 mt-1">Completed: {new Date(step.completedAt).toLocaleDateString()}</p>}
                            {step.status !== 'complete' && (
                              <div className="flex gap-2 mt-3">
                                {step.status === 'pending' && (
                                  <button onClick={() => handleUpdateStep(step._id, 'in_progress')} disabled={loading}
                                    className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg font-semibold disabled:opacity-50 transition">
                                    Start
                                  </button>
                                )}
                                {step.status === 'in_progress' && (
                                  <button onClick={() => handleUpdateStep(step._id, 'complete')} disabled={loading}
                                    className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg font-semibold disabled:opacity-50 transition">
                                    Mark Complete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Beneficiaries */}
                {activeTab === 'beneficiaries' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Add Beneficiary</h3>
                      <form onSubmit={handleAddBeneficiary} className="space-y-4">
                        <input required placeholder="Full name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <input type="email" placeholder="Email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <input placeholder="Relationship" value={form.relationship || ''} onChange={(e) => setForm({ ...form, relationship: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <input type="number" placeholder="Allocation %" value={form.allocationPercent || ''} onChange={(e) => setForm({ ...form, allocationPercent: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <Plus size={16} /> Add
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Beneficiaries ({selected?.beneficiaries?.length || 0})</h3>
                      {selected?.beneficiaries?.length === 0 && <p className="text-gray-500 text-sm">No beneficiaries yet.</p>}
                      <ul className="space-y-3">
                        {selected?.beneficiaries?.map((b) => (
                          <li key={b._id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-gray-900">{b.name}</p>
                              {b.allocationPercent && <span className="text-sm font-bold text-primary-500">{b.allocationPercent}%</span>}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{b.relationship} {b.email && `· ${b.email}`}</p>
                            <p className="text-xs text-gray-400 mt-1">Notified: {b.notified ? '✓' : 'Pending'}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Forms */}
                {activeTab === 'forms' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Generate Form</h3>
                      <form onSubmit={handleGenerateForm} className="space-y-4">
                        <select required value={form.formType || ''} onChange={(e) => setForm({ ...form, formType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                          <option value="">Select form type</option>
                          <option value="petition_for_probate">Petition for Probate</option>
                          <option value="notice_to_creditors">Notice to Creditors</option>
                          <option value="inventory_of_estate">Inventory of Estate</option>
                          <option value="final_accounting">Final Accounting</option>
                          <option value="distribution_order">Distribution Order</option>
                        </select>
                        <input placeholder="Custom title (optional)" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <FileText size={16} /> Generate
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Generated Forms ({selected?.generatedForms?.length || 0})</h3>
                      {selected?.generatedForms?.length === 0 && <p className="text-gray-500 text-sm">No forms generated yet.</p>}
                      <ul className="space-y-3">
                        {selected?.generatedForms?.map((f) => (
                          <li key={f._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FileText size={18} className="text-primary-500" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{f.title}</p>
                              <p className="text-xs text-gray-500">{new Date(f.generatedAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${f.signed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                              {f.signed ? 'Signed' : 'Pending'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Evidence */}
                {activeTab === 'evidence' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Add Evidence</h3>
                      <form onSubmit={handleAddEvidence} className="space-y-4">
                        <input required placeholder="Evidence title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <select value={form.type || 'other'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                          <option value="death_certificate">Death Certificate</option>
                          <option value="will">Will</option>
                          <option value="deed">Deed</option>
                          <option value="financial">Financial Document</option>
                          <option value="correspondence">Correspondence</option>
                          <option value="other">Other</option>
                        </select>
                        <input placeholder="File URL" value={form.fileUrl || ''} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <FolderLock size={16} /> Add Evidence
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Evidence Vault ({selected?.evidenceVault?.length || 0})</h3>
                      {selected?.evidenceVault?.length === 0 && <p className="text-gray-500 text-sm">No evidence yet.</p>}
                      <ul className="space-y-3">
                        {selected?.evidenceVault?.map((ev) => (
                          <li key={ev._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FolderLock size={18} className="text-primary-500" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{ev.title}</p>
                              <p className="text-xs text-gray-500 capitalize">{ev.type?.replace('_', ' ')}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ev.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                              {ev.verified ? 'Verified' : 'Pending'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Communications */}
                {activeTab === 'comms' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Log Communication</h3>
                      <form onSubmit={handleSendComm} className="space-y-4">
                        <select value={form.recipientType || 'beneficiary'} onChange={(e) => setForm({ ...form, recipientType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                          <option value="beneficiary">Beneficiary</option>
                          <option value="court">Court</option>
                          <option value="bank">Bank</option>
                          <option value="creditor">Creditor</option>
                        </select>
                        <input required placeholder="Subject" value={form.subject || ''} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <textarea required placeholder="Message body" value={form.body || ''} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <Send size={16} /> Log Communication
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Communications ({selected?.communicationTemplates?.length || 0})</h3>
                      {selected?.communicationTemplates?.length === 0 && <p className="text-gray-500 text-sm">No communications yet.</p>}
                      <ul className="space-y-3">
                        {[...(selected?.communicationTemplates || [])].reverse().map((c, idx) => (
                          <li key={idx} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">{c.subject}</p>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">{c.recipientType}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.body}</p>
                            {c.sentAt && <p className="text-xs text-gray-400 mt-1">{new Date(c.sentAt).toLocaleString()}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
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
