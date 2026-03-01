import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import FamilyPlan from '../models/FamilyPlan.js'

const router = express.Router()

// List family plans for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const plans = await FamilyPlan.find({
      $or: [
        { ownerId: req.userId },
        { 'members.userId': req.userId }
      ]
    })
    res.json(plans)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create family plan
router.post('/', authMiddleware, async (req, res) => {
  try {
    const plan = new FamilyPlan({
      ...req.body,
      ownerId: req.userId,
      members: [
        {
          userId: req.userId,
          role: 'owner',
          permissions: {
            viewVault: true,
            editVault: true,
            viewTimeline: true,
            manageMembers: true
          }
        }
      ]
    })
    await plan.save()
    res.status(201).json(plan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single plan
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const plan = await FamilyPlan.findById(req.params.id)
    if (!plan) return res.status(404).json({ message: 'Plan not found' })
    const isMember =
      plan.ownerId.toString() === req.userId ||
      plan.members.some((m) => m.userId?.toString() === req.userId)
    if (!isMember) return res.status(403).json({ message: 'Access denied' })
    res.json(plan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add member
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const plan = await FamilyPlan.findOne({ _id: req.params.id, ownerId: req.userId })
    if (!plan) return res.status(404).json({ message: 'Plan not found or not authorized' })
    plan.members.push(req.body)
    await plan.save()
    res.status(201).json(plan.members[plan.members.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add to shared vault
router.post('/:id/vault', authMiddleware, async (req, res) => {
  try {
    const plan = await FamilyPlan.findById(req.params.id)
    if (!plan) return res.status(404).json({ message: 'Plan not found' })
    const member = plan.members.find((m) => m.userId?.toString() === req.userId)
    const isOwner = plan.ownerId.toString() === req.userId
    if (!isOwner && (!member || !member.permissions.editVault)) {
      return res.status(403).json({ message: 'Edit permission required' })
    }
    plan.sharedVault.push({ ...req.body, uploadedBy: req.userId })
    await plan.save()
    res.status(201).json(plan.sharedVault[plan.sharedVault.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add timeline event
router.post('/:id/timeline', authMiddleware, async (req, res) => {
  try {
    const plan = await FamilyPlan.findById(req.params.id)
    if (!plan) return res.status(404).json({ message: 'Plan not found' })
    plan.sharedTimeline.push({ ...req.body, addedBy: req.userId })
    await plan.save()
    res.status(201).json(plan.sharedTimeline[plan.sharedTimeline.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
