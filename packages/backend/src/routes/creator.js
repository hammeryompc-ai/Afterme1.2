import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import CreatorProfile from '../models/CreatorProfile.js'

const router = express.Router()

// Get creator profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.userId })
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' })
    res.json(profile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create / update creator profile
router.post('/profile', authMiddleware, async (req, res) => {
  try {
    let profile = await CreatorProfile.findOne({ userId: req.userId })
    if (!profile) {
      profile = new CreatorProfile({ ...req.body, userId: req.userId })
    } else {
      Object.assign(profile, req.body)
    }
    await profile.save()
    res.json(profile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add subscription tier
router.post('/profile/tiers', authMiddleware, async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.userId })
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' })
    profile.subscriptionTiers.push(req.body)
    await profile.save()
    res.status(201).json(profile.subscriptionTiers[profile.subscriptionTiers.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Subscribe to a creator
router.post('/:creatorId/subscribe', authMiddleware, async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.params.creatorId })
    if (!profile) return res.status(404).json({ message: 'Creator not found' })
    const tier = profile.subscriptionTiers.id(req.body.tierId)
    if (!tier) return res.status(404).json({ message: 'Subscription tier not found' })

    const existing = profile.subscribers.find(
      (s) => s.userId?.toString() === req.userId && s.active
    )
    if (existing) return res.status(400).json({ message: 'Already subscribed' })

    profile.subscribers.push({
      userId: req.userId,
      tierId: req.body.tierId,
      expiresAt: req.body.expiresAt
    })
    tier.subscriberCount += 1
    await profile.save()
    res.status(201).json({ message: 'Subscribed successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add licensing agreement
router.post('/profile/licenses', authMiddleware, async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.userId })
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' })
    profile.licensingAgreements.push(req.body)
    await profile.save()
    res.status(201).json(profile.licensingAgreements[profile.licensingAgreements.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get revenue summary
router.get('/profile/revenue', authMiddleware, async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.userId })
    if (!profile) return res.status(404).json({ message: 'Creator profile not found' })
    res.json(profile.revShare)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Public storefront
router.get('/:creatorId/storefront', async (req, res) => {
  try {
    const profile = await CreatorProfile.findOne({ userId: req.params.creatorId })
    if (!profile || !profile.storefront.enabled) {
      return res.status(404).json({ message: 'Storefront not found' })
    }
    res.json({
      displayName: profile.displayName,
      bio: profile.bio,
      category: profile.category,
      storefront: profile.storefront,
      subscriptionTiers: profile.subscriptionTiers.map((t) => ({
        _id: t._id,
        name: t.name,
        price: t.price,
        currency: t.currency,
        billingInterval: t.billingInterval,
        benefits: t.benefits,
        subscriberCount: t.subscriberCount
      }))
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
