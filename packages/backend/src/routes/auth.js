import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'
import { createToken } from '../middleware/auth.js'

const router = express.Router()

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName
    })

    await user.save()
    const token = createToken(user._id)

    res.status(201).json({
      token,
      user: user.toJSON()
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValid = await user.comparePassword(password)
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = createToken(user._id)

    res.json({
      token,
      user: user.toJSON()
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    res.json(user.toJSON())
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
