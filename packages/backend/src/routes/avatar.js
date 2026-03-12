import express from 'express'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { authMiddleware } from '../middleware/auth.js'
import AIAvatar from '../models/AIAvatar.js'
import User from '../models/User.js'

const router = express.Router()

// Tier-gated fields — only these customization keys are writable per tier
const TIER_PERMISSIONS = {
  free: ['accentColor', 'greeting'],
  premium: ['accentColor', 'greeting', 'personality', 'voiceStyle', 'backgroundTheme'],
  elite: ['accentColor', 'greeting', 'personality', 'voiceStyle', 'backgroundTheme', 'coachingStyle']
}

// Build a coaching response based on avatar personality + context
function generateCoachingResponse(avatar, userMessage, sessionType) {
  const personality = avatar.customization.personality
  const name = avatar.name
  const goalCount = avatar.goals.filter(g => g.status === 'active').length

  const prefixes = {
    motivational: `Great that you reached out! `,
    calm: `Take a breath. `,
    analytical: `Let's think through this together. `,
    playful: `Hey, you've got this! `,
    empathetic: `I hear you. `
  }

  const closings = {
    tough_love: ` Now stop overthinking and take one small step today.`,
    gentle: ` Remember, every small step counts.`,
    socratic: ` What do you think would be the best next step?`,
    structured: ` Let's turn this into an action item.`,
    inspirational: ` You have everything you need inside you to make this happen.`
  }

  const prefix = prefixes[personality] || ''
  const closing = closings[avatar.customization.coachingStyle] || ''

  let body = ''
  if (sessionType === 'goal_review') {
    body = `You currently have ${goalCount} active goal${goalCount !== 1 ? 's' : ''}. Progress takes patience and consistency — review each one and pick the single most impactful action.`
  } else if (sessionType === 'daily_checkin') {
    body = `I'm here to support you through today. Whatever you're feeling right now is valid. Let's make today count.`
  } else if (sessionType === 'motivation') {
    body = `Every expert was once a beginner. The fact that you're here, working on yourself, is already a win.`
  } else if (sessionType === 'reflection') {
    body = `Reflection is one of the most powerful tools for growth. What patterns do you notice in your recent experiences?`
  } else {
    body = `I'm ${name}, your personal AI life coach. I'm here to help you grow, stay accountable, and build the life you envision.`
  }

  return `${prefix}${body}${closing}`
}

// ─── Get or create avatar ───────────────────────────────────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    let avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) {
      const user = await User.findById(req.userId)
      avatar = await AIAvatar.create({
        owner: req.userId,
        name: `${user.firstName}'s Avatar`
      })
    }
    res.json(avatar)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Update avatar settings ──────────────────────────────────────────────────
router.put('/', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    const { name, customization } = req.body
    const allowed = TIER_PERMISSIONS[avatar.tier]

    if (name) avatar.name = name

    if (customization) {
      for (const key of Object.keys(customization)) {
        if (!allowed.includes(key)) {
          return res.status(403).json({
            message: `Customization option "${key}" requires a higher subscription tier.`,
            requiredTier: key === 'coachingStyle' ? 'elite' : 'premium',
            currentTier: avatar.tier
          })
        }
        avatar.customization[key] = customization[key]
      }
    }

    await avatar.save()
    res.json(avatar)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Upload avatar photo ─────────────────────────────────────────────────────
// In production this receives a multipart file; here we simulate with a path
router.post('/photo', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    // Simulate upload to cloud storage
    const photoPath = `avatars/${req.userId}/${uuidv4()}.jpg`
    avatar.photo = photoPath

    // Premium/elite: simulate AI stylization of photo
    if (avatar.tier === 'premium' || avatar.tier === 'elite') {
      avatar.photoAnimated = `avatars/${req.userId}/animated_${uuidv4()}.gif`
    }

    await avatar.save()
    res.json({ photo: avatar.photo, photoAnimated: avatar.photoAnimated })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Upgrade tier (payment stubbed) ─────────────────────────────────────────
router.put('/tier', authMiddleware, async (req, res) => {
  try {
    const { tier } = req.body
    if (!['free', 'premium', 'elite'].includes(tier)) {
      return res.status(400).json({ message: 'Invalid tier' })
    }

    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    // TODO: Verify payment with Stripe before upgrading tier
    // const session = await stripe.checkout.sessions.create(...)

    avatar.tier = tier
    await avatar.save()

    res.json({
      message: `Avatar upgraded to ${tier} tier`,
      tier: avatar.tier,
      paymentNote: 'Payment processing integration pending'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Goals ───────────────────────────────────────────────────────────────────
router.get('/goals', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })
    res.json(avatar.goals)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/goals', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    const { title, description, targetDate } = req.body
    if (!title) return res.status(400).json({ message: 'Goal title is required' })

    avatar.goals.push({ title, description, targetDate })
    await avatar.save()
    res.status(201).json(avatar.goals[avatar.goals.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/goals/:goalId', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    const goal = avatar.goals.id(req.params.goalId)
    if (!goal) return res.status(404).json({ message: 'Goal not found' })

    const { title, description, targetDate, progress, status } = req.body
    if (title !== undefined) goal.title = title
    if (description !== undefined) goal.description = description
    if (targetDate !== undefined) goal.targetDate = targetDate
    if (progress !== undefined) goal.progress = Math.min(100, Math.max(0, progress))
    if (status !== undefined) goal.status = status

    await avatar.save()
    res.json(goal)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/goals/:goalId', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    avatar.goals = avatar.goals.filter(g => g._id.toString() !== req.params.goalId)
    await avatar.save()
    res.json({ message: 'Goal removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Check-ins ───────────────────────────────────────────────────────────────
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    const { mood, note, energyLevel, gratitude } = req.body
    if (!mood) return res.status(400).json({ message: 'Mood is required' })

    avatar.checkIns.push({ mood, note, energyLevel, gratitude })
    await avatar.save()

    const checkIn = avatar.checkIns[avatar.checkIns.length - 1]

    // Generate a brief avatar response to the check-in
    const moodResponses = {
      great: `That's wonderful! Let's channel this energy into your goals today.`,
      good: `Good to hear! Consistency on good days builds great momentum.`,
      okay: `That's perfectly fine. Ordinary days are where habits are built.`,
      low: `Thank you for sharing. Be gentle with yourself — rest is productive too.`,
      struggling: `I'm glad you checked in. You don't have to face this alone. What's weighing on you most right now?`
    }

    res.status(201).json({
      checkIn,
      avatarResponse: moodResponses[mood] || `Thanks for checking in today.`
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Reminders ───────────────────────────────────────────────────────────────
router.post('/reminders', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    const { title, dueDate, recurringFrequency } = req.body
    if (!title) return res.status(400).json({ message: 'Reminder title is required' })

    avatar.reminders.push({ title, dueDate, recurringFrequency })
    await avatar.save()
    res.status(201).json(avatar.reminders[avatar.reminders.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/reminders/:reminderId', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    const reminder = avatar.reminders.id(req.params.reminderId)
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' })

    const { completed } = req.body
    if (completed !== undefined) reminder.completed = completed

    await avatar.save()
    res.json(reminder)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Coaching chat (life assistant — while alive) ────────────────────────────
router.post('/coaching', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    const { message, sessionType = 'general' } = req.body
    if (!message) return res.status(400).json({ message: 'Message is required' })

    const response = generateCoachingResponse(avatar, message, sessionType)

    // Derive simple sentiment from keywords
    const lower = message.toLowerCase()
    const sentiment = lower.match(/\b(great|amazing|happy|excited|love|achieved)\b/)
      ? 'positive'
      : lower.match(/\b(sad|stuck|fail|struggle|hard|difficult|anxious)\b/)
        ? 'negative'
        : 'neutral'

    avatar.coachingSessions.push({
      userMessage: message,
      avatarResponse: response,
      sessionType,
      sentiment
    })
    await avatar.save()

    res.json({
      response,
      sessionType,
      sentiment,
      from: avatar.name
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/coaching/history', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    // Return last 50 sessions, newest first
    const sessions = [...avatar.coachingSessions]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 50)
    res.json(sessions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Legacy configuration (avatar after death) ───────────────────────────────
router.put('/legacy', authMiddleware, async (req, res) => {
  try {
    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    if (avatar.tier === 'free') {
      return res.status(403).json({
        message: 'Legacy mode requires Premium or Elite tier.',
        requiredTier: 'premium'
      })
    }

    const { legacyMessage, accessLevel } = req.body
    if (legacyMessage !== undefined) avatar.legacy.legacyMessage = legacyMessage
    if (accessLevel !== undefined) avatar.legacy.accessLevel = accessLevel

    await avatar.save()
    res.json(avatar.legacy)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Activate legacy mode (called when user is memorialized) ─────────────────
router.post('/legacy/activate', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user?.isMemorialized) {
      return res.status(400).json({
        message: 'User profile must be memorialized before activating avatar legacy mode'
      })
    }

    const avatar = await AIAvatar.findOne({ owner: req.userId })
    if (!avatar) return res.status(404).json({ message: 'Avatar not found' })

    avatar.legacy.isActive = true
    avatar.legacy.activatedAt = new Date()
    await avatar.save()

    res.json({ message: 'Avatar legacy mode activated', legacy: avatar.legacy })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Public legacy avatar chat (no auth — for loved ones after death) ────────
router.post('/legacy/chat', async (req, res) => {
  try {
    const { userId, message } = req.body

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    const avatar = await AIAvatar.findOne({ owner: userId })
    if (!avatar?.legacy?.isActive) {
      return res.status(404).json({ message: 'Legacy avatar not found or not active' })
    }

    avatar.legacy.totalInteractions += 1
    await avatar.save()

    // Build a response in the avatar's personality style
    const opening = avatar.legacy.legacyMessage
      ? `${avatar.legacy.legacyMessage} `
      : ''

    const responses = [
      `${opening}Thank you for visiting. I carry the memories of a life well-lived.`,
      `${opening}Every message here keeps a connection alive across time.`,
      `${opening}The love we shared doesn't end — it just takes a different form.`
    ]
    const response = responses[Math.floor(Math.random() * responses.length)]

    res.json({
      response,
      from: avatar.name,
      personality: avatar.customization.personality
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Public: get legacy avatar info by userId ────────────────────────────────
router.get('/legacy/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    const avatar = await AIAvatar.findOne({ owner: userId })
      .select('name photo photoAnimated customization legacy')
    if (!avatar?.legacy?.isActive) {
      return res.status(404).json({ message: 'Legacy avatar not found' })
    }

    res.json(avatar)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
