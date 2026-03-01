import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import BiographyProject from '../models/BiographyProject.js'

const router = express.Router()

// List projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await BiographyProject.find({ userId: req.userId })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const project = new BiographyProject({ ...req.body, userId: req.userId })
    await project.save()
    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get project
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await BiographyProject.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add media asset
router.post('/:id/media', authMiddleware, async (req, res) => {
  try {
    const project = await BiographyProject.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    project.mediaAssets.push(req.body)
    await project.save()
    res.status(201).json(project.mediaAssets[project.mediaAssets.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add timeline entry
router.post('/:id/timeline', authMiddleware, async (req, res) => {
  try {
    const project = await BiographyProject.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    project.timeline.push(req.body)
    project.timeline.sort((a, b) => (a.year !== b.year ? a.year - b.year : (a.month || 0) - (b.month || 0)))
    await project.save()
    res.status(201).json(project.timeline)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Generate autobiography (simulated)
router.post('/:id/generate', authMiddleware, async (req, res) => {
  try {
    const project = await BiographyProject.findOne({
      _id: req.params.id,
      userId: req.userId
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    project.status = 'processing'
    // Simulated output – in production this calls the AI service
    project.autobiographyOutput = {
      text: `This is the auto-generated biography for "${project.title}". Based on ${project.timeline.length} life events and ${project.mediaAssets.length} media assets, the AI has composed a narrative covering major milestones.`,
      generatedAt: new Date(),
      format: req.body.format || 'web'
    }
    project.status = 'complete'
    await project.save()
    res.json(project.autobiographyOutput)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
