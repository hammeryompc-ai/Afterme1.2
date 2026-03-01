import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Landmark, FileText, ClipboardList, ArrowRightLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { bankingAPI } from '../services/api'

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-700',
  in_review: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

export default function BankingPage() {
  const navigate = useNavigate()
  const [partnerships, setPartnerships] = useState([])
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => { loadPartnerships() }, [])

  const loadPartnerships = async () => {
    try {
      const { data } = await bankingAPI.getPartnerships()
      setPartnerships(data)
      if (data.length > 0 && !selected) setSelected(data[0])
    } catch {
      toast.error('Failed to load partnerships')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await bankingAPI.createPartnership(form)
      setPartnerships([...partnerships, data])
      setSelected(data)
      setShowCreate(false)
      setForm({})
      toast.success('Partnership request created')
    } catch {
      toast.error('Failed to create partnership')
    } finally { setLoading(false) }
  }

  const handleSubmitVerification = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await bankingAPI.submitVerification(selected._id, form)
      toast.success('Verification document submitted')
      setForm({})
      const { data } = await bankingAPI.getPartnership(selected._id)
      setSelected(data)
    } catch {
      toast.error('Failed to submit verification')
    } finally { setLoading(false) }
  }

  const handleInitiateTransfer = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await bankingAPI.initiateTransfer(selected._id, form)
      toast.success('Estate transfer initiated')
      setForm({})
      const { data } = await bankingAPI.getPartnership(selected._id)
      setSelected(data)
    } catch {
      toast.error('Failed to initiate transfer')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Landmark },
    { id: 'verify', label: 'Verification', icon: FileText },
    { id: 'transfers', label: 'Estate Transfers', icon: ArrowRightLeft },
    { id: 'audit', label: 'Audit Log', icon: ClipboardList }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Bank Partnerships</h1>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition">
            <Plus size={16} /> New
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showCreate && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Request Bank Partnership</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Bank / Institution name" value={form.partnerName || ''} onChange={(e) => setForm({ ...form, partnerName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <input placeholder="Partner code (optional)" value={form.partnerCode || ''} onChange={(e) => setForm({ ...form, partnerCode: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Submit
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {partnerships.length === 0 ? (
          <div className="text-center py-16">
            <Landmark size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No bank partnerships yet.</p>
          </div>
        ) : (
          <>
            {partnerships.length > 1 && (
              <div className="flex gap-3 mb-6 overflow-x-auto">
                {partnerships.map((p) => (
                  <button key={p._id} onClick={() => setSelected(p)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${selected?._id === p._id ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    {p.partnerName}
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

                {activeTab === 'overview' && (
                  <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 text-xl">{selected.partnerName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[selected.verificationStatus]}`}>
                        {selected.verificationStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-primary-500">{selected.verificationDocuments?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Verification Docs</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-500">{selected.estateTransfers?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Estate Transfers</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-orange-500">{selected.auditLogs?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Audit Events</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'verify' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Submit Verification Document</h3>
                      <form onSubmit={handleSubmitVerification} className="space-y-4">
                        <input required placeholder="Document type (e.g. ID, Certificate)" value={form.type || ''} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <input placeholder="File URL" value={form.fileUrl || ''} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <FileText size={16} /> Submit
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Documents Submitted ({selected?.verificationDocuments?.length || 0})</h3>
                      {selected?.verificationDocuments?.length === 0 && <p className="text-gray-500 text-sm">No documents yet.</p>}
                      <ul className="space-y-3">
                        {selected?.verificationDocuments?.map((doc, idx) => (
                          <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <FileText size={18} className="text-primary-500" />
                            <div>
                              <p className="font-semibold text-gray-900">{doc.type}</p>
                              <p className="text-xs text-gray-400">{new Date(doc.submittedAt).toLocaleDateString()}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'transfers' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Initiate Estate Transfer</h3>
                      <form onSubmit={handleInitiateTransfer} className="space-y-4">
                        <input required placeholder="Asset description" value={form.assetDescription || ''} onChange={(e) => setForm({ ...form, assetDescription: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <input type="number" placeholder="Estimated value" value={form.estimatedValue || ''} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <input placeholder="Beneficiary name" value={form.beneficiaryName || ''} onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <ArrowRightLeft size={16} /> Initiate Transfer
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Transfers ({selected?.estateTransfers?.length || 0})</h3>
                      {selected?.estateTransfers?.length === 0 && <p className="text-gray-500 text-sm">No transfers yet.</p>}
                      <ul className="space-y-3">
                        {selected?.estateTransfers?.map((t) => (
                          <li key={t._id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-gray-900">{t.assetDescription}</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-700'}`}>{t.status}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">To: {t.beneficiaryName} {t.estimatedValue && `· $${t.estimatedValue.toLocaleString()}`}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-4">Audit Log ({selected?.auditLogs?.length || 0})</h3>
                    {selected?.auditLogs?.length === 0 && <p className="text-gray-500 text-sm">No audit events yet.</p>}
                    <ul className="space-y-3">
                      {[...(selected?.auditLogs || [])].reverse().map((log, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <ClipboardList size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{log.action.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-gray-400">{new Date(log.performedAt).toLocaleString()}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
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
