import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import CreatorProfile from '../models/CreatorProfile.js'

const router = express.Router()

// Get creator profile for the authenticated user
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.userId })
    res.json(profile || null)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get a public creator profile by userId
router.get('/profile/:userId', async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.params.userId, isActive: true })
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' })
    res.json(profile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create or update creator profile (storefront setup)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { displayName, bio, category, revenueSharePercent } = req.body
    const profile = await CreatorProfile.findOneAndUpdate(
      { userId: req.userId },
      { displayName, bio, category, revenueSharePercent },
      { new: true, upsert: true }
    )
    res.json(profile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a subscription tier
router.post('/profile/tiers', authMiddleware, async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.userId })
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' })

    profile.subscriptionTiers.push(req.body)
    await profile.save()
    res.status(201).json(profile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update a subscription tier
router.put('/profile/tiers/:tierId', authMiddleware, async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.userId })
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' })

    const tier = profile.subscriptionTiers.id(req.params.tierId)
    if (!tier) return res.status(404).json({ message: 'Tier not found' })

    Object.assign(tier, req.body)
    await profile.save()
    res.json(profile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a licensing agreement
router.post('/profile/licenses', authMiddleware, async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.userId })
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' })

    profile.licensingAgreements.push({ ...req.body, signedAt: new Date() })
    await profile.save()
    res.status(201).json(profile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get revenue summary
router.get('/revenue', authMiddleware, async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.userId })
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' })

    res.json({
      totalRevenue: profile.totalRevenue,
      revenueSharePercent: profile.revenueSharePercent,
      creatorEarnings: (profile.totalRevenue * profile.revenueSharePercent) / 100,
      platformEarnings: (profile.totalRevenue * (100 - profile.revenueSharePercent)) / 100,
      activeTiers: profile.subscriptionTiers.filter((t) => t.isActive).length,
      activeLicenses: profile.licensingAgreements.filter((l) => l.isActive).length
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
