import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, DollarSign, FileText, Plus, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { creatorAPI } from '../services/api'

const CATEGORIES = ['musician', 'athlete', 'influencer', 'actor', 'author', 'public_figure', 'other']

export default function CreatorPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ displayName: '', bio: '', category: 'influencer', revenueSharePercent: 70 })
  const [tierForm, setTierForm] = useState({ name: '', price: 0, description: '', features: '' })
  const [licenseForm, setLicenseForm] = useState({ licenseeName: '', terms: '', royaltyPercent: 10, startDate: '', endDate: '' })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const { data } = await creatorAPI.getProfile()
      if (data) {
        setProfile(data)
        setProfileForm({
          displayName: data.displayName || '',
          bio: data.bio || '',
          category: data.category || 'influencer',
          revenueSharePercent: data.revenueSharePercent || 70
        })
        const revData = await creatorAPI.getRevenue()
        setRevenue(revData.data)
      }
    } catch {
      // No profile yet
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    try {
      const { data } = await creatorAPI.updateProfile(profileForm)
      setProfile(data)
      toast.success('Creator profile saved!')
    } catch {
      toast.error('Failed to save profile')
    }
  }

  const addTier = async () => {
    if (!tierForm.name || tierForm.price < 0) {
      toast.error('Tier name and price are required')
      return
    }
    try {
      const { data } = await creatorAPI.addTier({
        ...tierForm,
        features: tierForm.features ? tierForm.features.split(',').map((f) => f.trim()) : [],
        price: Number(tierForm.price)
      })
      setProfile(data)
      setTierForm({ name: '', price: 0, description: '', features: '' })
      toast.success('Subscription tier added!')
    } catch {
      toast.error('Failed to add tier')
    }
  }

  const addLicense = async () => {
    if (!licenseForm.licenseeName) {
      toast.error('Licensee name is required')
      return
    }
    try {
      const { data } = await creatorAPI.addLicense({ ...licenseForm, royaltyPercent: Number(licenseForm.royaltyPercent) })
      setProfile(data)
      setLicenseForm({ licenseeName: '', terms: '', royaltyPercent: 10, startDate: '', endDate: '' })
      toast.success('Licensing agreement added!')
    } catch {
      toast.error('Failed to add license')
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
            <h1 className="text-2xl font-bold text-gray-900">Celebrity & Influencer Licensing</h1>
            <p className="text-sm text-gray-500">Creator storefront, subscriptions & revenue tracking</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {[
            { id: 'profile', label: 'Creator Profile', icon: Star },
            { id: 'tiers', label: 'Subscription Tiers', icon: DollarSign },
            { id: 'licenses', label: 'Licensing Agreements', icon: FileText },
            { id: 'revenue', label: 'Revenue', icon: DollarSign }
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Creator Storefront</h3>
            <div className="grid gap-4">
              <input
                placeholder="Display name"
                value={profileForm.displayName}
                onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <textarea
                placeholder="Bio / description"
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <select
                value={profileForm.category}
                onChange={(e) => setProfileForm({ ...profileForm, category: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Revenue Share % (your cut)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={profileForm.revenueSharePercent}
                  onChange={(e) => setProfileForm({ ...profileForm, revenueSharePercent: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>
            <button
              onClick={saveProfile}
              className="mt-4 flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
            >
              <Save size={16} /> Save Profile
            </button>
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Subscription Tier</h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="Tier name (e.g. Fan, VIP)"
                    value={tierForm.name}
                    onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Monthly price ($)"
                    value={tierForm.price}
                    onChange={(e) => setTierForm({ ...tierForm, price: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <textarea
                  placeholder="Description"
                  value={tierForm.description}
                  onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 h-20 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <input
                  placeholder="Features (comma-separated)"
                  value={tierForm.features}
                  onChange={(e) => setTierForm({ ...tierForm, features: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <button
                onClick={addTier}
                className="mt-4 flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                <Plus size={16} /> Add Tier
              </button>
            </div>

            <div className="grid gap-4">
              {profile?.subscriptionTiers?.filter(t => t.isActive).map((tier, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900">{tier.name}</h4>
                    <p className="text-xl font-bold text-primary-500">${tier.price}/mo</p>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                  {tier.features?.length > 0 && (
                    <ul className="text-sm text-gray-500 space-y-1">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {(!profile?.subscriptionTiers || profile.subscriptionTiers.length === 0) && (
                <div className="text-center py-8 text-gray-400">No subscription tiers yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Licenses Tab */}
        {activeTab === 'licenses' && (
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Add Licensing Agreement</h3>
              <div className="grid gap-4">
                <input
                  placeholder="Licensee name / company"
                  value={licenseForm.licenseeName}
                  onChange={(e) => setLicenseForm({ ...licenseForm, licenseeName: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <textarea
                  placeholder="License terms..."
                  value={licenseForm.terms}
                  onChange={(e) => setLicenseForm({ ...licenseForm, terms: e.target.value })}
                  className="border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    placeholder="Royalty %"
                    value={licenseForm.royaltyPercent}
                    onChange={(e) => setLicenseForm({ ...licenseForm, royaltyPercent: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    type="date"
                    placeholder="Start date"
                    value={licenseForm.startDate}
                    onChange={(e) => setLicenseForm({ ...licenseForm, startDate: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    type="date"
                    placeholder="End date"
                    value={licenseForm.endDate}
                    onChange={(e) => setLicenseForm({ ...licenseForm, endDate: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <button
                onClick={addLicense}
                className="mt-4 flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                <Plus size={16} /> Add License
              </button>
            </div>

            <div className="space-y-4">
              {profile?.licensingAgreements?.filter(l => l.isActive).map((lic, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900">{lic.licenseeName}</h4>
                    <span className="text-sm font-semibold text-primary-500">{lic.royaltyPercent}% royalty</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{lic.terms}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {lic.startDate && `${new Date(lic.startDate).toLocaleDateString()}`}
                    {lic.endDate && ` → ${new Date(lic.endDate).toLocaleDateString()}`}
                    {lic.signedAt && ` · Signed ${new Date(lic.signedAt).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
              {(!profile?.licensingAgreements || profile.licensingAgreements.length === 0) && (
                <div className="text-center py-8 text-gray-400">No licensing agreements yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue Summary</h3>
            {revenue ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Revenue', value: `$${revenue.totalRevenue?.toFixed(2)}` },
                  { label: 'Your Earnings', value: `$${revenue.creatorEarnings?.toFixed(2)}` },
                  { label: 'Platform Fee', value: `$${revenue.platformEarnings?.toFixed(2)}` },
                  { label: 'Revenue Share', value: `${revenue.revenueSharePercent}%` },
                  { label: 'Active Tiers', value: revenue.activeTiers },
                  { label: 'Active Licenses', value: revenue.activeLicenses }
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-2xl font-bold text-primary-500 mt-1">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <DollarSign size={48} className="mx-auto mb-4 opacity-30" />
                <p>Set up your creator profile to see revenue data.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
