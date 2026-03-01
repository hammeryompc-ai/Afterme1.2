import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import TimeCapsule from '../models/TimeCapsule.js'

const router = express.Router()

// List capsules for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const capsules = await TimeCapsule.find({ creatorId: req.userId })
    res.json(capsules)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create capsule
router.post('/', authMiddleware, async (req, res) => {
  try {
    const capsule = new TimeCapsule({ ...req.body, creatorId: req.userId })
    await capsule.save()
    res.status(201).json(capsule)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single capsule
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOne({
      _id: req.params.id,
      creatorId: req.userId
    })
    if (!capsule) return res.status(404).json({ message: 'Capsule not found' })
    res.json(capsule)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update capsule
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.userId },
      req.body,
      { new: true }
    )
    if (!capsule) return res.status(404).json({ message: 'Capsule not found' })
    res.json(capsule)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Seal capsule
router.post('/:id/seal', authMiddleware, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOne({
      _id: req.params.id,
      creatorId: req.userId
    })
    if (!capsule) return res.status(404).json({ message: 'Capsule not found' })
    capsule.status = 'sealed'
    capsule.sealedAt = new Date()
    await capsule.save()
    res.json(capsule)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete capsule
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOneAndDelete({
      _id: req.params.id,
      creatorId: req.userId
    })
    if (!capsule) return res.status(404).json({ message: 'Capsule not found' })
    res.json({ message: 'Capsule deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
