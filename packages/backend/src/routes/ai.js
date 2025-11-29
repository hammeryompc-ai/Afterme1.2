import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'
import AITrainingData from '../models/AITrainingData.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Start personality training
router.post('/personality/start', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    user.personalityProfile = {
      traits: [],
      trainingProgress: 0,
      trained: false
    }
    await user.save()

    res.json({
      message: 'Personality training started',
      profile: user.personalityProfile
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Submit personality training data
router.post('/personality/train', authMiddleware, async (req, res) => {
  try {
    const { dataPoints } = req.body

    // Save training data
    for (const point of dataPoints) {
      const trainingData = new AITrainingData({
        userId: req.userId,
        type: 'text_sample',
        data: { text: point }
      })
      await trainingData.save()
    }

    const user = await User.findById(req.userId)

    // Simulate AI learning (in production, this would call AI service)
    user.personalityProfile.trainingProgress = Math.min(
      100,
      user.personalityProfile.trainingProgress + 25
    )

    if (user.personalityProfile.trainingProgress >= 100) {
      user.personalityProfile.trained = true
      user.personalityProfile.traits = [
        'Friendly',
        'Thoughtful',
        'Creative',
        'Empathetic'
      ]
    }

    await user.save()

    res.json({
      progress: user.personalityProfile.trainingProgress,
      profile: user.personalityProfile
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get personality profile
router.get('/personality/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user.personalityProfile.trained) {
      return res.status(404).json({ message: 'Profile not trained yet' })
    }

    res.json(user.personalityProfile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Start voice cloning
router.post('/voice/start', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    user.voiceClone = {
      trained: false,
      samples: [],
      modelPath: null
    }
    await user.save()

    res.json({ message: 'Voice cloning started' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Upload voice sample
router.post('/voice/upload', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    // Simulate voice storage (in production, upload to cloud storage)
    const voicePath = `voices/${user._id}/${uuidv4()}.webm`

    const trainingData = new AITrainingData({
      userId: req.userId,
      type: 'voice',
      audioUrl: voicePath
    })
    await trainingData.save()

    user.voiceClone.samples.push(voicePath)

    if (user.voiceClone.samples.length >= 3) {
      user.voiceClone.trained = true
      user.voiceClone.modelPath = `voice-models/${user._id}`
    }

    await user.save()

    res.json({
      message: 'Voice sample uploaded',
      sampleCount: user.voiceClone.samples.length,
      trained: user.voiceClone.trained
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Memorialize profile
router.post('/memorialization/activate', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (!user.personalityProfile.trained || !user.voiceClone.trained) {
      return res.status(400).json({
        message: 'Both personality and voice must be trained first'
      })
    }

    user.isMemorialized = true
    user.memorializedAt = new Date()
    await user.save()

    res.json({
      message: 'Profile memorialized successfully',
      isMemorialized: true
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Interact with AI legacy
router.post('/legacy/chat', async (req, res) => {
  try {
    const { userId, message } = req.body

    const user = await User.findById(userId)
    if (!user?.isMemorialized) {
      return res.status(404).json({ message: 'Legacy profile not found' })
    }

    // In production, call actual AI model for response
    const aiResponse = `I remember that... Thank you for thinking of me. [AI response from ${user.firstName}]`
    const voiceUrl = `legacy-voices/${user._id}/${uuidv4()}.webm`

    res.json({
      response: aiResponse,
      voiceUrl: voiceUrl,
      from: user.firstName
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
