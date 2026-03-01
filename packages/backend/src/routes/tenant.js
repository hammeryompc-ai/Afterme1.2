import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import TenantOrganization from '../models/TenantOrganization.js'

const router = express.Router()

// List organizations for admin
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orgs = await TenantOrganization.find({
      $or: [
        { adminUserId: req.userId },
        { 'members.userId': req.userId }
      ]
    })
    res.json(orgs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create organization
router.post('/', authMiddleware, async (req, res) => {
  try {
    const org = new TenantOrganization({
      ...req.body,
      adminUserId: req.userId,
      members: [{ userId: req.userId, role: 'admin' }]
    })
    await org.save()
    res.status(201).json(org)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get organization
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const org = await TenantOrganization.findById(req.params.id)
    if (!org) return res.status(404).json({ message: 'Organization not found' })
    const isMember =
      org.adminUserId.toString() === req.userId ||
      org.members.some((m) => m.userId?.toString() === req.userId)
    if (!isMember) return res.status(403).json({ message: 'Access denied' })
    res.json(org)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add member
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const org = await TenantOrganization.findOne({
      _id: req.params.id,
      adminUserId: req.userId
    })
    if (!org) return res.status(404).json({ message: 'Organization not found or not authorized' })
    org.members.push(req.body)
    await org.save()
    res.status(201).json(org.members[org.members.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add program
router.post('/:id/programs', authMiddleware, async (req, res) => {
  try {
    const org = await TenantOrganization.findById(req.params.id)
    if (!org) return res.status(404).json({ message: 'Organization not found' })
    org.programs.push(req.body)
    await org.save()
    res.status(201).json(org.programs[org.programs.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Submit grant report
router.post('/:id/reports', authMiddleware, async (req, res) => {
  try {
    const org = await TenantOrganization.findById(req.params.id)
    if (!org) return res.status(404).json({ message: 'Organization not found' })
    org.grantReports.push({ ...req.body, submittedAt: new Date() })
    await org.save()
    res.status(201).json(org.grantReports[org.grantReports.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Record consent
router.post('/:id/consent', authMiddleware, async (req, res) => {
  try {
    const org = await TenantOrganization.findById(req.params.id)
    if (!org) return res.status(404).json({ message: 'Organization not found' })
    org.consentFramework.consentsRecorded.push({
      userId: req.userId,
      consentedAt: new Date(),
      version: org.consentFramework.consentVersion,
      ipAddress: req.ip
    })
    await org.save()
    res.json({ message: 'Consent recorded' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
