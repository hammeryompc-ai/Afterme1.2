import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import TimeCapsule from '../models/TimeCapsule.js'

const router = express.Router()

// List time capsules created by the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const capsules = await TimeCapsule.find({ creatorId: req.userId }).sort({ createdAt: -1 })
    res.json(capsules)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get a single time capsule
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOne({
      _id: req.params.id,
      $or: [{ creatorId: req.userId }, { recipientId: req.userId }]
    })
    if (!capsule) return res.status(404).json({ message: 'Time capsule not found' })
    res.json(capsule)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a time capsule
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      recipientId,
      recipientName,
      recipientEmail,
      title,
      message,
      mediaUrls,
      releaseType,
      releaseDate,
      releaseAge,
      releaseEvent,
      contentRating
    } = req.body

    const capsule = new TimeCapsule({
      creatorId: req.userId,
      recipientId,
      recipientName,
      recipientEmail,
      title,
      message,
      mediaUrls,
      releaseType,
      releaseDate,
      releaseAge,
      releaseEvent,
      contentRating: contentRating || 'all_ages',
      parentApproved: true
    })
    await capsule.save()
    res.status(201).json(capsule)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update a time capsule (before delivery)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOne({ _id: req.params.id, creatorId: req.userId })
    if (!capsule) return res.status(404).json({ message: 'Time capsule not found' })
    if (capsule.isDelivered) {
      return res.status(400).json({ message: 'Cannot edit a delivered capsule' })
    }
    Object.assign(capsule, req.body)
    await capsule.save()
    res.json(capsule)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete a time capsule (before delivery)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOne({ _id: req.params.id, creatorId: req.userId })
    if (!capsule) return res.status(404).json({ message: 'Time capsule not found' })
    if (capsule.isDelivered) {
      return res.status(400).json({ message: 'Cannot delete a delivered capsule' })
    }
    await capsule.deleteOne()
    res.json({ message: 'Time capsule deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Mark a capsule as delivered (admin / scheduled job use)
router.post('/:id/deliver', authMiddleware, async (req, res) => {
  try {
    const capsule = await TimeCapsule.findOne({ _id: req.params.id, creatorId: req.userId })
    if (!capsule) return res.status(404).json({ message: 'Time capsule not found' })
    capsule.isDelivered = true
    capsule.deliveredAt = new Date()
    await capsule.save()
    res.json({ message: 'Capsule marked as delivered', capsule })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
