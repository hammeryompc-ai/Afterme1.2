import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import BankPartnership from '../models/BankPartnership.js'

const router = express.Router()

// List partnerships
router.get('/', authMiddleware, async (req, res) => {
  try {
    const partnerships = await BankPartnership.find({ userId: req.userId })
    res.json(partnerships)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create partnership request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const partnership = new BankPartnership({ ...req.body, userId: req.userId })
    partnership.auditLogs.push({
      action: 'partnership_created',
      performedBy: req.userId,
      details: { partnerName: req.body.partnerName }
    })
    await partnership.save()
    res.status(201).json(partnership)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get partnership
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const partnership = await BankPartnership.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!partnership) return res.status(404).json({ message: 'Partnership not found' })
    res.json(partnership)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Submit verification document
router.post('/:id/verify', authMiddleware, async (req, res) => {
  try {
    const partnership = await BankPartnership.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!partnership) return res.status(404).json({ message: 'Partnership not found' })
    partnership.verificationDocuments.push(req.body)
    partnership.verificationStatus = 'in_review'
    partnership.auditLogs.push({
      action: 'verification_submitted',
      performedBy: req.userId,
      details: req.body
    })
    await partnership.save()
    res.json({ message: 'Verification document submitted', status: partnership.verificationStatus })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Initiate estate transfer
router.post('/:id/transfers', authMiddleware, async (req, res) => {
  try {
    const partnership = await BankPartnership.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!partnership) return res.status(404).json({ message: 'Partnership not found' })
    const transfer = { ...req.body, initiatedAt: new Date() }
    partnership.estateTransfers.push(transfer)
    partnership.auditLogs.push({
      action: 'estate_transfer_initiated',
      performedBy: req.userId,
      details: req.body
    })
    await partnership.save()
    res.status(201).json(partnership.estateTransfers[partnership.estateTransfers.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get audit log
router.get('/:id/audit', authMiddleware, async (req, res) => {
  try {
    const partnership = await BankPartnership.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!partnership) return res.status(404).json({ message: 'Partnership not found' })
    res.json(partnership.auditLogs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
