import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

// Search users
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query

    const users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      _id: { $ne: req.userId }
    }).limit(20)

    res.json(users.map((u) => u.toJSON()))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user.toJSON())
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, bio, profilePhoto } = req.body

    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, bio, profilePhoto },
      { new: true }
    )

    res.json(user.toJSON())
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
