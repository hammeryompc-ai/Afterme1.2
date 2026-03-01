import mongoose from 'mongoose'

const biographyProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: { type: String, required: true },
    mediaAssets: [
      {
        type: { type: String, enum: ['photo', 'video', 'audio', 'document', 'transcript'] },
        url: String,
        title: String,
        description: String,
        date: Date,
        processed: { type: Boolean, default: false }
      }
    ],
    timeline: [
      {
        year: Number,
        month: Number,
        title: { type: String, required: true },
        description: String,
        mediaUrls: [String],
        location: String
      }
    ],
    chapters: [
      {
        order: Number,
        title: { type: String, required: true },
        content: String,
        generatedBy: { type: String, enum: ['ai', 'human', 'hybrid'], default: 'ai' }
      }
    ],
    autobiographyOutput: {
      text: String,
      generatedAt: Date,
      format: { type: String, enum: ['pdf', 'epub', 'web'], default: 'web' }
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'review', 'complete'],
      default: 'draft'
    }
  },
  { timestamps: true }
)

export default mongoose.model('BiographyProject', biographyProjectSchema)
