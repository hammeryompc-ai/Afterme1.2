import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import User from '../models/User.js'
import Document from '../models/Document.js'
import JournalEntry from '../models/JournalEntry.js'
import TimeCapsule from '../models/TimeCapsule.js'
import EstateCase from '../models/EstateCase.js'

const router = express.Router()

// ── Multi-tenant / Organization overview ──────────────────────────────────────

// Get the organization profile for the current user (nonprofit / gov lane)
router.get('/org', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('orgProfile')
    res.json(user?.orgProfile || null)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create / update organization profile
router.put('/org', authMiddleware, async (req, res) => {
  try {
    const {
      orgName,
      orgType,
      ein,
      contactEmail,
      programDescription,
      consentFramework
    } = req.body

    const user = await User.findByIdAndUpdate(
      req.userId,
      { orgProfile: { orgName, orgType, ein, contactEmail, programDescription, consentFramework } },
      { new: true }
    )
    res.json(user.orgProfile)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ── Grant reporting ───────────────────────────────────────────────────────────

// Get program dashboard metrics (placeholder — in production query real analytics)
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user?.orgProfile?.orgName) {
      return res.status(403).json({ message: 'Organization profile required' })
    }

    // In production: pull metrics scoped to the organisation's tenant
    const [totalUsers, activeUsers, documentsVaulted, timeCapsulesSent, journalEntries, estateCasesOpened] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isOnline: true }),
        Document.countDocuments({ isArchived: false }),
        TimeCapsule.countDocuments({ isDelivered: true }),
        JournalEntry.countDocuments(),
        EstateCase.countDocuments()
      ])

    res.json({
      organization: user.orgProfile.orgName,
      metrics: {
        totalUsers,
        activeUsers,
        documentsVaulted,
        timeCapsulesSent,
        journalEntries,
        estateCasesOpened
      },
      reportGeneratedAt: new Date()
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Generate grant report (PDF generation would happen in production)
router.post('/grant-report', authMiddleware, async (req, res) => {
  try {
    const { grantName, reportingPeriodStart, reportingPeriodEnd } = req.body
    const user = await User.findById(req.userId)

    if (!user?.orgProfile?.orgName) {
      return res.status(403).json({ message: 'Organization profile required' })
    }

    // In production: generate real PDF report
    res.json({
      reportId: `RPT-${Date.now()}`,
      organization: user.orgProfile.orgName,
      grantName,
      reportingPeriodStart,
      reportingPeriodEnd,
      status: 'generated',
      downloadUrl: null, // Would be a signed S3 URL in production
      generatedAt: new Date()
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ── Consent Framework ─────────────────────────────────────────────────────────

// Record a user consent event
router.post('/consent', authMiddleware, async (req, res) => {
  try {
    const { consentType, consentText, accepted } = req.body

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          consentLog: {
            consentType,
            consentText,
            accepted,
            recordedAt: new Date(),
            ipAddress: req.ip
          }
        }
      },
      { new: true }
    )

    res.json({ message: 'Consent recorded', userId: user._id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get consent log for the user
router.get('/consent', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('consentLog')
    res.json(user?.consentLog || [])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
