import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Briefcase, Plus, CheckCircle, Circle, FileText, Users, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { estateAPI } from '../services/api'

const STATUS_COLORS = {
  pending: 'text-gray-500 bg-gray-100',
  in_progress: 'text-blue-600 bg-blue-50',
  completed: 'text-green-600 bg-green-50',
  skipped: 'text-gray-400 bg-gray-50',
  open: 'text-blue-600 bg-blue-50',
  closed: 'text-green-600 bg-green-50',
  pending_court: 'text-orange-600 bg-orange-50'
}

export default function EstatePage() {
  const navigate = useNavigate()
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showNewCase, setShowNewCase] = useState(false)
  const [activeTab, setActiveTab] = useState('steps')
  const [newCaseForm, setNewCaseForm] = useState({ deceasedEmail: '' })
  const [addBenForm, setAddBenForm] = useState({ name: '', email: '', relationship: '', share: 0 })
  const [addEvidenceForm, setAddEvidenceForm] = useState({ title: '', fileUrl: '' })
  const [commForm, setCommForm] = useState({ recipient: '', subject: '', body: '' })

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    setLoading(true)
    try {
      const { data } = await estateAPI.getCases()
      setCases(data)
    } catch {
      toast.error('Failed to load cases')
    } finally {
      setLoading(false)
    }
  }

  const loadCase = async (id) => {
    try {
      const { data } = await estateAPI.getCase(id)
      setSelectedCase(data)
    } catch {
      toast.error('Failed to load case')
    }
  }

  const createCase = async () => {
    if (!newCaseForm.deceasedEmail) {
      toast.error('Please enter the deceased email address')
      return
    }
    try {
      const { data } = await estateAPI.createCase(newCaseForm)
      setCases([data, ...cases])
      setSelectedCase(data)
      setShowNewCase(false)
      toast.success('Estate case opened!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open case')
    }
  }

  const updateStep = async (stepNumber, status) => {
    try {
      const { data } = await estateAPI.updateStep(selectedCase._id, stepNumber, { status })
      setSelectedCase(data)
      toast.success('Step updated!')
    } catch {
      toast.error('Failed to update step')
    }
  }

  const addBeneficiary = async () => {
    try {
      const { data } = await estateAPI.addBeneficiary(selectedCase._id, addBenForm)
      setSelectedCase(data)
      setAddBenForm({ name: '', email: '', relationship: '', share: 0 })
      toast.success('Beneficiary added!')
    } catch {
      toast.error('Failed to add beneficiary')
    }
  }

  const addEvidence = async () => {
    try {
      const { data } = await estateAPI.addEvidence(selectedCase._id, addEvidenceForm)
      setSelectedCase(data)
      setAddEvidenceForm({ title: '', fileUrl: '' })
      toast.success('Evidence added!')
    } catch {
      toast.error('Failed to add evidence')
    }
  }

  const logComm = async () => {
    try {
      const { data } = await estateAPI.logCommunication(selectedCase._id, commForm)
      setSelectedCase(data)
      setCommForm({ recipient: '', subject: '', body: '' })
      toast.success('Communication logged!')
    } catch {
      toast.error('Failed to log communication')
    }
  }

  const completedSteps = selectedCase?.steps?.filter(s => s.status === 'completed').length || 0
  const totalSteps = selectedCase?.steps?.length || 0

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          {selectedCase ? (
            <button onClick={() => setSelectedCase(null)} className="text-primary-500 hover:text-primary-600">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button onClick={() => navigate('/dashboard')} className="text-primary-500 hover:text-primary-600">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCase ? `Estate Case` : 'AI Executor & Probate Automation'}
            </h1>
            {selectedCase && (
              <p className="text-sm text-gray-500">
                {selectedCase.deceasedUserId?.firstName} {selectedCase.deceasedUserId?.lastName} · {completedSteps}/{totalSteps} steps complete
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {!selectedCase ? (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowNewCase(!showNewCase)}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                <Plus size={16} /> Open Estate Case
              </button>
            </div>

            {showNewCase && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Open New Estate Case</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enter the email of the deceased to open a probate case. You'll be assigned as the executor.
                </p>
                <input
                  placeholder="Deceased person's email address"
                  value={newCaseForm.deceasedEmail}
                  onChange={(e) => setNewCaseForm({ deceasedEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none mb-4"
                />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowNewCase(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={createCase} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition">Open Case</button>
                </div>
              </div>
            )}

            {cases.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Briefcase size={64} className="mx-auto mb-4 opacity-30" />
                <p>No estate cases yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cases.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => { setSelectedCase(c); loadCase(c._id) }}
                    className="w-full bg-white rounded-lg shadow p-5 text-left hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {c.deceasedUserId?.firstName} {c.deceasedUserId?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{c.deceasedUserId?.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[c.caseStatus] || 'text-gray-500 bg-gray-100'}`}>
                        {c.caseStatus}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Probate Progress</span>
                <span className="text-sm text-gray-500">{completedSteps}/{totalSteps} steps</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: totalSteps > 0 ? `${(completedSteps / totalSteps) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
              {[
                { id: 'steps', label: 'Steps', icon: CheckCircle },
                { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
                { id: 'evidence', label: 'Evidence Vault', icon: FileText },
                { id: 'communications', label: 'Communications', icon: MessageSquare }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
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

            {/* Steps Tab */}
            {activeTab === 'steps' && (
              <div className="space-y-3">
                {selectedCase.steps?.map((step) => (
                  <div key={step.stepNumber} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateStep(step.stepNumber, step.status === 'completed' ? 'pending' : 'completed')}>
                        {step.status === 'completed'
                          ? <CheckCircle size={22} className="text-green-500" />
                          : <Circle size={22} className="text-gray-300" />
                        }
                      </button>
                      <div className="flex-1">
                        <p className={`font-semibold ${step.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {step.stepNumber}. {step.title}
                        </p>
                        <p className="text-sm text-gray-500">{step.description}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[step.status] || ''}`}>
                        {step.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Beneficiaries Tab */}
            {activeTab === 'beneficiaries' && (
              <div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Add Beneficiary</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      placeholder="Full name"
                      value={addBenForm.name}
                      onChange={(e) => setAddBenForm({ ...addBenForm, name: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <input
                      placeholder="Email"
                      value={addBenForm.email}
                      onChange={(e) => setAddBenForm({ ...addBenForm, email: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <input
                      placeholder="Relationship"
                      value={addBenForm.relationship}
                      onChange={(e) => setAddBenForm({ ...addBenForm, relationship: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Share %"
                      value={addBenForm.share}
                      onChange={(e) => setAddBenForm({ ...addBenForm, share: Number(e.target.value) })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                  </div>
                  <button onClick={addBeneficiary} className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                    Add Beneficiary
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedCase.beneficiaries?.map((ben, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{ben.name}</p>
                          <p className="text-sm text-gray-500">{ben.email} · {ben.relationship}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary-500">{ben.share}%</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[ben.status] || ''}`}>{ben.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!selectedCase.beneficiaries || selectedCase.beneficiaries.length === 0) && (
                    <div className="text-center py-8 text-gray-400">No beneficiaries added yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* Evidence Vault Tab */}
            {activeTab === 'evidence' && (
              <div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Add Evidence Document</h4>
                  <div className="grid gap-3 mb-3">
                    <input
                      placeholder="Document title"
                      value={addEvidenceForm.title}
                      onChange={(e) => setAddEvidenceForm({ ...addEvidenceForm, title: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <input
                      placeholder="File URL"
                      value={addEvidenceForm.fileUrl}
                      onChange={(e) => setAddEvidenceForm({ ...addEvidenceForm, fileUrl: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                  </div>
                  <button onClick={addEvidence} className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                    Add Document
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedCase.evidenceDocuments?.map((doc, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
                      <FileText size={18} className="text-primary-500" />
                      <div>
                        <p className="font-semibold text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {(!selectedCase.evidenceDocuments || selectedCase.evidenceDocuments.length === 0) && (
                    <div className="text-center py-8 text-gray-400">No evidence documents yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* Communications Tab */}
            {activeTab === 'communications' && (
              <div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Log Communication</h4>
                  <div className="grid gap-3 mb-3">
                    <input
                      placeholder="Recipient"
                      value={commForm.recipient}
                      onChange={(e) => setCommForm({ ...commForm, recipient: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <input
                      placeholder="Subject"
                      value={commForm.subject}
                      onChange={(e) => setCommForm({ ...commForm, subject: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <textarea
                      placeholder="Message body..."
                      value={commForm.body}
                      onChange={(e) => setCommForm({ ...commForm, body: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                  </div>
                  <button onClick={logComm} className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                    Log Communication
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedCase.communicationLog?.map((comm, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900">{comm.subject}</p>
                        <p className="text-xs text-gray-400">{new Date(comm.sentAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-sm text-gray-500">To: {comm.recipient}</p>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{comm.body}</p>
                    </div>
                  ))}
                  {(!selectedCase.communicationLog || selectedCase.communicationLog.length === 0) && (
                    <div className="text-center py-8 text-gray-400">No communications logged yet.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
