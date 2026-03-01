import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import CryptoInheritance from '../models/CryptoInheritance.js'

const router = express.Router()

const getOrCreate = async (userId) => {
  let record = await CryptoInheritance.findOne({ userId })
  if (!record) {
    record = new CryptoInheritance({ userId })
    await record.save()
  }
  return record
}

// Get crypto inheritance setup
router.get('/', authMiddleware, async (req, res) => {
  try {
    const record = await getOrCreate(req.userId)
    // Never expose encryptedKeyShare in list response
    const safe = record.toObject()
    safe.wallets = safe.wallets.map(({ encryptedKeyShare: _, ...w }) => w)
    res.json(safe)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add wallet
router.post('/wallets', authMiddleware, async (req, res) => {
  try {
    const record = await getOrCreate(req.userId)
    record.wallets.push(req.body)
    await record.save()
    const wallet = record.wallets[record.wallets.length - 1].toObject()
    delete wallet.encryptedKeyShare
    res.status(201).json(wallet)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add recovery mechanism
router.post('/recovery', authMiddleware, async (req, res) => {
  try {
    const record = await getOrCreate(req.userId)
    record.recoveryMechanisms.push(req.body)
    await record.save()
    res.status(201).json(record.recoveryMechanisms[record.recoveryMechanisms.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add inheritance trigger
router.post('/triggers', authMiddleware, async (req, res) => {
  try {
    const record = await getOrCreate(req.userId)
    record.inheritanceTriggers.push(req.body)
    await record.save()
    res.status(201).json(record.inheritanceTriggers[record.inheritanceTriggers.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Activate record
router.put('/activate', authMiddleware, async (req, res) => {
  try {
    const record = await getOrCreate(req.userId)
    if (record.wallets.length === 0) {
      return res.status(400).json({ message: 'Add at least one wallet before activating' })
    }
    record.status = 'active'
    await record.save()
    res.json({ status: record.status })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
