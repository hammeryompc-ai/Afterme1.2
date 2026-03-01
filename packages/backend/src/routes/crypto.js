import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import CryptoInheritance from '../models/CryptoInheritance.js'

const router = express.Router()

// List crypto inheritance entries for the user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const entries = await CryptoInheritance.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(entries)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get a single entry
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await CryptoInheritance.findOne({ _id: req.params.id, userId: req.userId })
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new crypto inheritance entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      walletLabel,
      walletType,
      walletAddress,
      multiSigConfig,
      triggerCondition,
      inactivityDays,
      beneficiaryEmail,
      beneficiaryShare,
      notes
    } = req.body

    const entry = new CryptoInheritance({
      userId: req.userId,
      walletLabel,
      walletType,
      walletAddress,
      multiSigConfig,
      triggerCondition,
      inactivityDays,
      beneficiaryEmail,
      beneficiaryShare,
      notes
    })
    await entry.save()
    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update an entry
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      walletLabel,
      walletType,
      walletAddress,
      multiSigConfig,
      triggerCondition,
      inactivityDays,
      beneficiaryEmail,
      beneficiaryShare,
      notes
    } = req.body

    const updateData = {}
    if (walletLabel !== undefined) updateData.walletLabel = walletLabel
    if (walletType !== undefined) updateData.walletType = walletType
    if (walletAddress !== undefined) updateData.walletAddress = walletAddress
    if (multiSigConfig !== undefined) updateData.multiSigConfig = multiSigConfig
    if (triggerCondition !== undefined) updateData.triggerCondition = triggerCondition
    if (inactivityDays !== undefined) updateData.inactivityDays = inactivityDays
    if (beneficiaryEmail !== undefined) updateData.beneficiaryEmail = beneficiaryEmail
    if (beneficiaryShare !== undefined) updateData.beneficiaryShare = beneficiaryShare
    if (notes !== undefined) updateData.notes = notes

    const entry = await CryptoInheritance.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    )
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete an entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await CryptoInheritance.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Entry deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add / confirm a recovery shard holder
router.post('/:id/shards', authMiddleware, async (req, res) => {
  try {
    const entry = await CryptoInheritance.findOne({ _id: req.params.id, userId: req.userId })
    if (!entry) return res.status(404).json({ message: 'Entry not found' })

    const { shardIndex, holderEmail, encryptedShardRef } = req.body
    entry.recoveryShards.push({ shardIndex, holderEmail, encryptedShardRef })
    await entry.save()
    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Confirm a shard (called by the shard holder)
router.put('/:id/shards/:shardId/confirm', authMiddleware, async (req, res) => {
  try {
    const entry = await CryptoInheritance.findById(req.params.id)
    if (!entry) return res.status(404).json({ message: 'Entry not found' })

    const shard = entry.recoveryShards.id(req.params.shardId)
    if (!shard) return res.status(404).json({ message: 'Shard not found' })

    shard.isConfirmed = true
    shard.holderId = req.userId
    await entry.save()
    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
