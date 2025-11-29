import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import User from '../models/User.js'

const router = express.Router()

// Get all conversations for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })

    res.json(conversations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create conversation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { participantIds } = req.body
    const allParticipants = [req.userId, ...participantIds]

    let conversation = await Conversation.findOne({
      participants: {
        $all: allParticipants,
        $size: allParticipants.length
      }
    })

    if (!conversation) {
      conversation = new Conversation({
        participants: allParticipants
      })
      await conversation.save()
    }

    conversation = await conversation.populate('participants', '-password')
    res.status(201).json(conversation)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get messages for conversation
router.get('/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
      .populate('senderId', '-password')
      .sort({ createdAt: 1 })

    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Send message
router.post('/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const { content, type } = req.body

    const message = new Message({
      conversationId: req.params.conversationId,
      senderId: req.userId,
      content,
      type
    })

    await message.save()
    await message.populate('senderId', '-password')

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      lastMessage: message._id
    })

    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Mark conversation as read
router.put('/:conversationId/read', authMiddleware, async (req, res) => {
  try {
    await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        senderId: { $ne: req.userId },
        read: false
      },
      { read: true, readAt: new Date() }
    )

    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      [`unreadCounts.${req.userId}`]: 0
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
