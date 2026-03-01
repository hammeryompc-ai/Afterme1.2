import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Plus, Trash2, Crown, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { familyAPI } from '../services/api'

const PLAN_TYPES = ['couple', 'family', 'extended']
const MEMBER_ROLES = ['admin', 'member', 'child', 'view_only']

export default function FamilyPage() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', planType: 'family', subscriptionTier: 'basic' })
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' })

  useEffect(() => {
    loadPlan()
  }, [])

  const loadPlan = async () => {
    setLoading(true)
    try {
      const { data } = await familyAPI.getPlan()
      setPlan(data)
    } catch {
      toast.error('Failed to load family plan')
    } finally {
      setLoading(false)
    }
  }

  const createPlan = async () => {
    if (!createForm.name) {
      toast.error('Please enter a family name')
      return
    }
    try {
      const { data } = await familyAPI.createPlan(createForm)
      setPlan(data)
      setShowCreateForm(false)
      toast.success('Family plan created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create plan')
    }
  }

  const inviteMember = async () => {
    if (!inviteForm.email) {
      toast.error('Please enter an email address')
      return
    }
    try {
      const { data } = await familyAPI.inviteMember(inviteForm)
      setPlan(data.plan)
      setShowInviteForm(false)
      setInviteForm({ email: '', role: 'member' })
      toast.success('Member added!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member')
    }
  }

  const removeMember = async (memberId) => {
    try {
      const { data } = await familyAPI.removeMember(memberId)
      setPlan(data.plan)
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
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
            <h1 className="text-2xl font-bold text-gray-900">Couples & Family Plans</h1>
            <p className="text-sm text-gray-500">Shared vault, timelines, and family space</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!plan ? (
          <div className="text-center py-16">
            <Users size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Family Plan Yet</h2>
            <p className="text-gray-500 mb-6">Create a shared space for your family to store memories, documents, and timelines.</p>
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-lg transition mx-auto"
              >
                <Plus size={18} /> Create Family Plan
              </button>
            ) : (
              <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6 text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Create Your Family Plan</h3>
                <div className="grid gap-4">
                  <input
                    placeholder="Family name (e.g. The Johnsons)"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <select
                    value={createForm.planType}
                    onChange={(e) => setCreateForm({ ...createForm, planType: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {PLAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select
                    value={createForm.subscriptionTier}
                    onChange={(e) => setCreateForm({ ...createForm, subscriptionTier: e.target.value })}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {['basic', 'premium', 'unlimited'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={createPlan} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition">
                    <Save size={16} /> Create
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Plan Header */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-gray-500">{plan.planType} plan · {plan.subscriptionTier} tier</p>
                </div>
                <div className="flex gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-primary-500">{plan.members?.length || 0}</p>
                    <p className="text-xs text-gray-500">Members</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Shared Vault</p>
                    <p className="text-sm text-gray-500">Documents shared with family</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition ${plan.sharedVaultEnabled ? 'bg-primary-500' : 'bg-gray-200'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${plan.sharedVaultEnabled ? 'translate-x-4' : ''}`}></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Shared Timeline</p>
                    <p className="text-sm text-gray-500">Family memories & events</p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition ${plan.sharedTimelineEnabled ? 'bg-primary-500' : 'bg-gray-200'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow m-0.5 transition-transform ${plan.sharedTimelineEnabled ? 'translate-x-4' : ''}`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Family Members</h3>
                <button
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-3 py-1.5 rounded-lg text-sm transition"
                >
                  <Plus size={14} /> Invite Member
                </button>
              </div>

              {showInviteForm && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      placeholder="Email address"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    />
                    <select
                      value={inviteForm.role}
                      onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    >
                      {MEMBER_ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowInviteForm(false)} className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition">Cancel</button>
                    <button onClick={inviteMember} className="flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition">
                      <Save size={14} /> Add
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {plan.members?.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {member.userId?.firstName?.[0] || '?'}{member.userId?.lastName?.[0] || ''}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {member.userId?.firstName
                            ? `${member.userId.firstName} ${member.userId.lastName}`
                            : member.userId?.email || 'Member'}
                        </p>
                        <div className="flex items-center gap-1">
                          {member.role === 'owner' && <Crown size={12} className="text-yellow-500" />}
                          <span className="text-xs text-gray-500">{member.role}</span>
                        </div>
                      </div>
                    </div>
                    {member.role !== 'owner' && (
                      <button onClick={() => removeMember(member.userId?._id || member.userId)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-400">
                        <Trash2 size={14} />
                      </button>
                    )}
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
