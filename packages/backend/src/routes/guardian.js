import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import GuardianProfile from '../models/GuardianProfile.js'

const router = express.Router()

const getOrCreateProfile = async (userId) => {
  let profile = await GuardianProfile.findOne({ userId })
  if (!profile) {
    profile = new GuardianProfile({ userId })
    await profile.save()
  }
  return profile
}

// Get guardian profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.userId)
    res.json(profile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Toggle active status
router.put('/toggle', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.userId)
    profile.isActive = !profile.isActive
    await profile.save()
    res.json({ isActive: profile.isActive })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add journal entry
router.post('/journal', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.userId)
    profile.journalEntries.push(req.body)
    await profile.save()
    res.status(201).json(profile.journalEntries[profile.journalEntries.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Log check-in
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.userId)
    const checkIn = {
      scheduledAt: new Date(),
      completedAt: new Date(),
      response: req.body.response || '',
      mood: req.body.mood || 'okay',
      skipped: false
    }
    profile.checkIns.push(checkIn)
    await profile.save()
    res.status(201).json(checkIn)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update check-in frequency
router.put('/checkin-frequency', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.userId)
    profile.checkInFrequency = req.body.frequency
    await profile.save()
    res.json({ checkInFrequency: profile.checkInFrequency })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add trusted contact
router.post('/contacts', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.userId)
    profile.trustedContacts.push(req.body)
    await profile.save()
    res.status(201).json(profile.trustedContacts[profile.trustedContacts.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add trigger condition
router.post('/triggers', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.userId)
    profile.triggerConditions.push(req.body)
    await profile.save()
    res.status(201).json(profile.triggerConditions[profile.triggerConditions.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Log biometric input
router.post('/biometrics', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.userId)
    profile.biometricInputs.push(req.body)
    await profile.save()
    res.status(201).json({ message: 'Biometric data recorded' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get alerts
router.get('/alerts', authMiddleware, async (req, res) => {
  try {
    const profile = await getOrCreateProfile(req.userId)
    res.json(profile.alerts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Resolve alert
router.put('/alerts/:alertId/resolve', authMiddleware, async (req, res) => {
  try {
    const profile = await GuardianProfile.findOne({ userId: req.userId })
    if (!profile) return res.status(404).json({ message: 'Profile not found' })
    const alert = profile.alerts.id(req.params.alertId)
    if (!alert) return res.status(404).json({ message: 'Alert not found' })
    alert.resolved = true
    await profile.save()
    res.json({ message: 'Alert resolved' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
