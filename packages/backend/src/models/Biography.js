import mongoose from 'mongoose'

const biographySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: String,
    // Timeline entries
    timelineEntries: [
      {
        year: Number,
        month: Number,
        title: String,
        description: String,
        mediaUrls: [String],
        location: String,
        tags: [String],
        entryType: {
          type: String,
          enum: ['life_event', 'memory', 'achievement', 'relationship', 'other'],
          default: 'memory'
        }
      }
    ],
    // Ingested media
    mediaItems: [
      {
        url: String,
        type: { type: String, enum: ['photo', 'video', 'audio', 'document'] },
        transcription: String,
        processedAt: Date,
        tags: [String]
      }
    ],
    // AI-generated outputs
    autobiographyDraft: String,
    autobiographyGeneratedAt: Date,
    publishStatus: {
      type: String,
      enum: ['draft', 'private', 'family', 'public'],
      default: 'draft'
    }
  },
  { timestamps: true }
)

export default mongoose.model('Biography', biographySchema)
