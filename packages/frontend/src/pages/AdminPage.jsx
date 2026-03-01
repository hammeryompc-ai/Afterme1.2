import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building, BarChart2, FileText, ShieldCheck, Save, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../services/api'

const ORG_TYPES = ['nonprofit', 'government', 'bank', 'other']

export default function AdminPage() {
  const navigate = useNavigate()
  const [org, setOrg] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('org')
  const [orgForm, setOrgForm] = useState({
    orgName: '',
    orgType: 'nonprofit',
    ein: '',
    contactEmail: '',
    programDescription: '',
    consentFramework: ''
  })
  const [reportForm, setReportForm] = useState({
    grantName: '',
    reportingPeriodStart: '',
    reportingPeriodEnd: ''
  })
  const [lastReport, setLastReport] = useState(null)

  useEffect(() => {
    loadOrg()
  }, [])

  const loadOrg = async () => {
    setLoading(true)
    try {
      const { data } = await adminAPI.getOrg()
      if (data) {
        setOrg(data)
        setOrgForm(data)
        const dashData = await adminAPI.getDashboard()
        setDashboard(dashData.data)
      }
    } catch {
      // No org profile yet
    } finally {
      setLoading(false)
    }
  }

  const saveOrg = async () => {
    if (!orgForm.orgName) {
      toast.error('Organization name is required')
      return
    }
    try {
      const { data } = await adminAPI.updateOrg(orgForm)
      setOrg(data)
      toast.success('Organization profile saved!')
      const dashData = await adminAPI.getDashboard()
      setDashboard(dashData.data)
    } catch {
      toast.error('Failed to save organization')
    }
  }

  const generateReport = async () => {
    if (!reportForm.grantName) {
      toast.error('Grant name is required')
      return
    }
    try {
      const { data } = await adminAPI.generateGrantReport(reportForm)
      setLastReport(data)
      toast.success('Grant report generated!')
    } catch {
      toast.error('Failed to generate report')
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
            <h1 className="text-2xl font-bold text-gray-900">Government & Nonprofit Lane</h1>
            <p className="text-sm text-gray-500">Multi-tenant deployments, grant reporting & compliance</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'org', label: 'Organization', icon: Building },
            { id: 'dashboard', label: 'Program Dashboard', icon: BarChart2 },
            { id: 'reports', label: 'Grant Reports', icon: FileText },
            { id: 'consent', label: 'Consent Framework', icon: ShieldCheck }
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

        {/* Organization Tab */}
        {activeTab === 'org' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Organization Profile</h3>
            <div className="grid gap-4">
              <input
                placeholder="Organization name"
                value={orgForm.orgName}
                onChange={(e) => setOrgForm({ ...orgForm, orgName: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={orgForm.orgType}
                  onChange={(e) => setOrgForm({ ...orgForm, orgType: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input
                  placeholder="EIN / Tax ID"
                  value={orgForm.ein}
                  onChange={(e) => setOrgForm({ ...orgForm, ein: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <input
                placeholder="Contact email"
                type="email"
                value={orgForm.contactEmail}
                onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <textarea
                placeholder="Program description"
                value={orgForm.programDescription}
                onChange={(e) => setOrgForm({ ...orgForm, programDescription: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <textarea
                placeholder="Consent framework / data governance policy..."
                value={orgForm.consentFramework}
                onChange={(e) => setOrgForm({ ...orgForm, consentFramework: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 h-20 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <button
              onClick={saveOrg}
              className="mt-4 flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              <Save size={16} /> Save Organization
            </button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {!org ? (
              <div className="text-center py-12 text-gray-400">
                <Building size={48} className="mx-auto mb-4 opacity-30" />
                <p>Set up your organization profile first.</p>
              </div>
            ) : (
              <div>
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{dashboard?.organization}</h3>
                  <p className="text-sm text-gray-500">
                    Report generated: {dashboard?.reportGeneratedAt ? new Date(dashboard.reportGeneratedAt).toLocaleString() : '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {dashboard?.metrics && Object.entries(dashboard.metrics).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-lg shadow p-4">
                      <p className="text-2xl font-bold text-primary-500">{value}</p>
                      <p className="text-sm text-gray-500 mt-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grant Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Generate Grant Report</h3>
              <div className="grid gap-4">
                <input
                  placeholder="Grant name"
                  value={reportForm.grantName}
                  onChange={(e) => setReportForm({ ...reportForm, grantName: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Period Start</label>
                    <input
                      type="date"
                      value={reportForm.reportingPeriodStart}
                      onChange={(e) => setReportForm({ ...reportForm, reportingPeriodStart: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Period End</label>
                    <input
                      type="date"
                      value={reportForm.reportingPeriodEnd}
                      onChange={(e) => setReportForm({ ...reportForm, reportingPeriodEnd: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={generateReport}
                className="mt-4 flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                <Plus size={16} /> Generate Report
              </button>
            </div>

            {lastReport && (
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-bold text-gray-900 mb-3">Last Generated Report</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500">Report ID</p><p className="font-mono font-semibold">{lastReport.reportId}</p></div>
                  <div><p className="text-gray-500">Grant</p><p className="font-semibold">{lastReport.grantName}</p></div>
                  <div><p className="text-gray-500">Period Start</p><p>{lastReport.reportingPeriodStart || '—'}</p></div>
                  <div><p className="text-gray-500">Period End</p><p>{lastReport.reportingPeriodEnd || '—'}</p></div>
                  <div><p className="text-gray-500">Status</p><p className="text-green-600 font-semibold capitalize">{lastReport.status}</p></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Consent Framework Tab */}
        {activeTab === 'consent' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Consent Framework</h3>
            <p className="text-gray-600 mb-6">
              Manage data governance, user consent, and compliance for your organization's deployment of AfterMe.
              All consent events are logged with timestamps and IP addresses.
            </p>
            <div className="space-y-4">
              {[
                {
                  title: 'GDPR / CCPA Compliance',
                  description: 'User data deletion and export rights are enabled for all users in your tenant.'
                },
                {
                  title: 'Audit Logging',
                  description: 'All vault access, document downloads, and AI interactions are logged.'
                },
                {
                  title: 'Data Retention Policy',
                  description: 'Configure how long user data is stored after account closure or memorialization.'
                },
                {
                  title: 'Consent Collection',
                  description: 'Users are presented with your consent framework before accessing sensitive features.'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <ShieldCheck size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
