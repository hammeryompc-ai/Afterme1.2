import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Building2, Users, FileBarChart, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { tenantAPI } from '../services/api'

export default function TenantPage() {
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState([])
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => { loadOrgs() }, [])

  const loadOrgs = async () => {
    try {
      const { data } = await tenantAPI.getOrganizations()
      setOrgs(data)
      if (data.length > 0 && !selected) setSelected(data[0])
    } catch {
      toast.error('Failed to load organizations')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await tenantAPI.createOrganization(form)
      setOrgs([...orgs, data])
      setSelected(data)
      setShowCreate(false)
      setForm({})
      toast.success('Organization created!')
    } catch {
      toast.error('Failed to create organization')
    } finally { setLoading(false) }
  }

  const handleAddProgram = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await tenantAPI.addProgram(selected._id, form)
      toast.success('Program added')
      setForm({})
      const { data } = await tenantAPI.getOrganization(selected._id)
      setSelected(data)
    } catch {
      toast.error('Failed to add program')
    } finally { setLoading(false) }
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await tenantAPI.submitReport(selected._id, form)
      toast.success('Report submitted')
      setForm({})
      const { data } = await tenantAPI.getOrganization(selected._id)
      setSelected(data)
    } catch {
      toast.error('Failed to submit report')
    } finally { setLoading(false) }
  }

  const handleRecordConsent = async () => {
    setLoading(true)
    try {
      await tenantAPI.recordConsent(selected._id)
      toast.success('Consent recorded')
    } catch {
      toast.error('Failed to record consent')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'programs', label: 'Programs', icon: Users },
    { id: 'reports', label: 'Grant Reports', icon: FileBarChart },
    { id: 'consent', label: 'Consent', icon: CheckCircle }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Gov & Nonprofit</h1>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition">
            <Plus size={16} /> New Org
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {showCreate && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Create Organization</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Organization name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <select value={form.type || 'nonprofit'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="government">Government</option>
                <option value="nonprofit">Nonprofit</option>
                <option value="ngo">NGO</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
              </select>
              <input placeholder="Tenant domain (optional)" value={form.tenantDomain || ''} onChange={(e) => setForm({ ...form, tenantDomain: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <div className="flex gap-3">
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Create
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {orgs.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No organizations yet.</p>
          </div>
        ) : (
          <>
            {orgs.length > 1 && (
              <div className="flex gap-3 mb-6 overflow-x-auto">
                {orgs.map((o) => (
                  <button key={o._id} onClick={() => setSelected(o)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition ${selected?._id === o._id ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                    {o.name}
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
                      <div>
                        <h3 className="font-bold text-gray-900 text-xl">{selected.name}</h3>
                        <p className="text-gray-500 text-sm capitalize">{selected.type}</p>
                      </div>
                      {selected.tenantDomain && <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">{selected.tenantDomain}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-primary-500">{selected.members?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Members</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-500">{selected.programs?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Programs</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-blue-500">{selected.grantReports?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Reports</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'programs' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Add Program</h3>
                      <form onSubmit={handleAddProgram} className="space-y-4">
                        <input required placeholder="Program name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <textarea placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Grant amount" value={form.grantAmount || ''} onChange={(e) => setForm({ ...form, grantAmount: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                          <input type="number" placeholder="Beneficiary count" value={form.beneficiaryCount || ''} onChange={(e) => setForm({ ...form, beneficiaryCount: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <Plus size={16} /> Add Program
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Programs ({selected?.programs?.length || 0})</h3>
                      {selected?.programs?.length === 0 && <p className="text-gray-500 text-sm">No programs yet.</p>}
                      <ul className="space-y-3">
                        {selected?.programs?.map((p) => (
                          <li key={p._id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-gray-900">{p.name}</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
                            </div>
                            {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                            {p.grantAmount && <p className="text-xs text-gray-400 mt-1">${p.grantAmount.toLocaleString()} · {p.beneficiaryCount} beneficiaries</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Submit Grant Report</h3>
                      <form onSubmit={handleSubmitReport} className="space-y-4">
                        <input required placeholder="Report title" value={form.reportTitle || ''} onChange={(e) => setForm({ ...form, reportTitle: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <input placeholder="Period (e.g. Q1 2026)" value={form.period || ''} onChange={(e) => setForm({ ...form, period: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        <textarea required placeholder="Report content" value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
                        <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                          <FileBarChart size={16} /> Submit Report
                        </button>
                      </form>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 text-lg mb-4">Reports ({selected?.grantReports?.length || 0})</h3>
                      {selected?.grantReports?.length === 0 && <p className="text-gray-500 text-sm">No reports yet.</p>}
                      <ul className="space-y-3">
                        {selected?.grantReports?.map((r) => (
                          <li key={r._id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-gray-900">{r.reportTitle}</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'submitted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}>{r.status}</span>
                            </div>
                            {r.period && <p className="text-xs text-gray-400 mt-1">{r.period}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'consent' && (
                  <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <h3 className="font-bold text-gray-900 text-lg">Consent Framework</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Consent Version</p>
                      <p className="text-gray-900">{selected.consentFramework?.consentVersion || '1.0'}</p>
                    </div>
                    {selected.consentFramework?.consentText && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Consent Text</p>
                        <p className="text-gray-700 text-sm">{selected.consentFramework.consentText}</p>
                      </div>
                    )}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Consents Recorded</p>
                      <p className="text-2xl font-bold text-primary-500">{selected.consentFramework?.consentsRecorded?.length || 0}</p>
                    </div>
                    <button onClick={handleRecordConsent} disabled={loading}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                      <CheckCircle size={16} /> Record My Consent
                    </button>
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
