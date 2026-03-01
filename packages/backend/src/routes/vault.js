import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import Document from '../models/Document.js'
import Task from '../models/Task.js'
import TrustedContact from '../models/TrustedContact.js'

const router = express.Router()

// ── Document Vault ────────────────────────────────────────────────────────────

// List all documents for the authenticated user
router.get('/documents', authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.userId,
      isArchived: false
    }).sort({ createdAt: -1 })
    res.json(documents)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new document entry
router.post('/documents', authMiddleware, async (req, res) => {
  try {
    const { title, category, description, fileUrl, fileName, mimeType, releaseCondition, releaseDate } = req.body
    const doc = new Document({
      userId: req.userId,
      title,
      category,
      description,
      fileUrl,
      fileName,
      mimeType,
      releaseCondition,
      releaseDate
    })
    await doc.save()
    res.status(201).json(doc)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update a document
router.put('/documents/:id', authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    )
    if (!doc) return res.status(404).json({ message: 'Document not found' })
    res.json(doc)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete (archive) a document
router.delete('/documents/:id', authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isArchived: true },
      { new: true }
    )
    if (!doc) return res.status(404).json({ message: 'Document not found' })
    res.json({ message: 'Document archived' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ── Password Vault ────────────────────────────────────────────────────────────

// List password entries
router.get('/passwords', authMiddleware, async (req, res) => {
  try {
    const passwords = await Document.find({
      userId: req.userId,
      category: 'password',
      isArchived: false
    }).sort({ createdAt: -1 })
    res.json(passwords)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a password entry
router.post('/passwords', authMiddleware, async (req, res) => {
  try {
    const { service, username, encryptedPassword, url } = req.body
    const entry = new Document({
      userId: req.userId,
      title: service,
      category: 'password',
      passwordEntry: { service, username, encryptedPassword, url }
    })
    await entry.save()
    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ── Task Workflows ────────────────────────────────────────────────────────────

// List tasks
router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create task
router.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const task = new Task({ userId: req.userId, ...req.body })
    await task.save()
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update task status
router.put('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    )
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete task
router.delete('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ── Trusted Contacts / Executor Collaboration ─────────────────────────────────

// List trusted contacts
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const contacts = await TrustedContact.find({ userId: req.userId })
    res.json(contacts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add trusted contact
router.post('/contacts', authMiddleware, async (req, res) => {
  try {
    const contact = new TrustedContact({ userId: req.userId, ...req.body })
    await contact.save()
    res.status(201).json(contact)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update trusted contact
router.put('/contacts/:id', authMiddleware, async (req, res) => {
  try {
    // Only allow specific fields to be updated to avoid NoSQL injection via operators
    const allowedFields = ['name', 'email', 'phone', 'relationship', 'notes']
    const updateData = {}
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field]
      }
    }

    const contact = await TrustedContact.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true }
    )
    if (!contact) return res.status(404).json({ message: 'Contact not found' })
    res.json(contact)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Remove trusted contact
router.delete('/contacts/:id', authMiddleware, async (req, res) => {
  try {
    await TrustedContact.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Contact removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
