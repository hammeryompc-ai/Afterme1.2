import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import JournalEntry from '../models/JournalEntry.js'
import TrustedContact from '../models/TrustedContact.js'
import User from '../models/User.js'

const router = express.Router()

// ── Journal / Check-ins ───────────────────────────────────────────────────────

// Get all journal entries
router.get('/journal', authMiddleware, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(entries)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create journal entry / check-in
router.post('/journal', authMiddleware, async (req, res) => {
  try {
    const { title, content, mood, tags, isPrivate, biometricData, checkInType } = req.body
    const entry = new JournalEntry({
      userId: req.userId,
      title,
      content,
      mood,
      tags,
      isPrivate,
      biometricData,
      checkInType: checkInType || 'manual'
    })
    await entry.save()

    // AI mood analysis — flag for alert if mood is poor
    if (mood === 'poor' || mood === 'low') {
      await triggerMoodAlert(req.userId, mood)
    }

    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update journal entry
router.put('/journal/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    )
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete journal entry
router.delete('/journal/:id', authMiddleware, async (req, res) => {
  try {
    await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Entry deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ── Guardian Settings ─────────────────────────────────────────────────────────

// Get guardian config for current user
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('guardianSettings')
    res.json(user?.guardianSettings || {})
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update guardian settings (check-in schedule, trigger conditions, safety rules)
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const {
      checkInFrequency,
      checkInTime,
      triggerConditions,
      safetyRules,
      emergencyMessage
    } = req.body

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        guardianSettings: {
          checkInFrequency,
          checkInTime,
          triggerConditions,
          safetyRules,
          emergencyMessage
        }
      },
      { new: true }
    )

    res.json(user.guardianSettings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ── Trusted Contacts (Guardian view) ─────────────────────────────────────────

// List contacts for alert routing
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const contacts = await TrustedContact.find({
      userId: req.userId,
      'alertPreferences.emergencyTrigger': true
    })
    res.json(contacts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ── Internal helper ───────────────────────────────────────────────────────────

async function triggerMoodAlert(userId, mood) {
  // TODO: In production, integrate with email/SMS/push notification service
  // to notify guardian contacts when a low/poor mood check-in is recorded.
  const contacts = await TrustedContact.find({
    userId,
    'alertPreferences.lowMoodDetected': true
  })
  // contacts.forEach(c => sendAlert(c, mood))
  if (contacts.length > 0) {
    console.log(`[Guardian] Mood alert (${mood}) for user ${userId}: ${contacts.length} contact(s) to notify`)
  }
}

export default router
