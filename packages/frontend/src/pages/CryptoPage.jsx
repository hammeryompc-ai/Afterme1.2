import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Bitcoin, Shield, Zap, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { cryptoAPI } from '../services/api'

export default function CryptoPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('wallets')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const { data: d } = await cryptoAPI.get()
      setData(d)
    } catch {
      toast.error('Failed to load crypto setup')
    }
  }

  const handleAddWallet = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await cryptoAPI.addWallet(form)
      toast.success('Wallet added')
      setForm({})
      loadData()
    } catch {
      toast.error('Failed to add wallet')
    } finally { setLoading(false) }
  }

  const handleAddRecovery = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await cryptoAPI.addRecovery(form)
      toast.success('Recovery mechanism added')
      setForm({})
      loadData()
    } catch {
      toast.error('Failed to add recovery')
    } finally { setLoading(false) }
  }

  const handleAddTrigger = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await cryptoAPI.addTrigger(form)
      toast.success('Inheritance trigger added')
      setForm({})
      loadData()
    } catch {
      toast.error('Failed to add trigger')
    } finally { setLoading(false) }
  }

  const handleActivate = async () => {
    setLoading(true)
    try {
      await cryptoAPI.activate()
      toast.success('Crypto inheritance activated!')
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Activation failed')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'wallets', label: 'Wallets', icon: Bitcoin },
    { id: 'recovery', label: 'Recovery', icon: Shield },
    { id: 'triggers', label: 'Triggers', icon: Zap }
  ]

  const STATUS_COLORS = {
    setup: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-800',
    triggered: 'bg-orange-100 text-orange-800',
    settled: 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Crypto Inheritance</h1>
          {data?.status === 'setup' && (
            <button onClick={handleActivate} disabled={loading || !data?.wallets?.length}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition">
              <CheckCircle size={16} /> Activate
            </button>
          )}
          {data?.status !== 'setup' && (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${STATUS_COLORS[data?.status]}`}>
              {data?.status}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
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

        {/* Wallets */}
        {activeTab === 'wallets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Add Wallet</h3>
              <form onSubmit={handleAddWallet} className="space-y-4">
                <input required placeholder="Label (e.g. 'Bitcoin Cold Wallet')" value={form.label || ''} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input required placeholder="Network (e.g. Bitcoin, Ethereum)" value={form.network || ''} onChange={(e) => setForm({ ...form, network: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input placeholder="Public address" value={form.publicAddress || ''} onChange={(e) => setForm({ ...form, publicAddress: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Estimated value" value={form.estimatedValue || ''} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                  <input placeholder="Currency (e.g. BTC)" value={form.currency || ''} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <input type="number" placeholder="Multi-sig threshold (e.g. 2)" value={form.multiSigThreshold || ''} onChange={(e) => setForm({ ...form, multiSigThreshold: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Add Wallet
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Wallets ({data?.wallets?.length || 0})</h3>
              {data?.wallets?.length === 0 && <p className="text-gray-500 text-sm">No wallets added yet.</p>}
              <ul className="space-y-3">
                {data?.wallets?.map((w) => (
                  <li key={w._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">{w.label}</p>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{w.network}</span>
                    </div>
                    {w.publicAddress && <p className="text-xs text-gray-500 mt-1 font-mono truncate">{w.publicAddress}</p>}
                    <p className="text-xs text-gray-400 mt-1">Multi-sig: {w.multiSigThreshold}-of-N {w.estimatedValue && `· ${w.estimatedValue} ${w.currency || ''}`}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Recovery */}
        {activeTab === 'recovery' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Add Recovery Mechanism</h3>
              <form onSubmit={handleAddRecovery} className="space-y-4">
                <select value={form.type || 'social_recovery'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="social_recovery">Social Recovery</option>
                  <option value="hardware_key">Hardware Key</option>
                  <option value="time_lock">Time Lock</option>
                  <option value="dead_mans_switch">Dead Man's Switch</option>
                </select>
                <input placeholder="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                {form.type === 'time_lock' && (
                  <input type="number" placeholder="Time lock days" value={form.timeLockDays || ''} onChange={(e) => setForm({ ...form, timeLockDays: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                )}
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Add Recovery
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Recovery Mechanisms ({data?.recoveryMechanisms?.length || 0})</h3>
              {data?.recoveryMechanisms?.length === 0 && <p className="text-gray-500 text-sm">No recovery mechanisms yet.</p>}
              <ul className="space-y-3">
                {data?.recoveryMechanisms?.map((r) => (
                  <li key={r._id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-900 capitalize">{r.type.replace(/_/g, ' ')}</p>
                    {r.description && <p className="text-sm text-gray-600">{r.description}</p>}
                    {r.timeLockDays && <p className="text-xs text-gray-400">Lock period: {r.timeLockDays} days</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Triggers */}
        {activeTab === 'triggers' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Add Inheritance Trigger</h3>
              <form onSubmit={handleAddTrigger} className="space-y-4">
                <select value={form.type || 'inactivity'} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="inactivity">Account Inactivity</option>
                  <option value="death_certificate">Death Certificate Upload</option>
                  <option value="manual">Manual Trigger</option>
                  <option value="legal_order">Legal Order</option>
                </select>
                {form.type === 'inactivity' && (
                  <input type="number" placeholder="Inactivity days before trigger" value={form.inactivityDays || ''} onChange={(e) => setForm({ ...form, inactivityDays: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                )}
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Add Trigger
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Triggers ({data?.inheritanceTriggers?.length || 0})</h3>
              {data?.inheritanceTriggers?.length === 0 && <p className="text-gray-500 text-sm">No triggers configured yet.</p>}
              <ul className="space-y-3">
                {data?.inheritanceTriggers?.map((t) => (
                  <li key={t._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 capitalize">{t.type.replace(/_/g, ' ')}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.triggered ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {t.triggered ? 'Triggered' : 'Monitoring'}
                      </span>
                    </div>
                    {t.inactivityDays && <p className="text-xs text-gray-400 mt-1">After {t.inactivityDays} days inactive</p>}
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
