import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Star, DollarSign, FileText, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { creatorAPI } from '../services/api'

export default function CreatorPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [activeTab, setActiveTab] = useState('storefront')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    try {
      const { data } = await creatorAPI.getProfile()
      setProfile(data)
    } catch {
      // Profile doesn't exist yet
    }
  }

  const handleCreateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await creatorAPI.createProfile(form)
      setProfile(data)
      toast.success('Creator profile created!')
      setForm({})
    } catch {
      toast.error('Failed to create profile')
    } finally { setLoading(false) }
  }

  const handleAddTier = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await creatorAPI.addTier(form)
      toast.success('Subscription tier added')
      setForm({})
      loadProfile()
    } catch {
      toast.error('Failed to add tier')
    } finally { setLoading(false) }
  }

  const handleAddLicense = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await creatorAPI.addLicense(form)
      toast.success('Licensing agreement added')
      setForm({})
      loadProfile()
    } catch {
      toast.error('Failed to add license')
    } finally { setLoading(false) }
  }

  const handleToggleStorefront = async () => {
    if (!profile) return
    setLoading(true)
    try {
      const { data } = await creatorAPI.createProfile({
        ...profile,
        storefront: { ...profile.storefront, enabled: !profile.storefront?.enabled }
      })
      setProfile(data)
      toast.success(data.storefront.enabled ? 'Storefront enabled' : 'Storefront disabled')
    } catch {
      toast.error('Failed to toggle storefront')
    } finally { setLoading(false) }
  }

  const tabs = [
    { id: 'storefront', label: 'Storefront', icon: ShoppingBag },
    { id: 'subscriptions', label: 'Subscriptions', icon: Star },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'licenses', label: 'Licenses', icon: FileText }
  ]

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
              <ArrowLeft size={20} /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Creator Licensing</h1>
            <div className="w-20" />
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="font-bold text-gray-900 text-xl mb-2">Create Your Creator Profile</h3>
            <p className="text-gray-500 text-sm mb-6">Set up your public storefront for fan subscriptions and licensing.</p>
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <input required placeholder="Display name" value={form.displayName || ''} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              <textarea placeholder="Bio" value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none" />
              <select value={form.category || 'influencer'} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="musician">Musician</option>
                <option value="actor">Actor</option>
                <option value="athlete">Athlete</option>
                <option value="influencer">Influencer</option>
                <option value="author">Author</option>
                <option value="other">Other</option>
              </select>
              <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                <Star size={16} /> Create Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-semibold">
            <ArrowLeft size={20} /> Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
            <p className="text-sm text-gray-500 capitalize text-center">{profile.category}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profile.storefront?.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {profile.storefront?.enabled ? 'Live' : 'Offline'}
          </span>
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

        {activeTab === 'storefront' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Your Storefront</h3>
                  <p className="text-gray-500 text-sm">Enable to allow fans to discover and subscribe to you.</p>
                </div>
                <button onClick={handleToggleStorefront} disabled={loading}
                  className={`font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50 transition ${profile.storefront?.enabled ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                  {profile.storefront?.enabled ? 'Disable Storefront' : 'Enable Storefront'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary-500">{profile.subscriptionTiers?.length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Subscription Tiers</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-500">{profile.subscribers?.filter(s => s.active).length || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">Active Subscribers</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Add Subscription Tier</h3>
              <form onSubmit={handleAddTier} className="space-y-4">
                <input required placeholder="Tier name (e.g. 'Fan', 'Super Fan')" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" required placeholder="Price" value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                  <select value={form.billingInterval || 'monthly'} onChange={(e) => setForm({ ...form, billingInterval: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <input placeholder="Benefits (comma separated)" value={form.benefitsStr || ''} onChange={(e) => setForm({ ...form, benefitsStr: e.target.value, benefits: e.target.value.split(',').map(b => b.trim()).filter(Boolean) })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Add Tier
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Subscription Tiers</h3>
              {profile?.subscriptionTiers?.length === 0 && <p className="text-gray-500 text-sm">No tiers yet.</p>}
              <div className="grid gap-4">
                {profile?.subscriptionTiers?.map((tier) => (
                  <div key={tier._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">{tier.name}</p>
                      <p className="font-bold text-primary-500">${tier.price}/{tier.billingInterval === 'monthly' ? 'mo' : 'yr'}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{tier.subscriberCount} subscribers</p>
                    {tier.benefits?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {tier.benefits.map((b, i) => <li key={i} className="text-xs text-gray-600 flex items-center gap-1"><span className="text-green-500">✓</span> {b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h3 className="font-bold text-gray-900 text-lg">Revenue Share</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-green-600">${(profile.revShare?.totalEarnings || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-5 text-center">
                <p className="text-3xl font-bold text-blue-600">${(profile.revShare?.pendingPayout || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Pending Payout</p>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Revenue Split</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-green-200 rounded-full h-4 relative overflow-hidden">
                  <div className="h-4 bg-green-500 rounded-full" style={{ width: `${profile.revShare?.creatorPercent || 80}%` }} />
                </div>
                <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                  {profile.revShare?.creatorPercent || 80}% You · {profile.revShare?.platformPercent || 20}% Platform
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'licenses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Add Licensing Agreement</h3>
              <form onSubmit={handleAddLicense} className="space-y-4">
                <select value={form.licenseType || 'non_exclusive'} onChange={(e) => setForm({ ...form, licenseType: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="exclusive">Exclusive</option>
                  <option value="non_exclusive">Non-Exclusive</option>
                  <option value="limited">Limited</option>
                </select>
                <input placeholder="Licensee name" value={form.licensee || ''} onChange={(e) => setForm({ ...form, licensee: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <input placeholder="Territory (e.g. Worldwide, US only)" value={form.territory || ''} onChange={(e) => setForm({ ...form, territory: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="date" placeholder="Start date" value={form.startDate || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                  <input type="date" placeholder="End date" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                </div>
                <input type="number" placeholder="Royalty %" value={form.royaltyPercent || ''} onChange={(e) => setForm({ ...form, royaltyPercent: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-5 rounded-lg disabled:opacity-50 transition">
                  <Plus size={16} /> Add Agreement
                </button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Agreements ({profile?.licensingAgreements?.length || 0})</h3>
              {profile?.licensingAgreements?.length === 0 && <p className="text-gray-500 text-sm">No licensing agreements yet.</p>}
              <ul className="space-y-3">
                {profile?.licensingAgreements?.map((lic) => (
                  <li key={lic._id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900">{lic.licensee}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${lic.status === 'active' ? 'bg-green-100 text-green-800' : lic.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>{lic.status}</span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize mt-1">{lic.licenseType?.replace('_', ' ')} · {lic.territory} · {lic.royaltyPercent}% royalty</p>
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
