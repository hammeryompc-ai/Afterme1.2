import React, { useState, useEffect, useRef } from 'react'
import { avatarAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  Bot, Camera, Target, MessageSquare, Crown, Sparkles,
  Plus, Check, Trash2, ChevronRight, Heart, Zap, Moon,
  Star, Lock, Send, RotateCcw, UserCircle
} from 'lucide-react'

const TABS = ['Avatar', 'Life Coach', 'Goals', 'Legacy']

const PERSONALITIES = [
  { value: 'motivational', label: 'Motivational', emoji: '🔥' },
  { value: 'calm', label: 'Calm', emoji: '🌊' },
  { value: 'analytical', label: 'Analytical', emoji: '🔬' },
  { value: 'playful', label: 'Playful', emoji: '🎉' },
  { value: 'empathetic', label: 'Empathetic', emoji: '💙' }
]

const COACHING_STYLES = [
  { value: 'tough_love', label: 'Tough Love', emoji: '💪' },
  { value: 'gentle', label: 'Gentle', emoji: '🌸' },
  { value: 'socratic', label: 'Socratic', emoji: '🤔' },
  { value: 'structured', label: 'Structured', emoji: '📋' },
  { value: 'inspirational', label: 'Inspirational', emoji: '✨' }
]

const MOODS = [
  { value: 'great', label: 'Great', emoji: '😄', color: 'bg-green-100 border-green-400 text-green-700' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-blue-100 border-blue-400 text-blue-700' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: 'bg-yellow-100 border-yellow-400 text-yellow-700' },
  { value: 'low', label: 'Low', emoji: '😔', color: 'bg-orange-100 border-orange-400 text-orange-700' },
  { value: 'struggling', label: 'Struggling', emoji: '😢', color: 'bg-red-100 border-red-400 text-red-700' }
]

const TIER_CONFIG = {
  free: {
    label: 'Free',
    color: 'bg-gray-100 text-gray-700',
    badge: null,
    price: 'Free',
    features: ['Basic avatar photo', 'Custom name & color', 'Basic coaching chat', '5 active goals']
  },
  premium: {
    label: 'Premium',
    color: 'bg-violet-100 text-violet-700',
    badge: '⭐',
    price: '$9/mo',
    features: [
      'Everything in Free',
      'AI-animated photo avatar',
      'Personality style selection',
      'Voice & background theme',
      'Unlimited goals',
      'Legacy mode configuration'
    ]
  },
  elite: {
    label: 'Elite',
    color: 'bg-amber-100 text-amber-700',
    badge: '👑',
    price: '$29/mo',
    features: [
      'Everything in Premium',
      'Coaching style selection',
      'Deep personality AI model',
      'Full legacy avatar unlock',
      'Priority response quality'
    ]
  }
}

function TierBadge({ tier }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.free
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
      {config.badge && <span>{config.badge}</span>}
      {config.label}
    </span>
  )
}

function AvatarDisplay({ avatar, size = 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-24 h-24 text-3xl' : 'w-12 h-12 text-lg'
  const initial = avatar?.name?.[0]?.toUpperCase() || '?'

  if (avatar?.photoAnimated) {
    return (
      <img
        src={avatar.photoAnimated}
        alt={avatar.name}
        className={`${sizeClass} rounded-full object-cover ring-4 ring-violet-200`}
        onError={(e) => { e.target.style.display = 'none' }}
      />
    )
  }
  if (avatar?.photo) {
    return (
      <img
        src={avatar.photo}
        alt={avatar.name}
        className={`${sizeClass} rounded-full object-cover ring-4`}
        style={{ ringColor: avatar.customization?.accentColor }}
        onError={(e) => { e.target.style.display = 'none' }}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold ring-4 ring-offset-2`}
      style={{ backgroundColor: avatar?.customization?.accentColor || '#6366f1' }}
    >
      {initial}
    </div>
  )
}

// ── Tab: Avatar customization ──────────────────────────────────────────────
function AvatarTab({ avatar, onUpdate }) {
  const [name, setName] = useState(avatar?.name || '')
  const [accentColor, setAccentColor] = useState(avatar?.customization?.accentColor || '#6366f1')
  const [greeting, setGreeting] = useState(avatar?.customization?.greeting || '')
  const [personality, setPersonality] = useState(avatar?.customization?.personality || 'motivational')
  const [coachingStyle, setCoachingStyle] = useState(avatar?.customization?.coachingStyle || 'gentle')
  const [backgroundTheme, setBackgroundTheme] = useState(avatar?.customization?.backgroundTheme || 'minimal')
  const [saving, setSaving] = useState(false)

  const tier = avatar?.tier || 'free'
  const isPremium = tier === 'premium' || tier === 'elite'
  const isElite = tier === 'elite'

  async function handleSave() {
    setSaving(true)
    try {
      const customization = { accentColor, greeting }
      if (isPremium) {
        customization.personality = personality
        customization.backgroundTheme = backgroundTheme
      }
      if (isElite) {
        customization.coachingStyle = coachingStyle
      }
      const { data } = await avatarAPI.updateAvatar({ name, customization })
      onUpdate(data)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpgradePhoto() {
    try {
      const { data } = await avatarAPI.uploadPhoto()
      onUpdate({ ...avatar, ...data })
      toast.success('Avatar photo updated!')
    } catch (err) {
      toast.error('Failed to update photo')
    }
  }

  async function handleUpgrade(newTier) {
    try {
      const { data } = await avatarAPI.upgradeTier(newTier)
      onUpdate({ ...avatar, tier: data.tier })
      toast.success(`Upgraded to ${data.tier} tier! (Payment integration pending)`)
    } catch (err) {
      toast.error('Upgrade failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Avatar preview + photo upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <AvatarDisplay avatar={{ ...avatar, customization: { ...avatar?.customization, accentColor } }} />
            {isPremium && (
              <span className="absolute -top-1 -right-1 text-lg">✨</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{name || 'My Avatar'}</h2>
              <TierBadge tier={tier} />
            </div>
            <p className="text-sm text-gray-500 italic">{greeting || avatar?.customization?.greeting}</p>
            <button
              onClick={handleUpgradePhoto}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 transition"
            >
              <Camera size={14} /> Upload Photo {!isPremium && <span className="text-gray-400">(Basic)</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Basic customization */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <UserCircle size={18} className="text-violet-500" /> Identity
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Avatar Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="Give your avatar a name..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentColor}
              onChange={e => setAccentColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-gray-200"
            />
            <span className="text-sm text-gray-500">{accentColor}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Greeting</label>
          <input
            value={greeting}
            onChange={e => setGreeting(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="How should your avatar greet you?"
          />
        </div>
      </div>

      {/* Premium customization */}
      <div className={`bg-white rounded-2xl border shadow-sm p-6 space-y-4 ${!isPremium ? 'opacity-60' : 'border-gray-100'}`}>
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Sparkles size={18} className="text-violet-500" />
          Personality
          {!isPremium && <Lock size={14} className="text-gray-400 ml-1" />}
          {!isPremium && <span className="text-xs font-normal text-gray-400">Premium+</span>}
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Personality Style</label>
          <div className="grid grid-cols-3 gap-2">
            {PERSONALITIES.map(p => (
              <button
                key={p.value}
                disabled={!isPremium}
                onClick={() => setPersonality(p.value)}
                className={`flex flex-col items-center p-2 rounded-lg border text-xs font-medium transition ${
                  personality === p.value
                    ? 'border-violet-400 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-600 hover:border-violet-300'
                } disabled:cursor-not-allowed`}
              >
                <span className="text-lg mb-0.5">{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Elite customization */}
      <div className={`bg-white rounded-2xl border shadow-sm p-6 space-y-4 ${!isElite ? 'opacity-60' : 'border-gray-100'}`}>
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Crown size={18} className="text-amber-500" />
          Coaching Style
          {!isElite && <Lock size={14} className="text-gray-400 ml-1" />}
          {!isElite && <span className="text-xs font-normal text-gray-400">Elite only</span>}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {COACHING_STYLES.map(s => (
            <button
              key={s.value}
              disabled={!isElite}
              onClick={() => setCoachingStyle(s.value)}
              className={`flex flex-col items-center p-2 rounded-lg border text-xs font-medium transition ${
                coachingStyle === s.value
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-gray-200 text-gray-600 hover:border-amber-300'
              } disabled:cursor-not-allowed`}
            >
              <span className="text-lg mb-0.5">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tier upgrade CTAs */}
      {tier === 'free' && (
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Star size={18} />
            <span className="font-bold">Upgrade to Premium</span>
          </div>
          <p className="text-sm text-violet-100 mb-3">
            Unlock AI-animated photo, personality styles, life coaching, and legacy mode.
          </p>
          <button
            onClick={() => handleUpgrade('premium')}
            className="bg-white text-violet-600 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-violet-50 transition"
          >
            Upgrade — {TIER_CONFIG.premium.price}
          </button>
        </div>
      )}
      {tier === 'premium' && (
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} />
            <span className="font-bold">Upgrade to Elite</span>
          </div>
          <p className="text-sm text-amber-100 mb-3">
            Full AI personality model, advanced coaching style, priority quality.
          </p>
          <button
            onClick={() => handleUpgrade('elite')}
            className="bg-white text-amber-600 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-amber-50 transition"
          >
            Upgrade — {TIER_CONFIG.elite.price}
          </button>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 transition disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}

// ── Tab: Life Coach chat ───────────────────────────────────────────────────
function CoachTab({ avatar }) {
  const [messages, setMessages] = useState([
    {
      from: 'avatar',
      text: avatar?.customization?.greeting || `Hi! I'm ${avatar?.name || 'your AI Avatar'}, your personal life coach. How can I support you today?`,
      time: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [sessionType, setSessionType] = useState('general')
  const [loading, setLoading] = useState(false)
  const [showCheckin, setShowCheckin] = useState(false)
  const [selectedMood, setSelectedMood] = useState(null)
  const [checkinNote, setCheckinNote] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { from: 'user', text: input, time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await avatarAPI.sendCoachingMessage(input, sessionType)
      setMessages(prev => [...prev, {
        from: 'avatar',
        text: data.response,
        time: new Date(),
        sentiment: data.sentiment
      }])
    } catch {
      setMessages(prev => [...prev, {
        from: 'avatar',
        text: "I'm having a moment — please try again shortly.",
        time: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  async function submitCheckIn() {
    if (!selectedMood) return
    try {
      const { data } = await avatarAPI.checkIn({ mood: selectedMood, note: checkinNote })
      setMessages(prev => [...prev, {
        from: 'avatar',
        text: data.avatarResponse,
        time: new Date()
      }])
      setShowCheckin(false)
      setSelectedMood(null)
      setCheckinNote('')
      toast.success('Check-in recorded!')
    } catch {
      toast.error('Check-in failed')
    }
  }

  const SESSION_TYPES = [
    { value: 'general', label: 'Chat', icon: MessageSquare },
    { value: 'goal_review', label: 'Goals', icon: Target },
    { value: 'motivation', label: 'Motivate', icon: Zap },
    { value: 'reflection', label: 'Reflect', icon: Moon }
  ]

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Session type selector */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {SESSION_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setSessionType(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              sessionType === value
                ? 'bg-violet-600 text-white border-violet-600'
                : 'border-gray-200 text-gray-600 hover:border-violet-300'
            }`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
        <button
          onClick={() => setShowCheckin(!showCheckin)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 transition ml-auto"
        >
          <Heart size={12} /> Daily Check-in
        </button>
      </div>

      {/* Check-in panel */}
      {showCheckin && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-3">
          <p className="text-sm font-medium text-rose-800 mb-2">How are you feeling today?</p>
          <div className="flex gap-2 flex-wrap mb-3">
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => setSelectedMood(m.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition ${
                  selectedMood === m.value ? m.color : 'border-gray-200 text-gray-600'
                }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
          <input
            value={checkinNote}
            onChange={e => setCheckinNote(e.target.value)}
            placeholder="Anything you'd like to add? (optional)"
            className="w-full border border-rose-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 mb-2"
          />
          <button
            onClick={submitCheckIn}
            disabled={!selectedMood}
            className="bg-rose-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-rose-600 transition disabled:opacity-40"
          >
            Submit Check-in
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.from === 'avatar' && (
              <div className="mr-2 mt-1 flex-shrink-0">
                <AvatarDisplay avatar={avatar} size="sm" />
              </div>
            )}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.from === 'user'
                  ? 'bg-violet-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm ml-14">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{avatar?.name} is thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Talk to ${avatar?.name || 'your avatar'}...`}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-violet-600 text-white px-4 py-2.5 rounded-xl hover:bg-violet-700 transition disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}

// ── Tab: Goals ────────────────────────────────────────────────────────────
function GoalsTab({ avatar }) {
  const [goals, setGoals] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDate, setNewDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    avatarAPI.getGoals()
      .then(r => setGoals(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function addGoal(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    try {
      const { data } = await avatarAPI.addGoal({
        title: newTitle,
        description: newDesc,
        targetDate: newDate || undefined
      })
      setGoals(prev => [...prev, data])
      setNewTitle('')
      setNewDesc('')
      setNewDate('')
      setShowAdd(false)
      toast.success('Goal added!')
    } catch {
      toast.error('Failed to add goal')
    }
  }

  async function updateProgress(goal, delta) {
    const progress = Math.min(100, Math.max(0, (goal.progress || 0) + delta))
    try {
      const { data } = await avatarAPI.updateGoal(goal._id, { progress })
      setGoals(prev => prev.map(g => g._id === goal._id ? data : g))
    } catch {
      toast.error('Failed to update')
    }
  }

  async function markComplete(goal) {
    try {
      const { data } = await avatarAPI.updateGoal(goal._id, { status: 'completed', progress: 100 })
      setGoals(prev => prev.map(g => g._id === goal._id ? data : g))
      toast.success('Goal completed! 🎉')
    } catch {
      toast.error('Failed to update')
    }
  }

  async function deleteGoal(goalId) {
    try {
      await avatarAPI.deleteGoal(goalId)
      setGoals(prev => prev.filter(g => g._id !== goalId))
      toast.success('Goal removed')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) return <div className="text-center text-gray-400 py-12">Loading goals...</div>

  const active = goals.filter(g => g.status === 'active')
  const completed = goals.filter(g => g.status === 'completed')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Your Goals</h3>
          <p className="text-sm text-gray-500">{active.length} active · {completed.length} completed</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-violet-700 transition"
        >
          <Plus size={15} /> Add Goal
        </button>
      </div>

      {/* Add goal form */}
      {showAdd && (
        <form onSubmit={addGoal} className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Goal title *"
            className="w-full border border-violet-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            required
          />
          <input
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="w-full border border-violet-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="w-full border border-violet-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 transition">
              Save Goal
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-gray-500 text-sm px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Active goals */}
      {active.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-400">
          <Target size={40} className="mx-auto mb-3 opacity-30" />
          <p>No active goals yet. Add your first goal to get started.</p>
        </div>
      )}

      {active.map(goal => (
        <div key={goal._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{goal.title}</h4>
              {goal.description && <p className="text-xs text-gray-500 mt-0.5">{goal.description}</p>}
              {goal.targetDate && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => markComplete(goal)} title="Mark complete" className="text-green-500 hover:text-green-600 transition">
                <Check size={16} />
              </button>
              <button onClick={() => deleteGoal(goal._id)} title="Delete" className="text-red-400 hover:text-red-500 transition">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-3">
            <button onClick={() => updateProgress(goal, -10)} className="text-gray-400 hover:text-gray-600 transition text-xs px-1">−</button>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${goal.progress || 0}%`,
                  backgroundColor: avatar?.customization?.accentColor || '#6366f1'
                }}
              />
            </div>
            <button onClick={() => updateProgress(goal, 10)} className="text-gray-400 hover:text-gray-600 transition text-xs px-1">+</button>
            <span className="text-xs font-medium text-gray-600 w-8 text-right">{goal.progress || 0}%</span>
          </div>
        </div>
      ))}

      {/* Completed goals */}
      {completed.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-2 mt-4">Completed</p>
          {completed.map(goal => (
            <div key={goal._id} className="bg-green-50 border border-green-100 rounded-xl p-4 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                <span className="font-medium text-gray-700 line-through text-sm">{goal.title}</span>
              </div>
              <button onClick={() => deleteGoal(goal._id)} className="text-gray-300 hover:text-red-400 transition">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tab: Legacy ───────────────────────────────────────────────────────────
function LegacyTab({ avatar, onUpdate }) {
  const [legacyMessage, setLegacyMessage] = useState(avatar?.legacy?.legacyMessage || '')
  const [accessLevel, setAccessLevel] = useState(avatar?.legacy?.accessLevel || 'friends')
  const [saving, setSaving] = useState(false)
  const tier = avatar?.tier || 'free'
  const isLocked = tier === 'free'
  const isActive = avatar?.legacy?.isActive

  async function saveLegacy() {
    setSaving(true)
    try {
      const { data } = await avatarAPI.updateLegacy({ legacyMessage, accessLevel })
      onUpdate({ ...avatar, legacy: data })
      toast.success('Legacy settings saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* What is legacy mode */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={20} className="text-indigo-500" />
          <h3 className="font-bold text-gray-900">Legacy Avatar Mode</h3>
          {isActive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          After you pass, your AI Avatar becomes your <strong>Legacy Avatar</strong> —
          a living memorial that your loved ones can visit, talk to, and remember you through.
          It carries your personality, your words, and your memory forward in time.
        </p>
      </div>

      {isLocked ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-6 text-center">
          <Lock size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700 mb-1">Legacy mode requires Premium or Elite</p>
          <p className="text-sm text-gray-500">Upgrade your avatar tier to configure your legacy settings.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Legacy Opening Message
              </label>
              <p className="text-xs text-gray-400 mb-2">
                The first thing your avatar says to visitors after you're gone.
              </p>
              <textarea
                value={legacyMessage}
                onChange={e => setLegacyMessage(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                placeholder="e.g. 'I'm so glad you came to visit. Though I'm no longer here in person, my love for you never changes...'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who can visit your Legacy Avatar?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['public', 'friends', 'family', 'private'].map(level => (
                  <button
                    key={level}
                    onClick={() => setAccessLevel(level)}
                    className={`py-2 rounded-lg text-sm font-medium border-2 transition capitalize ${
                      accessLevel === level
                        ? 'border-violet-400 bg-violet-50 text-violet-700'
                        : 'border-gray-200 text-gray-600 hover:border-violet-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isActive && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm font-medium text-green-800 flex items-center gap-1.5">
                <Check size={15} /> Legacy mode is active
              </p>
              <p className="text-xs text-green-600 mt-1">
                {avatar.legacy.totalInteractions} visit{avatar.legacy.totalInteractions !== 1 ? 's' : ''} from loved ones.
              </p>
            </div>
          )}

          <button
            onClick={saveLegacy}
            disabled={saving}
            className="w-full bg-violet-600 text-white font-semibold py-3 rounded-xl hover:bg-violet-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Legacy Settings'}
          </button>
        </>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function AvatarPage() {
  const [avatar, setAvatar] = useState(null)
  const [activeTab, setActiveTab] = useState('Avatar')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    avatarAPI.getAvatar()
      .then(r => setAvatar(r.data))
      .catch(() => toast.error('Failed to load avatar'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Bot size={48} className="mx-auto text-violet-400 mb-3 animate-pulse" />
          <p className="text-gray-500">Loading your AI Avatar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AvatarDisplay avatar={avatar} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{avatar?.name || 'My AI Avatar'}</h1>
                <TierBadge tier={avatar?.tier} />
              </div>
              <p className="text-xs text-gray-500">Your personal AI life assistant & legacy</p>
            </div>
          </div>
          <Bot size={24} className="text-violet-400" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6 gap-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-white shadow text-violet-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Avatar' && <AvatarTab avatar={avatar} onUpdate={setAvatar} />}
        {activeTab === 'Life Coach' && <CoachTab avatar={avatar} />}
        {activeTab === 'Goals' && <GoalsTab avatar={avatar} />}
        {activeTab === 'Legacy' && <LegacyTab avatar={avatar} onUpdate={setAvatar} />}
      </div>
    </div>
  )
}
