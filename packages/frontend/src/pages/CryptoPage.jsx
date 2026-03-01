import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Plus, Trash2, Save, Key, Users, Coins } from 'lucide-react'
import toast from 'react-hot-toast'
import { cryptoAPI } from '../services/api'

const WALLET_TYPES = ['bitcoin', 'ethereum', 'other_evm', 'solana', 'other']
const TRIGGER_CONDITIONS = ['on_death', 'inactivity', 'manual', 'legal_order']

export default function CryptoPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [form, setForm] = useState({
    walletLabel: '',
    walletType: 'ethereum',
    walletAddress: '',
    triggerCondition: 'on_death',
    inactivityDays: 365,
    beneficiaryEmail: '',
    beneficiaryShare: 100,
    notes: '',
    multiSigConfig: { requiredSigners: 2, totalSigners: 3 }
  })
  const [shardForm, setShardForm] = useState({ shardIndex: 1, holderEmail: '', encryptedShardRef: '' })

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const { data } = await cryptoAPI.getEntries()
      setEntries(data)
    } catch {
      toast.error('Failed to load crypto entries')
    } finally {
      setLoading(false)
    }
  }

  const loadEntry = async (id) => {
    try {
      const { data } = await cryptoAPI.getEntry(id)
      setSelectedEntry(data)
    } catch {
      toast.error('Failed to load entry')
    }
  }

  const saveEntry = async () => {
    if (!form.walletLabel) {
      toast.error('Wallet label is required')
      return
    }
    try {
      const { data } = await cryptoAPI.createEntry(form)
      setEntries([data, ...entries])
      setShowForm(false)
      setForm({ walletLabel: '', walletType: 'ethereum', walletAddress: '', triggerCondition: 'on_death', inactivityDays: 365, beneficiaryEmail: '', beneficiaryShare: 100, notes: '', multiSigConfig: { requiredSigners: 2, totalSigners: 3 } })
      toast.success('Crypto inheritance entry created!')
    } catch {
      toast.error('Failed to create entry')
    }
  }

  const deleteEntry = async (id) => {
    try {
      await cryptoAPI.deleteEntry(id)
      setEntries(entries.filter((e) => e._id !== id))
      if (selectedEntry?._id === id) setSelectedEntry(null)
      toast.success('Entry deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const addShard = async () => {
    if (!shardForm.holderEmail) {
      toast.error('Shard holder email is required')
      return
    }
    try {
      const { data } = await cryptoAPI.addShard(selectedEntry._id, shardForm)
      setSelectedEntry(data)
      setShardForm({ shardIndex: data.recoveryShards.length + 1, holderEmail: '', encryptedShardRef: '' })
      toast.success('Recovery shard added!')
    } catch {
      toast.error('Failed to add shard')
    }
  }

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {selectedEntry ? (
            <button onClick={() => setSelectedEntry(null)} className="text-primary-500 hover:text-primary-600">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button onClick={() => navigate('/dashboard')} className="text-primary-500 hover:text-primary-600">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Crypto Inheritance Bridge</h1>
            <p className="text-sm text-gray-500">Secure multi-sig inheritance workflows for digital assets</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Security Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Shield size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">Security Notice</p>
            <p className="text-sm text-amber-800">
              Never store raw private keys here. Use wallet addresses and multi-sig configurations only.
              Recovery shards should be encrypted references, not actual key material.
            </p>
          </div>
        </div>

        {!selectedEntry ? (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                <Plus size={16} /> Add Wallet
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Add Crypto Inheritance Entry</h3>
                <div className="grid gap-4">
                  <input
                    placeholder="Wallet label (e.g. Main Bitcoin Wallet)"
                    value={form.walletLabel}
                    onChange={(e) => setForm({ ...form, walletLabel: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={form.walletType}
                      onChange={(e) => setForm({ ...form, walletType: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {WALLET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      placeholder="Wallet address (public)"
                      value={form.walletAddress}
                      onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={form.triggerCondition}
                      onChange={(e) => setForm({ ...form, triggerCondition: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      {TRIGGER_CONDITIONS.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                    {form.triggerCondition === 'inactivity' && (
                      <input
                        type="number"
                        placeholder="Inactivity days"
                        value={form.inactivityDays}
                        onChange={(e) => setForm({ ...form, inactivityDays: Number(e.target.value) })}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      placeholder="Beneficiary email"
                      type="email"
                      value={form.beneficiaryEmail}
                      onChange={(e) => setForm({ ...form, beneficiaryEmail: e.target.value })}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Share % (default 100)"
                      value={form.beneficiaryShare}
                      onChange={(e) => setForm({ ...form, beneficiaryShare: Number(e.target.value) })}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Multi-Sig Configuration</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500">Required signers</label>
                        <input
                          type="number"
                          value={form.multiSigConfig.requiredSigners}
                          onChange={(e) => setForm({ ...form, multiSigConfig: { ...form.multiSigConfig, requiredSigners: Number(e.target.value) } })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Total signers</label>
                        <input
                          type="number"
                          value={form.multiSigConfig.totalSigners}
                          onChange={(e) => setForm({ ...form, multiSigConfig: { ...form.multiSigConfig, totalSigners: Number(e.target.value) } })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <textarea
                    placeholder="Notes (optional)"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 h-20 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={saveEntry} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition">
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>
            )}

            {entries.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Key size={64} className="mx-auto mb-4 opacity-30" />
                <p>No crypto inheritance entries yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div key={entry._id} className="bg-white rounded-lg shadow p-5">
                    <div className="flex items-center justify-between">
                      <button className="flex-1 text-left" onClick={() => { setSelectedEntry(entry); loadEntry(entry._id) }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            <Coins size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{entry.walletLabel}</p>
                            <p className="text-sm text-gray-500">{entry.walletType} · Trigger: {entry.triggerCondition?.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </button>
                      <button onClick={() => deleteEntry(entry._id)} className="p-2 hover:bg-red-100 rounded-lg text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Entry Detail */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedEntry.walletLabel}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Wallet Type</p><p className="font-semibold">{selectedEntry.walletType}</p></div>
                <div><p className="text-gray-500">Trigger</p><p className="font-semibold">{selectedEntry.triggerCondition?.replace('_', ' ')}</p></div>
                <div><p className="text-gray-500">Beneficiary</p><p className="font-semibold">{selectedEntry.beneficiaryEmail || 'Not set'}</p></div>
                <div><p className="text-gray-500">Share</p><p className="font-semibold">{selectedEntry.beneficiaryShare}%</p></div>
                <div><p className="text-gray-500">Multi-Sig</p><p className="font-semibold">{selectedEntry.multiSigConfig?.requiredSigners}-of-{selectedEntry.multiSigConfig?.totalSigners}</p></div>
                <div><p className="text-gray-500">Recovery Shards</p><p className="font-semibold">{selectedEntry.recoveryShards?.length || 0} configured</p></div>
              </div>
            </div>

            {/* Recovery Shards */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={18} /> Recovery Shard Holders
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Distribute encrypted recovery shards to trusted parties. 
                {selectedEntry.multiSigConfig?.requiredSigners}-of-{selectedEntry.multiSigConfig?.totalSigners} signatures needed to recover.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid gap-3 mb-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Shard index"
                      value={shardForm.shardIndex}
                      onChange={(e) => setShardForm({ ...shardForm, shardIndex: Number(e.target.value) })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <input
                      placeholder="Holder email"
                      type="email"
                      value={shardForm.holderEmail}
                      onChange={(e) => setShardForm({ ...shardForm, holderEmail: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                  </div>
                  <input
                    placeholder="Encrypted shard reference (not the raw key)"
                    value={shardForm.encryptedShardRef}
                    onChange={(e) => setShardForm({ ...shardForm, encryptedShardRef: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  />
                </div>
                <button onClick={addShard} className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                  Add Shard Holder
                </button>
              </div>

              <div className="space-y-2">
                {selectedEntry.recoveryShards?.map((shard, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${shard.isConfirmed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                        {shard.shardIndex}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{shard.holderEmail}</p>
                        <p className="text-xs text-gray-400">{shard.isConfirmed ? '✓ Confirmed' : 'Pending confirmation'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
