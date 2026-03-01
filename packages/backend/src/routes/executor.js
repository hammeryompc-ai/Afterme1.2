import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import ProbateCase from '../models/ProbateCase.js'

const router = express.Router()

// List cases
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cases = await ProbateCase.find({ userId: req.userId })
    res.json(cases)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create case
router.post('/', authMiddleware, async (req, res) => {
  try {
    const probateCase = new ProbateCase({
      ...req.body,
      userId: req.userId,
      steps: req.body.steps || defaultSteps()
    })
    await probateCase.save()
    res.status(201).json(probateCase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get case
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const probateCase = await ProbateCase.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!probateCase) return res.status(404).json({ message: 'Case not found' })
    res.json(probateCase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update case step
router.put('/:id/steps/:stepId', authMiddleware, async (req, res) => {
  try {
    const probateCase = await ProbateCase.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!probateCase) return res.status(404).json({ message: 'Case not found' })
    const step = probateCase.steps.id(req.params.stepId)
    if (!step) return res.status(404).json({ message: 'Step not found' })
    Object.assign(step, req.body)
    if (req.body.status === 'complete' && !step.completedAt) {
      step.completedAt = new Date()
    }
    await probateCase.save()
    res.json(step)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add beneficiary
router.post('/:id/beneficiaries', authMiddleware, async (req, res) => {
  try {
    const probateCase = await ProbateCase.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!probateCase) return res.status(404).json({ message: 'Case not found' })
    probateCase.beneficiaries.push(req.body)
    await probateCase.save()
    res.status(201).json(probateCase.beneficiaries[probateCase.beneficiaries.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Generate form (simulated)
router.post('/:id/forms', authMiddleware, async (req, res) => {
  try {
    const probateCase = await ProbateCase.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!probateCase) return res.status(404).json({ message: 'Case not found' })

    const allowedFormTypes = [
      'petition_for_probate',
      'notice_to_creditors',
      'inventory_of_estate',
      'final_accounting',
      'distribution_order'
    ]
    const formType = req.body.formType
    if (!allowedFormTypes.includes(formType)) {
      return res.status(400).json({ message: 'Invalid form type' })
    }

    const form = {
      formType,
      title: req.body.title || `${formType.replace(/_/g, ' ')} Form`,
      fileUrl: `forms/${probateCase._id}/${formType}-${Date.now()}.pdf`,
      generatedAt: new Date()
    }
    probateCase.generatedForms.push(form)
    await probateCase.save()
    res.status(201).json(probateCase.generatedForms[probateCase.generatedForms.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add evidence
router.post('/:id/evidence', authMiddleware, async (req, res) => {
  try {
    const probateCase = await ProbateCase.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!probateCase) return res.status(404).json({ message: 'Case not found' })
    probateCase.evidenceVault.push(req.body)
    await probateCase.save()
    res.status(201).json(probateCase.evidenceVault[probateCase.evidenceVault.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Send communication
router.post('/:id/communications', authMiddleware, async (req, res) => {
  try {
    const probateCase = await ProbateCase.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!probateCase) return res.status(404).json({ message: 'Case not found' })
    const communication = { ...req.body, sentAt: new Date() }
    probateCase.communicationTemplates.push(communication)
    await probateCase.save()
    res.status(201).json(communication)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

function defaultSteps() {
  return [
    { order: 1, title: 'Locate and File the Will', description: 'Find the original will and file it with the probate court.' },
    { order: 2, title: 'Petition for Probate', description: 'File a petition to open the probate case.' },
    { order: 3, title: 'Notify Beneficiaries & Creditors', description: 'Send legal notices to all parties.' },
    { order: 4, title: 'Inventory Estate Assets', description: 'Compile a complete inventory of all assets.' },
    { order: 5, title: 'Pay Debts & Taxes', description: 'Settle outstanding debts and estate taxes.' },
    { order: 6, title: 'Distribute Assets', description: 'Transfer assets to beneficiaries per the will.' },
    { order: 7, title: 'Close the Estate', description: 'File final accounting and close the case.' }
  ]
}

export default router
