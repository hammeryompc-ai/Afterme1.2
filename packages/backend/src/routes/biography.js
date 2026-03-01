import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import Biography from '../models/Biography.js'

const router = express.Router()

// Get biography for current user (or create empty one)
router.get('/', authMiddleware, async (req, res) => {
  try {
    let bio = await Biography.findOne({ userId: req.userId })
    if (!bio) {
      bio = new Biography({ userId: req.userId, timelineEntries: [], mediaItems: [] })
      await bio.save()
    }
    res.json(bio)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add a timeline entry
router.post('/timeline', authMiddleware, async (req, res) => {
  try {
    const bio = await Biography.findOne({ userId: req.userId })
    if (!bio) return res.status(404).json({ message: 'Biography not found' })

    bio.timelineEntries.push(req.body)
    bio.timelineEntries.sort((a, b) => {
      const yearDiff = (a.year || 0) - (b.year || 0)
      return yearDiff !== 0 ? yearDiff : (a.month || 0) - (b.month || 0)
    })
    await bio.save()
    res.status(201).json(bio)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update a timeline entry
router.put('/timeline/:entryId', authMiddleware, async (req, res) => {
  try {
    const bio = await Biography.findOne({ userId: req.userId })
    if (!bio) return res.status(404).json({ message: 'Biography not found' })

    const entry = bio.timelineEntries.id(req.params.entryId)
    if (!entry) return res.status(404).json({ message: 'Timeline entry not found' })

    Object.assign(entry, req.body)
    await bio.save()
    res.json(bio)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete a timeline entry
router.delete('/timeline/:entryId', authMiddleware, async (req, res) => {
  try {
    const bio = await Biography.findOne({ userId: req.userId })
    if (!bio) return res.status(404).json({ message: 'Biography not found' })

    bio.timelineEntries = bio.timelineEntries.filter(
      (e) => e._id.toString() !== req.params.entryId
    )
    await bio.save()
    res.json({ message: 'Timeline entry removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Ingest a media item (photo, video, audio, document)
router.post('/media', authMiddleware, async (req, res) => {
  try {
    const bio = await Biography.findOne({ userId: req.userId })
    if (!bio) return res.status(404).json({ message: 'Biography not found' })

    bio.mediaItems.push({ ...req.body, processedAt: new Date() })
    await bio.save()
    res.status(201).json(bio)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Generate AI autobiography draft
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const bio = await Biography.findOne({ userId: req.userId })
    if (!bio) return res.status(404).json({ message: 'Biography not found' })

    if (bio.timelineEntries.length === 0) {
      return res.status(400).json({ message: 'Add timeline entries before generating your autobiography' })
    }

    // TODO: In production, call the AI service with the timeline entries
    // and any media transcriptions to generate a personalised autobiography.
    const draft = bio.timelineEntries
      .map((e) => `In ${e.year || 'an unknown year'}: ${e.title || ''} — ${e.description || ''}`)
      .join('\n\n')

    bio.autobiographyDraft = `[AI-Generated Autobiography Draft]\n\n${draft}`
    bio.autobiographyGeneratedAt = new Date()
    await bio.save()

    res.json({ draft: bio.autobiographyDraft, generatedAt: bio.autobiographyGeneratedAt })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update publish status
router.put('/publish', authMiddleware, async (req, res) => {
  try {
    const { publishStatus } = req.body
    const bio = await Biography.findOneAndUpdate(
      { userId: req.userId },
      { publishStatus },
      { new: true }
    )
    if (!bio) return res.status(404).json({ message: 'Biography not found' })
    res.json(bio)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
