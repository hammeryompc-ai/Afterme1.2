import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['will', 'insurance', 'financial', 'medical', 'legal', 'password', 'personal', 'other'],
      default: 'other'
    },
    description: String,
    fileUrl: String,
    fileName: String,
    mimeType: String,
    // For password vault entries
    passwordEntry: {
      service: String,
      username: String,
      encryptedPassword: String,
      url: String
    },
    // Executor access
    executorIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Release conditions
    releaseCondition: {
      type: String,
      enum: ['immediate', 'on_death', 'scheduled', 'manual'],
      default: 'manual'
    },
    releaseDate: Date,
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

export default mongoose.model('Document', documentSchema)
