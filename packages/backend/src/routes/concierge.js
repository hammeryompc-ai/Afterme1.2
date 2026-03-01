import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import DocumentVault from '../models/DocumentVault.js'

const router = express.Router()

const getOrCreateVault = async (userId) => {
  let vault = await DocumentVault.findOne({ userId })
  if (!vault) {
    vault = new DocumentVault({ userId })
    await vault.save()
  }
  return vault
}

// Get vault
router.get('/', authMiddleware, async (req, res) => {
  try {
    const vault = await getOrCreateVault(req.userId)
    res.json(vault)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add document
router.post('/documents', authMiddleware, async (req, res) => {
  try {
    const vault = await getOrCreateVault(req.userId)
    vault.documents.push(req.body)
    await vault.save()
    res.status(201).json(vault.documents[vault.documents.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete document
router.delete('/documents/:docId', authMiddleware, async (req, res) => {
  try {
    const vault = await DocumentVault.findOne({ userId: req.userId })
    if (!vault) return res.status(404).json({ message: 'Vault not found' })
    vault.documents = vault.documents.filter(
      (d) => d._id.toString() !== req.params.docId
    )
    await vault.save()
    res.json({ message: 'Document removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add task
router.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const vault = await getOrCreateVault(req.userId)
    vault.tasks.push(req.body)
    await vault.save()
    res.status(201).json(vault.tasks[vault.tasks.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update task
router.put('/tasks/:taskId', authMiddleware, async (req, res) => {
  try {
    const vault = await DocumentVault.findOne({ userId: req.userId })
    if (!vault) return res.status(404).json({ message: 'Vault not found' })
    const task = vault.tasks.id(req.params.taskId)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    Object.assign(task, req.body)
    if (req.body.completed && !task.completedAt) task.completedAt = new Date()
    await vault.save()
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add executor
router.post('/executors', authMiddleware, async (req, res) => {
  try {
    const vault = await getOrCreateVault(req.userId)
    vault.executors.push(req.body)
    await vault.save()
    res.status(201).json(vault.executors[vault.executors.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add password entry
router.post('/passwords', authMiddleware, async (req, res) => {
  try {
    const vault = await getOrCreateVault(req.userId)
    vault.passwords.push(req.body)
    await vault.save()
    res.status(201).json({ message: 'Password entry saved' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add scheduled event
router.post('/schedule', authMiddleware, async (req, res) => {
  try {
    const vault = await getOrCreateVault(req.userId)
    vault.scheduledEvents.push(req.body)
    await vault.save()
    res.status(201).json(vault.scheduledEvents[vault.scheduledEvents.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
