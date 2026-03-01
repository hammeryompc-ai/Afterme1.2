import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import EstateCase from '../models/EstateCase.js'
import User from '../models/User.js'

const router = express.Router()

const DEFAULT_PROBATE_STEPS = [
  { stepNumber: 1, title: 'File Death Certificate', description: 'Obtain official death certificate from relevant authority.' },
  { stepNumber: 2, title: 'Locate the Will', description: 'Find and validate the last will and testament.' },
  { stepNumber: 3, title: 'Notify Beneficiaries', description: 'Formally notify all named beneficiaries.' },
  { stepNumber: 4, title: 'Inventory Assets', description: "Compile a full inventory of the estate's assets and liabilities." },
  { stepNumber: 5, title: 'Settle Debts', description: 'Pay outstanding debts and taxes from the estate.' },
  { stepNumber: 6, title: 'File Probate Petition', description: 'Submit probate petition to the appropriate court.' },
  { stepNumber: 7, title: 'Distribute Assets', description: 'Distribute remaining assets to beneficiaries per the will.' },
  { stepNumber: 8, title: 'Close the Estate', description: 'File final accounting and close the estate.' }
]

// List estate cases where user is executor
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cases = await EstateCase.find({ executorId: req.userId })
      .populate('deceasedUserId', 'firstName lastName email')
      .sort({ createdAt: -1 })
    res.json(cases)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get a specific case
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const estateCase = await EstateCase.findOne({
      _id: req.params.id,
      executorId: req.userId
    }).populate('deceasedUserId', 'firstName lastName email')
    if (!estateCase) return res.status(404).json({ message: 'Case not found' })
    res.json(estateCase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Open a new estate case
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { deceasedEmail, beneficiaries } = req.body

    const deceased = await User.findOne({ email: deceasedEmail?.toLowerCase() })
    if (!deceased) {
      return res.status(404).json({ message: 'Deceased user account not found' })
    }

    const estateCase = new EstateCase({
      deceasedUserId: deceased._id,
      executorId: req.userId,
      beneficiaries: beneficiaries || [],
      steps: DEFAULT_PROBATE_STEPS.map((s) => ({ ...s, status: 'pending' }))
    })
    await estateCase.save()
    res.status(201).json(estateCase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update a probate step
router.put('/:id/steps/:stepNumber', authMiddleware, async (req, res) => {
  try {
    const estateCase = await EstateCase.findOne({ _id: req.params.id, executorId: req.userId })
    if (!estateCase) return res.status(404).json({ message: 'Case not found' })

    const step = estateCase.steps.find((s) => s.stepNumber === Number(req.params.stepNumber))
    if (!step) return res.status(404).json({ message: 'Step not found' })

    Object.assign(step, req.body)
    if (req.body.status === 'completed' && !step.completedAt) {
      step.completedAt = new Date()
    }
    await estateCase.save()
    res.json(estateCase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a beneficiary
router.post('/:id/beneficiaries', authMiddleware, async (req, res) => {
  try {
    const estateCase = await EstateCase.findOne({ _id: req.params.id, executorId: req.userId })
    if (!estateCase) return res.status(404).json({ message: 'Case not found' })

    estateCase.beneficiaries.push(req.body)
    await estateCase.save()
    res.status(201).json(estateCase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update beneficiary status
router.put('/:id/beneficiaries/:beneficiaryId', authMiddleware, async (req, res) => {
  try {
    const estateCase = await EstateCase.findOne({ _id: req.params.id, executorId: req.userId })
    if (!estateCase) return res.status(404).json({ message: 'Case not found' })

    const ben = estateCase.beneficiaries.id(req.params.beneficiaryId)
    if (!ben) return res.status(404).json({ message: 'Beneficiary not found' })

    Object.assign(ben, req.body)
    await estateCase.save()
    res.json(estateCase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add evidence document
router.post('/:id/evidence', authMiddleware, async (req, res) => {
  try {
    const estateCase = await EstateCase.findOne({ _id: req.params.id, executorId: req.userId })
    if (!estateCase) return res.status(404).json({ message: 'Case not found' })

    estateCase.evidenceDocuments.push({ ...req.body, uploadedBy: req.userId })
    await estateCase.save()
    res.status(201).json(estateCase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Log a communication
router.post('/:id/communications', authMiddleware, async (req, res) => {
  try {
    const estateCase = await EstateCase.findOne({ _id: req.params.id, executorId: req.userId })
    if (!estateCase) return res.status(404).json({ message: 'Case not found' })

    estateCase.communicationLog.push({ ...req.body, sentBy: req.userId })
    await estateCase.save()
    res.status(201).json(estateCase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Close case
router.put('/:id/close', authMiddleware, async (req, res) => {
  try {
    const estateCase = await EstateCase.findOneAndUpdate(
      { _id: req.params.id, executorId: req.userId },
      { caseStatus: 'closed', closedAt: new Date() },
      { new: true }
    )
    if (!estateCase) return res.status(404).json({ message: 'Case not found' })
    res.json(estateCase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
