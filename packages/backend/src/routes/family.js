import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import FamilyPlan from '../models/FamilyPlan.js'
import User from '../models/User.js'

const router = express.Router()

// Get the family plan the user belongs to (or owns)
router.get('/plan', authMiddleware, async (req, res) => {
  try {
    const plan = await FamilyPlan.findOne({
      $or: [
        { ownerId: req.userId },
        { 'members.userId': req.userId }
      ],
      isActive: true
    }).populate('members.userId', 'firstName lastName email profilePhoto')
    res.json(plan || null)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new family plan
router.post('/plan', authMiddleware, async (req, res) => {
  try {
    const { name, planType, subscriptionTier } = req.body

    const existing = await FamilyPlan.findOne({
      ownerId: req.userId,
      isActive: true
    })
    if (existing) {
      return res.status(400).json({ message: 'You already have an active family plan' })
    }

    const plan = new FamilyPlan({
      ownerId: req.userId,
      name,
      planType,
      subscriptionTier,
      members: [
        {
          userId: req.userId,
          role: 'owner',
          permissions: {
            canEditVault: true,
            canViewTimeline: true,
            canAddMemories: true,
            canManageMembers: true
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

// Invite a member to the family plan
router.post('/plan/invite', authMiddleware, async (req, res) => {
  try {
    const { email, role } = req.body

    const plan = await FamilyPlan.findOne({ ownerId: req.userId, isActive: true })
    if (!plan) return res.status(404).json({ message: 'No active family plan found' })

    const invitedUser = await User.findOne({ email: email.toLowerCase() })
    if (!invitedUser) {
      return res.status(404).json({ message: 'User not found. They need to create an account first.' })
    }

    const alreadyMember = plan.members.some(
      (m) => m.userId.toString() === invitedUser._id.toString()
    )
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' })
    }

    plan.members.push({
      userId: invitedUser._id,
      role: role || 'member'
    })
    await plan.save()

    res.json({ message: 'Member added', plan })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update member permissions
router.put('/plan/members/:memberId', authMiddleware, async (req, res) => {
  try {
    const plan = await FamilyPlan.findOne({ ownerId: req.userId, isActive: true })
    if (!plan) return res.status(404).json({ message: 'No active family plan found' })

    const member = plan.members.find((m) => m.userId.toString() === req.params.memberId)
    if (!member) return res.status(404).json({ message: 'Member not found' })

    Object.assign(member, req.body)
    await plan.save()
    res.json(plan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Remove a member from the plan
router.delete('/plan/members/:memberId', authMiddleware, async (req, res) => {
  try {
    const plan = await FamilyPlan.findOne({ ownerId: req.userId, isActive: true })
    if (!plan) return res.status(404).json({ message: 'No active family plan found' })

    plan.members = plan.members.filter(
      (m) => m.userId.toString() !== req.params.memberId
    )
    await plan.save()
    res.json({ message: 'Member removed', plan })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update plan settings
router.put('/plan', authMiddleware, async (req, res) => {
  try {
    const plan = await FamilyPlan.findOneAndUpdate(
      { ownerId: req.userId, isActive: true },
      req.body,
      { new: true }
    )
    if (!plan) return res.status(404).json({ message: 'No active family plan found' })
    res.json(plan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
